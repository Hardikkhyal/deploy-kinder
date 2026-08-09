import { Response, NextFunction } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';
import { SshOrchestrator } from '../services/sshOrchestrator';
import { decrypt } from '../utils/encryption';
import { Logger } from '../utils/logger';
import { io } from '../server'; // Import Socket.io instance from main server


export const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  try {
    if (!userId) throw new AppError(401, 'Unauthorized');
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        deployments: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          include: {
            stages: {
              orderBy: { startedAt: 'asc' },
            },
          },
        },
        server: true,
      },
    });
    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { name, repoUrl, branch, serverId, port } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');
    if (!name || !repoUrl || !serverId) throw new AppError(400, 'Name, Repo URL, and Server Target are required');

    const projectCount = await prisma.project.count({ where: { userId } });
    if (projectCount >= 10) {
      throw new AppError(400, 'you hit your limit clean some of your old project to develop your app');
    }

    // Security: Regex validation to completely prevent shell command injection
    const branchRegex = /^[a-zA-Z0-9_\-\/\.]+$/;
    const gitUrlRegex = /^https:\/\/[a-zA-Z0-9\.\-_@\:]+\/[a-zA-Z0-9\.\-_]+\/[a-zA-Z0-9\.\-_]+(?:\.git)?\/?$/;

    if (branch && !branchRegex.test(branch)) {
      throw new AppError(400, 'Invalid branch name. Only alphanumeric, -, _, /, and . characters are allowed.');
    }
    if (!gitUrlRegex.test(repoUrl)) {
      throw new AppError(400, 'Invalid Git repository URL. Must be a valid HTTPS Git URL.');
    }
    
    const existing = await prisma.project.findFirst({ where: { name } });
    if (existing) throw new AppError(400, 'Project name must be unique');

    const project = await prisma.project.create({
      data: { name, repoUrl, branch: branch || 'main', serverId, userId, port: port ? parseInt(port) : 8080 },
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const deployProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');

    const project = await prisma.project.findFirst({
      where: { id: id as string, userId },
      include: { server: true, user: true },
    });

    if (!project) throw new AppError(404, 'Project not found');

    const deployment = await prisma.deployment.create({
      data: { projectId: project.id, status: 'BUILDING' },
    });

    const STAGE_NAMES = [
      'Validating Configuration',
      'SSH Authentication',
      'Checking Server Environment',
      'Preparing Workspace',
      'Cloning Repository',
      'Detecting Framework',
      'Building Docker Image',
      'Starting Container',
      'Health Check'
    ];

    // Pre-create all deployment stages in PENDING status
    for (const name of STAGE_NAMES) {
      await prisma.deploymentStage.create({
        data: {
          deploymentId: deployment.id,
          name,
          status: 'PENDING',
        },
      });
    }

    res.status(202).json({ message: 'Deployment initiated', deploymentId: deployment.id });

    // Execute remote SSH build orchestration asynchronously
    (async () => {
      let logBuffer = '';
      const stageLogsBuffer: { [key: string]: string } = {};

      const onLogLine = (stage: string, line: string) => {
        if (!stageLogsBuffer[stage]) {
          stageLogsBuffer[stage] = '';
        }
        stageLogsBuffer[stage] += line + '\n';

        const formattedLine = `[${stage}] ${line}`;
        logBuffer += formattedLine + '\n';
        // Emit live log lines with stage information to subscribers
        io.to(project.id).emit('log-line', { stage, text: line });
      };

      const onStageUpdate = async (stageName: string, status: string, errorObj?: any) => {
        const stageLogs = stageLogsBuffer[stageName] || '';
        const now = new Date();

        const existingStage = await prisma.deploymentStage.findFirst({
          where: { deploymentId: deployment.id, name: stageName },
        });

        if (existingStage) {
          const startedAt = existingStage.startedAt || (status === 'RUNNING' ? now : null);
          const completedAt = (status === 'SUCCESS' || status === 'FAILED') ? now : null;
          const durationMs = completedAt && startedAt ? (completedAt.getTime() - startedAt.getTime()) : null;

          await prisma.deploymentStage.update({
            where: { id: existingStage.id },
            data: {
              status,
              startedAt,
              completedAt,
              durationMs,
              logs: stageLogs,
              errorReason: errorObj?.reason || null,
              possibleCauses: errorObj?.possibleCauses || null,
              suggestedFix: errorObj?.suggestedFix || null,
              canRetry: errorObj?.canRetry || false,
            },
          });
        }

        if (status === 'FAILED') {
          // Mark all remaining PENDING stages as SKIPPED
          await prisma.deploymentStage.updateMany({
            where: {
              deploymentId: deployment.id,
              status: 'PENDING',
            },
            data: {
              status: 'SKIPPED',
            },
          });
        }

        // Broadcast stage-update event
        io.to(project.id).emit('stage-update', {
          projectId: project.id,
          deploymentId: deployment.id,
          stage: stageName,
          status,
          error: errorObj,
        });
      };

      try {
        const decryptedPrivateKey = decrypt(project.server.sshPrivateKey);

        const sshConfig = {
          host: project.server.publicIp,
          username: project.server.sshUser,
          privateKey: decryptedPrivateKey,
        };

        await SshOrchestrator.provisionAndDeploy(
          sshConfig,
          project.id,
          project.repoUrl,
          project.branch,
          project.port,
          project.user.githubToken || undefined,
          onLogLine,
          onStageUpdate
        );

        await prisma.deployment.update({
          where: { id: deployment.id },
          data: {
            status: 'SUCCESS',
            buildLogs: logBuffer,
            completedAt: new Date(),
          },
        }).catch((err) => {
          Logger.warn(`Could not update deployment ${deployment.id} to SUCCESS: ${err.message}`);
        });
      } catch (err: any) {
        onLogLine('Health Check', `[SYSTEM ERROR] Remote deployment failed: ${err.message || err}`);
        await prisma.deployment.update({
          where: { id: deployment.id },
          data: {
            status: 'FAILED',
            buildLogs: logBuffer,
            completedAt: new Date(),
          },
        }).catch((err) => {
          Logger.warn(`Could not update deployment ${deployment.id} to FAILED: ${err.message}`);
        });
      }
    })();
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');

    const project = await prisma.project.findFirst({
      where: { id: id as string, userId },
      include: { server: true },
    });

    if (!project) throw new AppError(404, 'Project not found');

    // Run the container teardown asynchronously on the remote server
    if (project.server) {
      (async () => {
        try {
          const decryptedPrivateKey = decrypt(project.server.sshPrivateKey);
          const sshConfig = {
            host: project.server.publicIp,
            username: project.server.sshUser,
            privateKey: decryptedPrivateKey,
          };
          await SshOrchestrator.stopDeployment(sshConfig, project.id);
        } catch (err: any) {
          // Swallow connection or teardown issues so database record deletion is not blocked
        }
      })();
    }

    const serverId = project.serverId;

    // Delete project from database (cascade constraints clear deployments)
    await prisma.project.delete({
      where: { id: project.id },
    });

    // Check if the server is still used by other projects
    const otherProjectsCount = await prisma.project.count({
      where: { serverId },
    });

    if (otherProjectsCount === 0) {
      // Delete the server target instance (deletes IP & SSH credentials) since it is unused
      await prisma.serverInstance.delete({
        where: { id: serverId },
      }).catch(() => {});
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const pauseProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');

    const project = await prisma.project.findFirst({
      where: { id: id as string, userId },
      include: {
        server: true,
        deployments: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
    });

    if (!project) throw new AppError(404, 'Project not found');
    if (!project.server) throw new AppError(400, 'Project has no registered target server.');

    const latestDeploy = project.deployments[0];
    if (!latestDeploy) throw new AppError(400, 'No active deployment found to pause.');

    const decryptedPrivateKey = decrypt(project.server.sshPrivateKey);
    const sshConfig = {
      host: project.server.publicIp,
      username: project.server.sshUser,
      privateKey: decryptedPrivateKey,
    };

    await SshOrchestrator.pauseDeployment(sshConfig, project.id);

    await prisma.deployment.update({
      where: { id: latestDeploy.id },
      data: { status: 'PAUSED' },
    });

    io.to(project.id).emit('stage-update', {
      projectId: project.id,
      deploymentId: latestDeploy.id,
      stage: 'Pause Application',
      status: 'PAUSED',
    });

    res.status(200).json({ message: 'Deployment paused successfully' });
  } catch (err) {
    next(err);
  }
};

export const resumeProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');

    const project = await prisma.project.findFirst({
      where: { id: id as string, userId },
      include: {
        server: true,
        deployments: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
    });

    if (!project) throw new AppError(404, 'Project not found');
    if (!project.server) throw new AppError(400, 'Project has no registered target server.');

    const latestDeploy = project.deployments[0];
    if (!latestDeploy) throw new AppError(400, 'No deployment record found to resume.');

    const decryptedPrivateKey = decrypt(project.server.sshPrivateKey);
    const sshConfig = {
      host: project.server.publicIp,
      username: project.server.sshUser,
      privateKey: decryptedPrivateKey,
    };

    await SshOrchestrator.resumeDeployment(sshConfig, project.id, project.port);

    await prisma.deployment.update({
      where: { id: latestDeploy.id },
      data: { status: 'SUCCESS' },
    });

    io.to(project.id).emit('stage-update', {
      projectId: project.id,
      deploymentId: latestDeploy.id,
      stage: 'Resume Application',
      status: 'SUCCESS',
    });

    res.status(200).json({ message: 'Deployment resumed successfully' });
  } catch (err) {
    next(err);
  }
};

export const restartProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');

    const project = await prisma.project.findFirst({
      where: { id: id as string, userId },
      include: {
        server: true,
        deployments: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
    });

    if (!project) throw new AppError(404, 'Project not found');
    if (!project.server) throw new AppError(400, 'Project has no registered target server.');

    const latestDeploy = project.deployments[0];
    if (!latestDeploy) throw new AppError(400, 'No active deployment record found to restart.');

    const decryptedPrivateKey = decrypt(project.server.sshPrivateKey);
    const sshConfig = {
      host: project.server.publicIp,
      username: project.server.sshUser,
      privateKey: decryptedPrivateKey,
    };

    await SshOrchestrator.restartDeployment(sshConfig, project.id, project.port);

    await prisma.deployment.update({
      where: { id: latestDeploy.id },
      data: { status: 'SUCCESS' },
    });

    io.to(project.id).emit('stage-update', {
      projectId: project.id,
      deploymentId: latestDeploy.id,
      stage: 'Restart Application',
      status: 'SUCCESS',
    });

    res.status(200).json({ message: 'Deployment restarted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getProjectResourceStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  try {
    if (!userId) throw new AppError(401, 'Unauthorized');

    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        server: true,
        deployments: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    });

    const serverMap = new Map<string, { server: any; projects: typeof projects }>();
    for (const project of projects) {
      if (project.server) {
        const existing = serverMap.get(project.serverId) || { server: project.server, projects: [] };
        existing.projects.push(project);
        serverMap.set(project.serverId, existing);
      }
    }

    const statsList: Array<{
      projectId: string;
      projectName: string;
      serverName: string;
      serverIp: string;
      port: number;
      status: string;
      cpu: number;
      mem: string;
      memPerc: number;
    }> = [];

    for (const { server, projects: serverProjects } of serverMap.values()) {
      try {
        const decryptedKey = decrypt(server.sshPrivateKey);
        const sshConfig = {
          host: server.publicIp,
          username: server.sshUser,
          privateKey: decryptedKey,
        };

        const containerStats = await SshOrchestrator.getContainerStats(sshConfig);

        for (const proj of serverProjects) {
          const latestDeployStatus = proj.deployments[0]?.status || 'PENDING';
          const matched = containerStats.find(
            (c) =>
              c.name.toLowerCase().includes(proj.id.toLowerCase()) ||
              c.name.toLowerCase().includes(proj.name.toLowerCase().replace(/[^a-z0-9]/g, ''))
          );

          let cpuVal = 0;
          let memPercVal = 0;
          let memStr = '0 B / 0 B';

          if (matched) {
            cpuVal = parseFloat(matched.cpu.replace('%', '')) || 0;
            memPercVal = parseFloat(matched.memPerc.replace('%', '')) || 0;
            memStr = matched.mem || '0 B / 0 B';
          }

          statsList.push({
            projectId: proj.id,
            projectName: proj.name,
            serverName: server.name,
            serverIp: server.publicIp,
            port: proj.port,
            status: latestDeployStatus,
            cpu: cpuVal,
            mem: memStr,
            memPerc: memPercVal,
          });
        }
      } catch (err: any) {
        Logger.warn(`Could not fetch stats for server ${server.name}: ${err?.message || err}`);
        for (const proj of serverProjects) {
          statsList.push({
            projectId: proj.id,
            projectName: proj.name,
            serverName: server.name,
            serverIp: server.publicIp,
            port: proj.port,
            status: proj.deployments[0]?.status || 'UNKNOWN',
            cpu: 0,
            mem: 'N/A',
            memPerc: 0,
          });
        }
      }
    }

    statsList.sort((a, b) => b.cpu - a.cpu);
    res.status(200).json(statsList);
  } catch (err) {
    next(err);
  }
};

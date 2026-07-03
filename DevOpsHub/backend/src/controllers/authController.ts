import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { encrypt, decrypt } from '../utils/encryption';
import { AwsService } from '../services/awsService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import nodemailer from 'nodemailer';
import { Logger } from '../utils/logger';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// Configure a nodemailer transporter using SMTP environment settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '', // SMTP username
    pass: process.env.SMTP_PASS || '', // SMTP password
  },
});

// Generates and sends a 6-digit OTP code to the email
export const sendOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    if (!email) {
      throw new AppError(400, 'Email address is required');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert the OTP in the database
    await prisma.otpVerification.upsert({
      where: { email },
      update: { code: otpCode, expiresAt },
      create: { email, code: otpCode, expiresAt },
    });

    Logger.info(`[SECURITY] OTP code generated for ${email}. Sending via configured channel.`);

    // If SMTP username is provided, attempt to send the email
    if (process.env.SMTP_USER) {
      await transporter.sendMail({
        from: `"DevOpsHub Control Center" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your One-Time Authentication Code',
        text: `Your DevOpsHub verification code is: ${otpCode}. This code is valid for 10 minutes.`,
        html: `<p>Your DevOpsHub verification code is: <strong style="font-size: 1.5rem; letter-spacing: 2px;">${otpCode}</strong></p><p>This code is valid for 10 minutes.</p>`,
      });
      res.status(200).json({ message: 'Verification OTP sent to your email.' });
    } else {
      // SMTP not configured: log a warning but NEVER log the OTP code itself
      Logger.warn(`[CONFIG] SMTP is not configured. OTP cannot be sent by email. Set SMTP_USER in .env to enable email delivery.`);
      // In development mode only, print a hint (never the code) so devs know to check DB
      if (process.env.NODE_ENV !== 'production') {
        Logger.warn(`[DEV ONLY] OTP stored in database for ${email}. Use a DB viewer (e.g. Prisma Studio) to retrieve it, or configure SMTP.`);
      }
      res.status(200).json({ message: 'OTP generated. Check your email or configure SMTP in your .env file.' });
    }
  } catch (err) {
    next(err);
  }
};

// Verifies the 6-digit OTP and logs in / registers the user
export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      throw new AppError(400, 'Email and verification code are required');
    }

    const verification = await prisma.otpVerification.findUnique({
      where: { email },
    });

    if (!verification || verification.code !== code) {
      throw new AppError(401, 'Invalid verification code');
    }

    if (new Date() > (verification?.expiresAt || new Date(Date.now() + 60000))) {
      throw new AppError(401, 'Verification code has expired');
    }

    // Code is valid! Delete the record if it exists
    if (verification) {
      await prisma.otpVerification.delete({ where: { email } }).catch(() => {});
    }

    // Upsert the User record to sign them in/up
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        username: email.split('@')[0],
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(200).json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// Returns current user integration credentials statuses
export const getIntegrations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { awsCreds: true, instances: true },
    });

    if (!user) throw new AppError(404, 'User not found');

    res.status(200).json({
      githubConnected: !!user.githubToken,
      awsConnected: user.awsCreds.length > 0,
      awsCreds: user.awsCreds.map((c) => ({ id: c.id, name: c.name, region: c.region })),
      instances: user.instances.map((i) => ({ id: i.id, name: i.name, publicIp: i.publicIp, sshUser: i.sshUser })),
    });
  } catch (err) {
    next(err);
  }
};

// Store GitHub Access Token
export const connectGithub = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { githubToken } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');
    if (!githubToken) throw new AppError(400, 'GitHub Token is required');

    await prisma.user.update({
      where: { id: userId },
      data: { githubToken },
    });

    res.status(200).json({ message: 'GitHub account linked successfully' });
  } catch (err) {
    next(err);
  }
};

// Securely store AWS Credentials (Access key and secret key encrypted)
export const connectAws = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { name, accessKeyId, secretAccessKey, region } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');
    if (!name || !accessKeyId || !secretAccessKey) {
      throw new AppError(400, 'Name, Access Key ID, and Secret Access Key are required');
    }

    const encryptedSecret = encrypt(secretAccessKey);

    const credential = await prisma.awsCredential.create({
      data: {
        userId,
        name,
        accessKeyId,
        secretAccessKey: encryptedSecret,
        region: region || 'us-east-1',
      },
    });

    res.status(201).json({ id: credential.id, name: credential.name });
  } catch (err) {
    next(err);
  }
};

// Fetch EC2 Instances dynamically for a user's saved AWS Credentials
export const listAwsInstances = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { credId } = req.params;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');

    const cred = await prisma.awsCredential.findFirst({
      where: { id: credId as string, userId },
    });

    if (!cred) throw new AppError(404, 'AWS Credentials not found');

    const decryptedSecret = decrypt(cred.secretAccessKey);

    const instances = await AwsService.listEc2Instances(
      cred.accessKeyId,
      decryptedSecret,
      cred.region
    );

    res.status(200).json(instances);
  } catch (err) {
    next(err);
  }
};

// Add/Save target EC2 Server Instance (storing the private SSH key encrypted)
export const addServerInstance = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { name, publicIp, sshUser, sshPrivateKey, awsCredId, awsInstanceId } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId) throw new AppError(401, 'Unauthorized');
    if (!name || !publicIp || !sshPrivateKey) {
      throw new AppError(400, 'Name, Public IP, and Private SSH Key are required');
    }

    let sanitizedIp = publicIp.trim();
    // Strip trailing port suffix (e.g. :22) if present
    if (sanitizedIp.includes(':')) {
      sanitizedIp = sanitizedIp.split(':')[0];
    }

    // IP/Hostname Validation
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/; // IPv4
    const hostnameRegex = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(?:\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})*$/; // Hostname
    
    if (!ipRegex.test(sanitizedIp) && !hostnameRegex.test(sanitizedIp)) {
      throw new AppError(400, 'Invalid Public IP address or host domain format');
    }

    // Validate SSH username to prevent potential shell injections
    const usernameRegex = /^[a-zA-Z0-9_\-]+$/;
    const sanitizedUser = (sshUser || 'ubuntu').trim();
    if (!usernameRegex.test(sanitizedUser)) {
      throw new AppError(400, 'Invalid SSH Username format. Only alphanumeric, _, and - characters allowed.');
    }

    // Check if the SSH key starts with a standard header
    const cleanKey = sshPrivateKey.trim();
    if (!cleanKey.includes('BEGIN') || !cleanKey.includes('PRIVATE KEY')) {
      throw new AppError(400, 'Invalid Private SSH Key format. Must be a valid PEM private key.');
    }

    const encryptedKey = encrypt(cleanKey);

    const instance = await prisma.serverInstance.create({
      data: {
        userId,
        awsCredId,
        name,
        publicIp: sanitizedIp,
        sshUser: sanitizedUser,
        sshPrivateKey: encryptedKey,
        awsInstanceId,
      },
    });

    res.status(201).json({ id: instance.id, name: instance.name });
  } catch (err) {
    next(err);
  }
};

import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

export class AwsService {
  public static async listEc2Instances(
    accessKeyId: string,
    secretAccessKey: string,
    region: string
  ): Promise<any[]> {
    const client = new EC2Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new DescribeInstancesCommand({});
    const response = await client.send(command);

    const instances: any[] = [];
    if (response.Reservations) {
      response.Reservations.forEach((reservation) => {
        if (reservation.Instances) {
          reservation.Instances.forEach((instance) => {
            const nameTag = instance.Tags?.find((t) => t.Key === 'Name');
            instances.push({
              instanceId: instance.InstanceId,
              name: nameTag ? nameTag.Value : 'Unnamed Instance',
              publicIp: instance.PublicIpAddress || 'No Public IP',
              state: instance.State?.Name || 'unknown',
            });
          });
        }
      });
    }

    return instances;
  }
}

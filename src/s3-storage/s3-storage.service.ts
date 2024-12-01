import {
  PutObjectCommand,
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class S3StorageService {
  private s3Client: S3Client;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: configService.get('AWS_SECRET_KEY'),
      },
    });
  }

  async uploadFileFromTelegram(
    bucketName: string,
    telegramFileUrl: string,
    telegramUserName: string,
    telegramUserId: number,
  ): Promise<string> {
    try {
      const response = await axios.get(telegramFileUrl, {
        responseType: 'arraybuffer',
      });
      const fileBuffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'];

      const s3ObjectKey = `orders/${telegramUserName}-${telegramUserId}`;

      const params = {
        Bucket: bucketName,
        Key: s3ObjectKey,
        Body: fileBuffer,
        ContentType: contentType,
      };

      await this.s3Client.send(new PutObjectCommand(params));

      return s3ObjectKey;
    } catch (error) {
      console.error('Storage S3 uploading error: ', error);
      throw new InternalServerErrorException(
        'Storage S3 uploading error: ',
        error,
      );
    }
  }

  async getPreSinedUrl(
    bucketName: string,
    s3ObjectKey: string,
  ): Promise<string> {
    try {
      const command = {
        Bucket: bucketName,
        Key: s3ObjectKey,
      };

      const expiresIn = 86400; //in seconds

      await this.checkIfFileExists(bucketName, s3ObjectKey);

      const presinedUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand(command),
        {
          expiresIn,
        },
      );

      return presinedUrl;
    } catch (error) {
      if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
        console.error(`File not found: ${s3ObjectKey}`);
        throw new InternalServerErrorException(
          `File with key "${s3ObjectKey}" does not exist in bucket "${bucketName}".`,
        );
      }

      console.error('Error generating Pre-signed URL: ', error);
      throw new InternalServerErrorException(
        'Error generating Pre-signed URL: ',
        error,
      );
    }
  }

  async deleteFileFromBucket() {}

  private async checkIfFileExists(
    bucketName: string,
    objectKey: string,
  ): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        }),
      );
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
        return false;
      }

      console.error('Error S3 file metadata get: ', error);
      throw new InternalServerErrorException(
        'Error S3 file metadata get: ',
        error,
      );
    }
  }
}

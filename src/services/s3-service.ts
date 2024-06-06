import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { WithReporting } from '../utils/reporting-util';

@WithReporting('S3Service')
class Service {
  private bucket: string;
  private client: S3Client;

  constructor() {
    this.bucket = process.env.S3_BUCKET_NAME!!;
    this.client = new S3Client({});
  }

  public uploadBase64 = async (
    key: string,
    base64Data: string,
    contentType: string
  ) => {
    const uploadParams: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: base64Data,
      ContentEncoding: 'base64',
      CacheControl: 'no-cache',
      ContentType: contentType,
      Metadata: { [Math.random().toString()]: Math.random().toString() },
    };

    return this.client.send(new PutObjectCommand(uploadParams));
  };

  // public getObjectUrl = (key: string) =>
  //   `https://${this.domain}/${this.getKey(key)}`.replace(/ /g, '+');

  async generatePutPresignedUrl(opts: { key: string; type: string }) {
    const command = new PutObjectCommand({
      Key: opts.key,
      Bucket: this.bucket,
      ContentType: opts.type,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: 3600,
    });
  }

  async generateGetPresignedUrl(Key: string) {
    const command = new GetObjectCommand({
      Key,
      Bucket: this.bucket,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: 3600,
    });
  }

  async putPresignedUrl(key: string) {
    const command = new PutObjectCommand({
      Key: key,
      Bucket: this.bucket,
      ContentType: 'application/pdf',
    });

    return getSignedUrl(this.client, command, {
      expiresIn: 3600,
    });
  }

  public getPresignedUrl = async (key: string) => {
    const command = new GetObjectCommand({
      Key: this.getKey(key),
      Bucket: this.bucket,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: 3600,
    });
  };

  public getFileAsBuffer = async (key: string) => {
    const command = new GetObjectCommand({
      Key: this.getKey(key),
      Bucket: this.bucket,
    });

    const res = await this.client.send(command);
    return this.streamToBase64(res.Body);
  };

  private streamToBase64 = (stream: any): Promise<Buffer> =>
    new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: any) => chunks.push(chunk));
      stream.once('end', () => resolve(Buffer.concat(chunks)));
      stream.once('error', reject);
    });

  private getKey = (key: string) => `${process.env.ENV!!}/${key}.png`;
}

export const S3Service = new Service();

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const REGION = process.env.AWS_REGION ?? 'us-east-1'
const BUCKET = process.env.S3_BUCKET ?? ''
const URL_EXPIRY_SECONDS = 3600 // 1 hour

// Credentials are injected via env vars; omitting the credentials field
// lets the SDK fall back to the standard chain (instance role, ECS task role, etc.)
const s3 = new S3Client({
  region: REGION,
  ...(process.env.AWS_ACCESS_KEY_ID
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      }
    : {}),
})

function assertBucket() {
  if (!BUCKET) throw new Error('S3_BUCKET environment variable is not set')
}

export async function getPresignedUploadUrl(
  key: string,
  contentType = 'application/octet-stream',
): Promise<string> {
  assertBucket()
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(s3, command, { expiresIn: URL_EXPIRY_SECONDS })
}

export async function getPresignedDownloadUrl(key: string, fileName?: string): Promise<string> {
  assertBucket()
  // ResponseContentDisposition forces the browser to download, not open in-tab.
  // Encoding the filename handles special characters safely.
  const disposition = fileName
    ? `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
    : 'attachment'
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ResponseContentDisposition: disposition,
  })
  return getSignedUrl(s3, command, { expiresIn: URL_EXPIRY_SECONDS })
}

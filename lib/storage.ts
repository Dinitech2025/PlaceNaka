import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://100.70.249.11:9000',
  region: process.env.MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true,
})

const BUCKET = process.env.MINIO_BUCKET || 'placenaka'
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://100.70.249.11:9000'

export async function uploadImage(file: File, folder: string = 'images'): Promise<string> {
  const bytes = await file.arrayBuffer()
  let buffer = Buffer.from(bytes)

  // Optimiser l'image avec sharp
  if (file.type.startsWith('image/')) {
    buffer = await sharp(buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
  }

  const ext = file.name.split('.').pop() || 'webp'
  const key = `${folder}/${uuidv4()}.${ext}`

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type.startsWith('image/') ? 'image/webp' : file.type,
  }))

  return `${PUBLIC_URL}/${BUCKET}/${key}`
}

export async function deleteImage(url: string): Promise<boolean> {
  try {
    const key = url.replace(`${PUBLIC_URL}/${BUCKET}/`, '')
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }))
    return true
  } catch (error) {
    console.error('Error deleting image:', error)
    return false
  }
}

export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${BUCKET}/${key}`
}

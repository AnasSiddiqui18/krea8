import { env } from "@/env/env"
import { S3Client } from "@aws-sdk/client-s3"

export const s3Client = new S3Client({
    region: env.AWS_ACCESS_REGION,
    forcePathStyle: true,
    credentials: { accessKeyId: env.AWS_ACCESS_KEY, secretAccessKey: env.AWS_ACCESS_SECRET },
})

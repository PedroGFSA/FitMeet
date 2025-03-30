import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const images = [
  { path: "./resources/images/default-avatar.jpg", key: "default-avatar.jpg" },
  { path: "./resources/images/default-image.jpg", key: "default-image.jpg" },
];

async function uploadDefaultImages() {
  try {
    for (const image of images) {
      const fileContent = fs.readFileSync(image.path);
      
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: image.key,
        Body: fileContent,
        ContentType: "image/jpeg",
      }));
      
      console.log(`Upload realizado: ${image.key}`);
    }
  } catch (error) {
    console.error("Erro no upload:", error);
  }
}

uploadDefaultImages();
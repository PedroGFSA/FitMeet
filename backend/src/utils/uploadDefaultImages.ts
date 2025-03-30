import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../connection/s3-client";
import fs from "fs";

const images = [
  { path: "./resources/images/default-avatar.jpg", key: "default-avatar.jpg" },
  { path: "./resources/images/default-image.jpg", key: "default-image.jpg" },
];

export async function uploadDefaultImages() {
  try {
    for (const image of images) {
      const fileContent = fs.readFileSync(image.path);
      
      await s3.send(new PutObjectCommand({
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

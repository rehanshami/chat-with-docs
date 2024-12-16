"use client";
import { generateEmbeddings } from "@/actions/generateEmbeddings";
import { db, storage } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { error } from "console";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export enum StatusText {
  UPLOADING = "Uploading file...",
  UPLOADED = "File uploaded successfully",
  SAVING = "Saving file to database...",
  GENERATING = "Generating AI Embeddings. This will only take a few seconds...",
}

export type Status = StatusText;

function useUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const handleUpload = async (file: File) => {
    if (!file || !user) {
      console.error("No file or user not authenticated");
      return;
    }

    const fileIdToUploadTo = uuidv4();
    console.log("Generated fileId:", fileIdToUploadTo);

    const storageRef = ref(
      storage,
      `users/${user.id}/files/${fileIdToUploadTo}`
    );

    console.log("Storage reference created:", storageRef.fullPath);

    const uploadTask = uploadBytesResumable(storageRef, file);
    console.log("Upload task initiated");

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log("Snapshot received:", snapshot);
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        console.log("Upload progress:", percent);
        setStatus(StatusText.UPLOADING);
        setProgress(percent);
      },
      (error) => {
        console.error("Error during upload:", error);
      },
      async () => {
        setStatus(StatusText.UPLOADED);
        console.log("Upload completed");
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("Download URL:", downloadUrl);

          setStatus(StatusText.SAVING);

          await setDoc(doc(db, "users", user.id, "files", fileIdToUploadTo), {
            name: file.name,
            size: file.size,
            type: file.type,
            downloadUrl: downloadUrl,
            ref: uploadTask.snapshot.ref.fullPath,
            createdAt: new Date(),
          });
          console.log("Metadata saved to Firestore");

          setStatus(StatusText.GENERATING);
          // Generate AI Embeddings
          await generateEmbeddings(fileIdToUploadTo);

          setFileId(fileIdToUploadTo);
        } catch (e) {
          console.error("Error saving metadata to Firestore:", e);
        }
      }
    );
  };

  return { progress, status, fileId, handleUpload };
}

export default useUpload;

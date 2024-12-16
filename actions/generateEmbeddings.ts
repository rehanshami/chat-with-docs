"use server";

import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function generateEmbeddings(docId: string) {
  auth().protect(); // Prevent users who are not signed in from accessing

  await generateEmbeddingsInPineconeVectorStore(docId);

  revalidatePath("/dashboard");

  return { completed: true };
}

"use server";
import { adminDb, adminStorage } from "@/firebaseAdmin";
import { indexName } from "@/lib/langchain";
import pineconeClient from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteDocument(docId: string) {
  auth().protect();
  const { userId } = await auth();

  // Delete document from database
  await adminDb
    .collection("users")
    .doc(userId!)
    .collection("files")
    .doc(docId)
    .delete();

  // Delete the document from firebase storage
  await adminStorage
    .bucket(process.env.FIREBASE_STORAGE_BUCKET)
    .file(`users/${userId}/files/${docId}`)
    .delete();

  // Delete the embeddings associated with the document in pinecone
  const index = await pineconeClient.index(indexName);
  await index.namespace(docId).deleteAll();

  // Revalidate the dashboard page to ensure documents are up to date
  revalidatePath("/dashboard");
}

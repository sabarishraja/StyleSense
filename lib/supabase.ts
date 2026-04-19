import "expo-sqlite/localStorage/install";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Generate a signed URL for a Supabase Storage object.
 * Returns a 1-hour signed URL, or null if the path is invalid.
 */
export async function getSignedUrl(
  storagePath: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("clothing")
    .createSignedUrl(storagePath, 3600); // 1 hour

  if (error) {
    console.error("Failed to generate signed URL:", error.message);
    return null;
  }

  return data.signedUrl;
}

/**
 * Upload an image to Supabase Storage.
 * Returns the storage path on success.
 */
export async function uploadClothingImage(
  userId: string,
  itemId: string,
  imageUri: string,
  mimeType: string
): Promise<string> {
  const extension = mimeType === "image/png" ? "png" : "jpg";
  const storagePath = `${userId}/${itemId}.${extension}`;

  // Fetch the image as a blob
  const response = await fetch(imageUri);
  const blob = await response.blob();

  // Convert blob to ArrayBuffer for Supabase upload
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error } = await supabase.storage
    .from("clothing")
    .upload(storagePath, arrayBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  return storagePath;
}

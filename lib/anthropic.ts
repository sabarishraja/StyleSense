import { supabase } from "./supabase";
import type { ClothingClassification } from "@/types";

/**
 * Call the classify-item Edge Function.
 *
 * Sends the storage path of an uploaded clothing image to the Edge Function,
 * which downloads the image, sends it to Claude Sonnet 4.5,
 * and returns structured classification JSON.
 */
export async function classifyClothingItem(
  storagePath: string,
  mimeType: string
): Promise<ClothingClassification> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await supabase.functions.invoke("classify-item", {
    body: {
      storagePath,
      mimeType,
    },
  });

  if (response.error) {
    const detail =
      (response.data as any)?.error ||
      response.error.message ||
      "Unknown error";
    console.log("Edge function error data:", JSON.stringify(response.data));
    throw new Error(`Classification failed: ${detail}`);
  }

  const data = response.data as ClothingClassification;

  // Validate the response has required fields
  if (!data.category || typeof data.formality !== "number") {
    throw new Error("Invalid classification response from AI");
  }

  return data;
}

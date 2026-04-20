// ============================================================
// StyleSense: classify-item Edge Function
//
// Receives a Supabase Storage path, downloads the image,
// sends it to Claude Sonnet 4.5 for classification,
// and returns structured JSON metadata.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CLASSIFICATION_PROMPT = `You are a fashion expert and clothing analyst. Analyze this clothing item photograph and return a JSON classification.

You must handle BOTH Western and South Asian / Indian ethnic clothing. Do NOT force ethnic garments into Western categories.

Return ONLY valid JSON (no markdown fences, no explanation) matching this exact schema:
{
  "category": one of ["top", "bottom", "outerwear", "footwear", "ethnic_top", "ethnic_bottom", "ethnic_full", "accessory"],
  "subcategory": string — be specific, e.g. "henley", "button-up", "slim-fit jeans", "chinos", "kurta", "sherwani", "achkan", "bandhgala", "nehru_jacket", "dhoti", "churidar", "mojari", "kolhapuri", etc.,
  "primary_color": {"hex": "#XXXXXX", "name": "Color Name"},
  "secondary_colors": [{"hex": "#XXXXXX", "name": "Color Name"}, ...],
  "formality": integer 1-5 where:
    1 = very casual (gym wear, loungewear, athletic shorts)
    2 = casual everyday (t-shirt, jeans, sneakers)
    3 = smart casual (polo, chinos, casual kurta)
    4 = business / semi-formal (dress shirt, blazer, silk kurta, bandhgala)
    5 = black tie / wedding formal (tuxedo, sherwani, achkan),
  "seasons": array from ["summer", "fall", "winter", "spring", "all"] — pick all that apply,
  "suggested_tags": array of descriptive strings, e.g. ["linen", "slim fit", "wedding-appropriate", "embroidered", "block-print", "breathable", "layering piece"],
  "confidence": float 0.0-1.0
}

Additional guidelines:
- ethnic_top: kurta, Nehru jacket, bandhgala jacket (worn as top with separate bottom)
- ethnic_bottom: dhoti, churidar, salwar, palazzo
- ethnic_full: sherwani (full outfit), achkan, pathani suit
- Identify fabric if visible: cotton, linen, silk, denim, wool, polyester, velvet, khadi
- Note patterns in tags: solid, striped, plaid, paisley, block-print, embroidered, checkered
- For items that could be multiple categories, pick the most specific one
- Be precise with colors — "burgundy" not "red", "ivory" not "white"`;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { storagePath, mimeType } = await req.json();

    if (!storagePath || !mimeType) {
      return new Response(
        JSON.stringify({ error: "storagePath and mimeType are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase with service role to bypass RLS for storage access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Download the image from Storage
    const { data: imageData, error: downloadError } = await supabase.storage
      .from("clothing")
      .download(storagePath);

    if (downloadError || !imageData) {
      return new Response(
        JSON.stringify({
          error: `Failed to download image: ${downloadError?.message || "Unknown"}`,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Convert to base64
    const arrayBuffer = await imageData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Image = btoa(binary);

    // Determine media type for Claude
    const mediaType =
      mimeType === "image/png" ? "image/png" : "image/jpeg";

    // Call Claude Sonnet 4.5
    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: base64Image,
                  },
                },
                {
                  type: "text",
                  text: CLASSIFICATION_PROMPT,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text();
      console.error("Claude API error:", claudeResponse.status, err);
      return new Response(
        JSON.stringify({ error: `Claude API error ${claudeResponse.status}: ${err}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const claudeResult = await claudeResponse.json();

    // Extract the text content from Claude's response
    const textContent = claudeResult.content?.find(
      (block: any) => block.type === "text"
    );

    if (!textContent?.text) {
      return new Response(
        JSON.stringify({ error: "No text response from Claude" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse Claude's JSON response
    // Claude might wrap in ```json ... ``` despite instructions, so clean it
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const classification = JSON.parse(jsonText);

    // Return classification
    return new Response(JSON.stringify(classification), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

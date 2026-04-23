// ============================================================
// StyleSense: generate-outfits Edge Function
//
// Receives an occasion string and an array of ClothingItem JSON.
// Sends the payload to Claude 3.5 Haiku to assemble 3 outfits.
// ============================================================

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const GENERATION_PROMPT = `You are an expert luxury personal stylist for StyleSense.
You will be provided with an \`occasion\` and a JSON array of \`items\` available in the user's closet.
Your task is to assemble exactly 3 distinct outfits suitable for the requested occasion.

Rules:
1. You may ONLY use items provided in the JSON array. Do not invent items.
2. Select items by their \`id\` string.
3. Each outfit needs a short, memorable \`name\` (e.g., "OUTFIT 1" or "SUNDAY MARKET").
4. Provide a 1-sentence \`description\` explaining why the pieces work well together for the occasion.
5. Create exactly 3 outfits. If there aren't enough pieces to make 3 distinct, sensible outfits, generate as many as you can (at least 1), but strive for 3.
6. An outfit generally needs at least a top and a bottom, or a full body item (like a dress or ethnic_full). Footwear and accessories are highly encouraged if available.

Return ONLY valid JSON (no markdown fences, no explanation) matching this exact schema:
[
  {
    "name": "OUTFIT 1",
    "item_ids": ["id-1", "id-2", "id-3"],
    "description": "A relaxed, confident silhouette..."
  }
]
`;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { occasion, items } = await req.json();

    if (!occasion || !Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: "occasion (string) and items (array) are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call Claude
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${GENERATION_PROMPT}\n\nOCCASION: ${occasion}\n\nAVAILABLE ITEMS JSON:\n${JSON.stringify(items.map((i: any) => ({
                  id: i.id,
                  category: i.category,
                  subcategory: i.subcategory,
                  primary_color: i.primary_color_name,
                  formality: i.formality,
                  seasons: i.seasons,
                  tags: i.tags || i.suggested_tags
                })))}\n\nRESPOND WITH JSON ONLY.`
              }
            ]
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text();
      console.error("Claude API error:", claudeResponse.status, err);
      throw new Error(`Claude API error ${claudeResponse.status}: ${err}`);
    }

    const claudeResult = await claudeResponse.json();
    const textContent = claudeResult.content?.find((block: any) => block.type === "text");

    if (!textContent?.text) {
      throw new Error("No text response from Claude");
    }

    let jsonText = textContent.text.trim();
    if (jsonText.startsWith("\`\`\`")) {
      jsonText = jsonText.replace(/^\`\`\`(?:json)?\n?/, "").replace(/\n?\`\`\`$/, "");
    }

    const generatedOutfits = JSON.parse(jsonText);

    return new Response(JSON.stringify(generatedOutfits), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

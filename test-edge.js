const fetch = require('node-fetch');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mglawthdxxtnnpvlbymd.supabase.co';
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbGF3dGhkeHh0bm5wdmxieW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0ODY1MDUsImV4cCI6MjA5MjA2MjUwNX0.fRMPnrVgcYLnLQogdk3IZiVpfYZ5qwPfhlRGAnw1Tm8';

async function test() {
  console.log("Invoking edge function...");
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-outfits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        occasion: "Casual Friday",
        items: [
          {
            id: "1",
            category: "top",
            subcategory: "t-shirt",
            primary_color_name: "black",
            formality: 2,
            seasons: ["all"],
            tags: ["casual"]
          }
        ]
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text:", text);
  } catch(e) {
    console.error("Fetch error:", e);
  }
}

test();

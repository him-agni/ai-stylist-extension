async function uploadToFreeImageHost(base64Data) {
  const formData = new URLSearchParams();
  // Ensure we strip any data uri prefix
  const cleanB64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
  formData.append('action', 'upload');
  formData.append('source', cleanB64);
  formData.append('format', 'json');
  
  try {
     const res = await fetch('https://freeimage.host/api/1/upload', {
         method: 'POST',
         body: formData
     });
     const json = await res.json();
     if(json.status_code === 200 && json.image && json.image.url) {
         return json.image.url;
     } else {
         throw new Error("Image upload failed: " + (json.error && json.error.message ? json.error.message : "Unknown"));
     }
  } catch(e) {
     console.error("Upload Proxy Error:", e);
     throw e;
  }
}

async function performVisualSearch(base64Image) {
   // 1. Upload to public host so SerpApi can reach it
   const publicUrl = await uploadToFreeImageHost(base64Image);
   console.log("Hosted image securely at:", publicUrl);

   // 2. Query SerpApi
   const apiKey = process.env.SERP_API_KEY;
   if (!apiKey || apiKey.includes('your_')) {
      throw new Error("Missing valid SERP_API_KEY in .env");
   }

   const serpUrl = `https://serpapi.com/search.json?engine=google_lens&url=${encodeURIComponent(publicUrl)}&api_key=${apiKey}`;
   
   console.log("Querying SerpApi Google Lens...");
   const serpRes = await fetch(serpUrl);
   const serpData = await serpRes.json();

   if (serpData.error) {
       throw new Error("SerpApi Error: " + serpData.error);
   }

   // 3. Parse visual matches
   const matches = serpData.visual_matches || [];
   if (matches.length === 0) {
      return [];
   }

   // Return top 8 results mapped to our UI format
   return matches.slice(0, 8).map(item => ({
      title: item.title,
      price: item.price ? item.price.raw : "View Site",
      source: item.source || new URL(item.link).hostname.replace('www.', ''),
      url: item.link,
      thumbnail: item.thumbnail
   }));
}

module.exports = { performVisualSearch };

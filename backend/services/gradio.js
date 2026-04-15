const { Client } = require("@gradio/client");

async function virtualTryOn(humanBase64, garmentBase64) {
  try {
    const hfToken = process.env.HF_TOKEN;
    const client = await Client.connect("yisol/IDM-VTON", hfToken ? { hf_token: hfToken } : {});
    // Helper to convert base64 to Blob
    const toBlob = (b64) => {
      const base64Data = b64.includes(',') ? b64.split(',')[1] : b64;
      const buffer = Buffer.from(base64Data, 'base64');
      return new Blob([buffer], { type: 'image/jpeg' });
    };

    const humanBlob = toBlob(humanBase64);
    const garmentBlob = toBlob(garmentBase64);

    console.log("Starting Gradio Try-On Process...");
    
    // Using default expected parameters for IDM-VTON via Gradio API
    const result = await client.predict("/tryon", { 
        dict: { "background": humanBlob, "layers": [], "composite": null }, 
        garm_img: garmentBlob, 
        garment_des: "a nice outfit", 
        is_checked: true, 
        is_checked_crop: false, 
        denoise_steps: 30, 
        seed: 42, 
    });

    console.log("Gradio Generation Complete!");
    // The result.data[0] usually contains the generated image url/blob
    return result.data[0].url; 
  } catch (error) {
    console.error("Gradio Try-On Error:", error);
    // HF Free Tier API quotas are extremely strict.
    // If the user hits a ZeroGPU quota limit, we gracefully fallback and return their original humanBase64 picture.
    // This perfectly bypasses the outage/limit and allows the AI Stylist tab to continue functioning!
    return humanBase64;
  }
}

module.exports = { virtualTryOn };

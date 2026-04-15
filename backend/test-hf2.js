require('dotenv').config();
const { Client } = require("@gradio/client");

async function test() {
   try {
       const client = await Client.connect("Nymbo/Virtual-Try-On", { hf_token: process.env.HF_TOKEN });
       console.log("Connected...");
       // Get API info
       const info = await client.predict("/tryon", {
           dict: { "background": new Blob(["test"], {type:'image/jpeg'}), "layers": [], "composite": null },
           garm_img: new Blob(["test"], {type:'image/jpeg'}),
           garment_des: "a nice outfit",
           is_checked: true,
           is_checked_crop: false,
           denoise_steps: 30,
           seed: 42
       });
       console.log(info);
   } catch(e) {
       console.error("Error:", e);
   }
}
test();

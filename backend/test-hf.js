require('dotenv').config();
const { Client } = require("@gradio/client");
async function run() {
   console.log("Token loaded:", process.env.HF_TOKEN ? "Yes" : "No", process.env.HF_TOKEN.slice(0, 5) + '...');
   try {
       console.log("Connecting with hf_token...");
       const client1 = await Client.connect("yisol/IDM-VTON", { hf_token: process.env.HF_TOKEN });
       console.log("Connected 1!", !!client1);
   } catch(e) {
       console.error("Error 1:", e);
   }
}
run();

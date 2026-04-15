 AI Stylist Chrome Extension 👗✨

A full-stack Chrome Extension that serves as your personal AI-powered fashion assistant. Seamlessly perform virtual clothing try-ons, receive generative AI style feedback, and reverse-image search outfits directly from your browser!

![UI Preview](extension/public/icons.svg) <!-- Replace with real screenshot if desired -->

## Features

- 🪄 **Virtual Try-On (VTON)**: Upload a picture of yourself and a photo of any garment you find online. The extension uses deep learning (`yisol/IDM-VTON` via Hugging Face) to realistically render you wearing the outfit.
- 💅 **AI Stylist**: Pass the rendered Try-On image to Google's Gemini Vision AI to get an outfit rating out of 10 along with expert, actionable styling advice and accessorizing tips.
- 🔍 **Visual Search**: Upload or paste an image of a clothing item, and the extension proxy seamlessly routes it through Google Lens (via SerpApi) to instantly find exact-match shopping links and pricing.
- 🚀 **Universal Ingestion**: The beautifully styled Glassmorphic UI supports file uploads, pasting screenshots straight from your clipboard (`Ctrl+V`), and pasting direct image URLs.

## Architecture

This is a Monorepo comprised of two distinct parts:
1. **Frontend (`extension/`)**: Built with React and Vite. It compiles down into a Manifest V3 compliant Google Chrome Extension.
2. **Backend (`backend/`)**: An Express.js Node proxy server. Because standard Chrome Extensions have strict CORS limitations and shouldn't contain private API keys, this backend safely manages API routes, ephemeral image hosting, and third-party AI orchestrations.

---

## 🛠 Installation & Setup

### 1. Run the Backend API
You will need your own API keys for the third-party ML providers. 

1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Copy the example environment variable file to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Get the following free API keys and add them to your new `.env` file:
    - **GEMINI_API_KEY**: From [Google AI Studio](https://aistudio.google.com/) for Stylist capabilities.
    - **HF_TOKEN**: A "Read" access token from [Hugging Face](https://huggingface.co/settings/tokens) for generous Try-On generations.
    - **SERP_API_KEY**: From [SerpApi](https://serpapi.com/) for the Google Lens reverse search.
4. Start the server:
   ```bash
   npm start
   # or node server.js
   ```

### 2. Build & Load the Chrome Extension
1. Open a new terminal and navigate to the extension directory:
   ```bash
   cd extension
   npm install
   npm run build
   ```
   *(Note: The build step is critical. It outputs the final vanilla HTML/JS bundles to the `extension/dist` folder).*
2. Open Google Chrome and go to `chrome://extensions/`.
3. In the top right, turn on **Developer mode**.
4. Click the **Load unpacked** button in the top left.
5. Select the newly generated `extension/dist` folder.
6. The AI Stylist extension will appear in your browser's toolbar! Open it, and it will automatically talk to your local backend server on Port 3000.

## Tech Stack
- **Frontend**: React, Vite, Vanilla CSS (Glassmorphism), Manifest V3
- **Backend**: Node.js, Express, `multer`, `@gradio/client`, `@google/genai`
- **Integrations**: Gemini 2.5 Flash, IDM-VTON, SerpApi, Freeimage.host API

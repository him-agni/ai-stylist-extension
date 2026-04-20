const { GoogleGenAI } = require("@google/genai");

// Assumes process.env.GEMINI_API_KEY is set
// Ensure we use a realistic initialization that won't crash if key is missing during local scaffolding.
const key = process.env.GEMINI_API_KEY;
const ai = (key && key !== 'your_gemini_api_key_here') ? new GoogleGenAI({ apiKey: key }) : null;

async function getStylistFeedback(imageInput, extraImageInput, message, history = []) {
  if (!ai) {
    return {
       reply: "This is a placeholder reply! To get real AI analysis, you critically need to paste a free Gemini API Key into the backend .env file. Yes, a sleek belt and some dark boots would look amazing here."
    };
  }

  try {
    const parseImage = async (img) => {
        let base64Data;
        let mimeType = "image/jpeg";
        if (img.startsWith('http')) {
            const fetchRes = await fetch(img);
            mimeType = fetchRes.headers.get('content-type') || "image/jpeg";
            const arrayBuffer = await fetchRes.arrayBuffer();
            base64Data = Buffer.from(arrayBuffer).toString('base64');
        } else {
            if (img.includes(';base64,')) {
               mimeType = img.split(';')[0].split(':')[1] || "image/jpeg";
            }
            base64Data = img.includes(',') ? img.split(',')[1] : img;
        }
        return {
           inlineData: {
               data: base64Data,
               mimeType: mimeType
           }
        };
    };

    let formattedContents = [];
    
    if (history && history.length > 0) {
        formattedContents = history.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));
    }

    let currentTextPart = message || "You are an expert fashion stylist. Look at this outfit. Rate it out of 10, and provide 2-3 short, concrete suggestions to improve or accessorize the look.";
    if (formattedContents.length === 0 && message) {
        currentTextPart = "You are an expert fashion stylist. " + message;
    }

    const currentParts = [{ text: currentTextPart }];

    if (formattedContents.length === 0 && imageInput) {
        const mainImagePart = await parseImage(imageInput);
        currentParts.push(mainImagePart);
        if (extraImageInput) {
             currentParts[0].text += " I have also provided the standalone garment/reference image for additional context.";
             currentParts.push(await parseImage(extraImageInput));
        }
    }

    formattedContents.push({
        role: 'user',
        parts: currentParts
    });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedContents
    });
    
    return {
        reply: response.text
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error('Failed to get stylist feedback from Gemini.');
  }
}

module.exports = { getStylistFeedback };

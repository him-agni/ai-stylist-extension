const express = require('express');
const router = express.Router();
const { virtualTryOn } = require('../services/gradio');
const { getStylistFeedback } = require('../services/gemini');
const { performVisualSearch } = require('../services/search');

// Endpoint 1: Virtual Try On
router.post('/try-on', async (req, res) => {
  try {
    const { humanImage, garmentImage } = req.body;
    if (!humanImage || !garmentImage) {
      return res.status(400).json({ error: "Missing images" });
    }
    
    // Call our Gradio wrapper
    const generatedUrl = await virtualTryOn(humanImage, garmentImage);
    
    res.json({ success: true, url: generatedUrl });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 2: AI Stylist
router.post('/style', async (req, res) => {
  try {
    const { image, inputImage, message, history } = req.body;
    if (!image && (!history || history.length === 0)) {
       return res.status(400).json({ error: "Missing image for initial request" });
    }
    
    const feedback = await getStylistFeedback(image, inputImage, message, history);
    
    res.json({ success: true, ...feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint 3: Visual Search (using SerpApi Google Lens)
router.post('/search', async (req, res) => {
  try {
     const { garmentImage } = req.body;
     if (!garmentImage) return res.status(400).json({ error: "Missing image" });

     // perform search
     const results = await performVisualSearch(garmentImage);

     res.json({ 
       success: true, 
       results 
     });
  } catch(error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

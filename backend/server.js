require('dotenv').config();
const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', aiRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('AI Stylist API is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

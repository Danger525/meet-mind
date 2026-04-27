require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { transcribeAudio } = require('./gemini');
const { sendWhatsAppSummary } = require('./whatsapp');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.get('/', (req, res) => {
  res.json({ status: 'MeetMind Backend is running', timestamp: new Date().toISOString() });
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  console.log('Received audio chunk for transcription...');
  try {
    const audioPath = req.file.path;
    const summary = await transcribeAudio(audioPath);
    console.log('Transcription successful:', summary.meeting_title || 'Untitled');

    // Clean up uploaded file
    fs.unlinkSync(audioPath);

    // Send WhatsApp summary if it's a valid summary
    if (summary && summary.whatsapp_summary) {
      await sendWhatsAppSummary(null, summary.whatsapp_summary);
    }

    res.json(summary);
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MeetMind backend server running on port ${PORT}`);
});
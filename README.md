# MeetMind

MeetMind is a Chrome extension that transcribes browser-based meetings (Google Meet, Zoom, Teams, etc.) in real-time, analyzes the conversation using AI, and generates structured summaries, action items, and WhatsApp notifications for attendees.

## Features

- **Real-time Audio Capture**: Captures audio from any browser tab using Chrome's `tabCapture` API.
- **AI-Powered Transcription & Analysis**: Uses Google Gemini 2.5 Flash to transcribe audio and generate intelligent summaries.
- **Structured Output**: Provides executive summaries, key decisions, action items, risks, sentiment analysis, and WhatsApp-friendly summaries.
- **WhatsApp Integration**: Sends summarized meeting notes via Twilio WhatsApp API.
- **Multi-platform Support**: Works on Google Meet, Zoom Web, Microsoft Teams, and more.
- **Multi-language Support**: Handles English, Hindi, Hinglish, and mixed languages in Indian business contexts.

## Tech Stack

### Frontend (Chrome Extension)
- **JavaScript**: Core scripting for background, content, and popup scripts.
- **HTML/CSS**: Popup UI for start/stop controls and displaying summaries.
- **Chrome Extensions API**: `tabCapture`, `activeTab`, `storage`, `scripting` for audio capture and tab management.

### Backend
- **Node.js**: Server-side runtime.
- **Express.js**: Web framework for handling API requests.
- **Multer**: Middleware for handling file uploads (audio chunks).
- **@google/genai**: Google Generative AI SDK for transcription and analysis.
- **Twilio**: SMS/WhatsApp API for notifications.
- **dotenv**: Environment variable management.

### Infrastructure
- **Google Gemini API**: For AI transcription and summarization.
- **Twilio API**: For sending WhatsApp messages.
- **Local Development**: Runs on localhost for testing.

## Project Structure

```
meetmind/
│
├── meetmind-extension/
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Audio capture service worker
│   ├── content.js             # Injected script for Meet pages
│   ├── popup.html             # Extension popup UI
│   ├── popup.js               # Popup logic
│   └── icons/                 # Extension icons (placeholder)
│
└── meetmind-backend/
    ├── server.js              # Express server
    ├── gemini.js              # Gemini API integration
    ├── whatsapp.js            # Twilio WhatsApp sender
    ├── package.json           # Node.js dependencies
    └── .env                   # Environment variables (API keys)
```

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Chrome browser
- Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/))
- Twilio Account SID and Auth Token (from [Twilio Console](https://console.twilio.com/)) - optional for WhatsApp

### 1. Clone or Download the Project
Place the `meetmind-extension` and `meetmind-backend` folders in your workspace.

### 2. Backend Setup
```bash
cd meetmind-backend
npm install
```

- Update `.env` with your API keys (see `.env.example`):
  ```
  GEMINI_API_KEY=your_gemini_api_key
  TWILIO_ACCOUNT_SID=your_twilio_sid
  TWILIO_AUTH_TOKEN=your_twilio_token
  ```

- Start the server:
  ```bash
  npm start
  ```
  Server runs on `http://localhost:3000`.

**Quick Start (from root):**
```bash
npm run install-all
npm run start:backend
```

### 3. Extension Setup
- Open Chrome and go to `chrome://extensions/`.
- Enable "Developer mode".
- Click "Load unpacked" and select the `meetmind-extension` folder.
- The MeetMind extension should appear.

## Usage

1. **Open a Meeting**: Join a meeting in any browser tab (Google Meet, Zoom Web, Teams, etc.).
2. **Start Transcription**: Click the MeetMind extension icon, then "Start Transcription".
3. **Speak**: The extension captures audio in 30-second chunks, sends to backend, and processes with Gemini.
4. **View Summary**: Stop transcription; the popup displays the JSON summary.
5. **WhatsApp Notification**: Integrate `whatsapp.js` in `server.js` to send summaries automatically.

## Testing

- Use short audio clips for testing (e.g., record a sample meeting).
- Check Chrome DevTools for extension logs.
- Backend logs via terminal.
- Ensure permissions are granted for `tabCapture`.

## Limitations

- Audio capture limited to Google Meet tabs.
- Requires stable internet for API calls.
- WhatsApp integration needs Twilio setup.
- Free Gemini API has rate limits.

## Contributing

- Fork the repo.
- Make changes.
- Test thoroughly.
- Submit a PR.

## License

MIT License.

## Contact

For issues, open a GitHub issue or contact the maintainer.

# WhatsUpGemini? 🎙️✨

**AI-Powered Voice Message Transcription for WhatsApp Web**

Transform your WhatsApp voice messages into text instantly using Google Gemini AI. Never miss a message again, even in noisy environments or when you can't play audio.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

---

## 🌟 Features

### Core Functionality
- **🎯 One-Click Transcription** - Add "Transcribe" buttons directly next to voice messages
- **⚡ Real-Time Processing** - Get transcriptions in seconds using Google Gemini AI
- **🔒 Secure Authentication** - JWT-based security with 15-minute token lifetime
- **🌐 WhatsApp Web Integration** - Seamlessly integrated into WhatsApp Web interface
- **💬 Clean UI** - Non-intrusive design that matches WhatsApp's aesthetic

### Advanced Features
- **🔐 End-to-End Encryption Support** - Works with encrypted voice messages
- **📱 Multi-Format Support** - Handles various audio formats (OGG, MP3, WAV, etc.)
- **🎨 Transparent Icons** - Modern design with transparent background icons
- **⚙️ Easy Configuration** - Simple popup interface for API key management
- **🔄 Auto-Refresh** - Automatic detection of new voice messages

---

## 📸 Screenshots

### Transcription in Action
![Transcription Demo](https://via.placeholder.com/800x400?text=Transcription+Demo)

### Extension Popup
![Extension Popup](https://via.placeholder.com/400x300?text=Extension+Popup)

---

## 🚀 Installation

### From Source (Development)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/leomarviegas/whatsupgemini.git
   cd whatsupgemini
   ```

2. **Get Google Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the API key (starts with `AIza...`)

3. **Load Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `whats-up-gemini-v1` folder

4. **Configure API Key**
   - Click the extension icon in Chrome toolbar
   - Paste your Gemini API key
   - Click "Save API Key"

5. **Start Using**
   - Open [WhatsApp Web](https://web.whatsapp.com)
   - Navigate to any chat with voice messages
   - Click "Transcribe" button next to voice messages

### From Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon. Stay tuned!

---

## 📖 Usage Guide

### Basic Usage

1. **Open WhatsApp Web**
   - Navigate to https://web.whatsapp.com
   - Log in with your phone

2. **Find a Voice Message**
   - Open any chat with voice messages
   - Look for the "Transcribe" button next to the play button

3. **Transcribe**
   - Click the "Transcribe" button
   - Wait a few seconds for processing
   - Read the transcription displayed below the message

### Managing API Key

**To Update API Key:**
1. Click the extension icon in Chrome toolbar
2. Enter new API key
3. Click "Save API Key"

**To View Saved API Key:**
1. Click the extension icon
2. Click the eye icon (👁️) to toggle visibility

---

## 🔧 Configuration

### API Key Setup

The extension requires a Google Gemini API key to function.

**Getting an API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

**API Key Format:**
- Starts with `AIza`
- Minimum 30 characters
- Example: `AIzaSyABC123...xyz789`

**Storage:**
- API keys are stored securely in Chrome Sync Storage
- Keys are encrypted by Chrome
- Keys sync across your Chrome instances

---

## 🏗️ Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────┐
│                  WhatsApp Web UI                    │
│  (Voice Messages + Transcribe Buttons)              │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│              Content Script Layer                   │
│  • UI Injection                                     │
│  • Event Handling                                   │
│  • Audio Extraction (via inject.js)                 │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│             Service Worker Layer                    │
│  • JWT Token Management                             │
│  • Google Gemini API Integration                    │
│  • API Key Storage                                  │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│              Google Gemini API                      │
│  (gemini-2.0-flash-exp model)                       │
└─────────────────────────────────────────────────────┘
```

### Key Technologies

- **Chrome Extension Manifest V3** - Modern extension architecture
- **Google Gemini AI** - Advanced audio transcription
- **JWT Authentication** - Secure token-based authentication
- **WhatsApp Web APIs** - Internal Store object access
- **JavaScript ES6+** - Modern async/await patterns

For detailed architecture documentation, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🔒 Security & Privacy

### Security Features

- **🔐 JWT Authentication** - 15-minute token lifetime with HMAC-SHA256 signing
- **🔑 Secure Storage** - API keys stored in Chrome Sync Storage (encrypted)
- **🚫 Minimal Permissions** - Only requests necessary permissions
- **🔒 Isolated Contexts** - Separate execution contexts for security
- **✅ Token Validation** - All operations require valid JWT tokens

### Privacy Commitment

- **No Data Collection** - We don't collect or store your data
- **No Analytics** - No tracking or analytics code
- **No External Servers** - Direct communication with Google Gemini API only
- **Local Processing** - Audio extraction happens locally in your browser
- **No Message Storage** - Transcriptions are not saved or cached

### Permissions Explained

| Permission | Purpose |
|------------|---------|
| `activeTab` | Access WhatsApp Web page to inject UI elements |
| `storage` | Store API key and JWT secret securely |
| `*://*.whatsapp.com/*` | Run content script on WhatsApp Web only |

---

## 🛠️ Development

### Project Structure

```
whatsupgemini/
├── whats-up-gemini-v1/          # Extension source code
│   ├── manifest.json            # Extension configuration
│   ├── background.js            # Service worker
│   ├── content.js               # Content script
│   ├── inject.js                # Page injection script
│   ├── lib.js                   # WhatsApp Store exposure
│   ├── jwt-utils.js             # JWT generation (service worker)
│   ├── page-jwt-utils.js        # JWT validation (page context)
│   ├── popup.html               # Extension popup UI
│   ├── popup.css                # Popup styling
│   ├── popup.js                 # Popup logic
│   └── images/                  # Extension icons
│       ├── icon_16x16.png
│       ├── icon_32x32.png
│       ├── icon_48x48.png
│       ├── icon_128x128.png
│       └── originals/           # Original icon backups
├── docs/                        # Documentation
│   ├── CODE_SUMMARY.md          # Code summarization
│   ├── ARCHITECTURE.md          # Architecture documentation
│   └── API_REFERENCE.md         # API reference (coming soon)
└── README.md                    # This file
```

### Building from Source

```bash
# Clone repository
git clone https://github.com/leomarviegas/whatsupgemini.git
cd whatsupgemini

# No build process required - load directly in Chrome
# See Installation section above
```

### Running Tests

```bash
# Tests coming soon
npm test
```

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**How to Contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📊 Technical Specifications

### System Requirements

- **Browser:** Google Chrome 88+ or Chromium-based browsers
- **Operating System:** Windows, macOS, Linux, Chrome OS
- **Internet Connection:** Required for API calls
- **WhatsApp Account:** Required for WhatsApp Web access

### API Specifications

**Google Gemini API:**
- **Model:** `gemini-2.0-flash-exp` (experimental flash model)
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`
- **Input:** Base64-encoded audio with inline data format
- **Output:** JSON with transcription text
- **Rate Limits:** Subject to Google Gemini API limits

### Performance Metrics

- **Transcription Time:** 2-5 seconds (depending on audio length)
- **Audio Size Limit:** Up to 20MB per message
- **Token Lifetime:** 15 minutes
- **Extension Size:** ~50KB (excluding icons)

---

## 🐛 Troubleshooting

### Common Issues

#### "API Key not found" Error
**Solution:** Configure your API key in the extension popup.

#### "Authentication failed" Error
**Solution:** JWT token expired or invalid. Try clicking transcribe again.

#### "Audio data not found" Error
**Solution:** Message may be too old or not fully loaded. Refresh the page and try again.

#### Transcribe Button Not Appearing
**Solution:** 
1. Refresh WhatsApp Web page
2. Check if extension is enabled in `chrome://extensions/`
3. Ensure you're on `web.whatsapp.com`

#### "Invalid API key format" Error
**Solution:** Ensure your API key starts with `AIza` and is at least 30 characters long.

### Debug Mode

To enable debug logging:
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Filter by extension name
4. Look for `[Background]`, `[Content]`, or `[Page]` prefixed logs

### Getting Help

- **GitHub Issues:** [Report a bug](https://github.com/leomarviegas/whatsupgemini/issues)
- **Discussions:** [Ask questions](https://github.com/leomarviegas/whatsupgemini/discussions)
- **Email:** support@whatsupgemini.com (coming soon)

---

## 📝 Changelog

### Version 1.0.0 (October 2025)

**Initial Release**
- ✨ Voice message transcription using Google Gemini AI
- 🔒 JWT-based authentication system
- 🎨 Transparent background icons
- 💬 Clean UI integration with WhatsApp Web
- ⚙️ Simple API key configuration
- 📖 Comprehensive documentation

**Technical Improvements:**
- Implemented flood fill algorithm for icon transparency
- Added keep-alive mechanism for service worker
- Optimized script loading sequence
- Enhanced error handling and user feedback

For detailed version history, see [CHANGELOG.md](CHANGELOG.md).

---

## 🗺️ Roadmap

### Version 1.1 (Q4 2025)
- [ ] Multi-language transcription support
- [ ] Transcription history
- [ ] Export transcriptions to text files
- [ ] Keyboard shortcuts

### Version 1.2 (Q1 2026)
- [ ] Batch transcription (multiple messages)
- [ ] Custom transcription prompts
- [ ] Offline mode with caching
- [ ] Dark mode support

### Version 2.0 (Q2 2026)
- [ ] Real-time transcription (as audio plays)
- [ ] Voice message playback controls
- [ ] Translation support
- [ ] Chrome Web Store release

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 WhatsUpGemini

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Google Gemini Team** - For providing the powerful AI transcription API
- **WhatsApp** - For creating an amazing messaging platform
- **Chrome Extensions Community** - For valuable resources and documentation
- **Contributors** - Thank you to all who have contributed to this project

---

## 📞 Contact & Support

- **GitHub:** [@leomarviegas](https://github.com/leomarviegas)
- **Repository:** [whatsupgemini](https://github.com/leomarviegas/whatsupgemini)
- **Issues:** [Report bugs](https://github.com/leomarviegas/whatsupgemini/issues)
- **Discussions:** [Community forum](https://github.com/leomarviegas/whatsupgemini/discussions)

---

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=leomarviegas/whatsupgemini&type=Date)](https://star-history.com/#leomarviegas/whatsupgemini&Date)

---

## 🎉 Fun Facts

- 🎙️ The extension can transcribe voice messages in under 5 seconds
- 🔒 Uses military-grade HMAC-SHA256 encryption for JWT tokens
- 🎨 Icons designed with transparent backgrounds for modern aesthetics
- 📝 Over 1,250 lines of well-documented code
- ⚡ Supports WhatsApp Web's latest features and updates

---

**Made with ❤️ by the WhatsUpGemini Team**

*Never miss a voice message again!*

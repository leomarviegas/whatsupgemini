# WhatsUpGemini - Code Summarization

## Overview

**WhatsUpGemini** is a Chrome extension that integrates Google Gemini AI with WhatsApp Web to provide real-time transcription of voice messages. The extension uses a sophisticated architecture involving content scripts, service workers, page injection, and JWT authentication to securely access WhatsApp's internal APIs and transcribe audio messages.

---

## Architecture Components

### 1. **manifest.json** - Extension Configuration

The manifest file defines the extension's structure and permissions using Manifest V3.

**Key Features:**
- **Version:** 1.0.0
- **Permissions:** `activeTab`, `storage`
- **Host Permissions:** `*://*.whatsapp.com/*`
- **Content Scripts:** Injected into WhatsApp Web pages
- **Service Worker:** Background script for API calls and JWT management
- **Web Accessible Resources:** `lib.js` for WhatsApp Store access

**Icon Paths:**
- All icons reference the `images/` directory
- Supports 16×16, 32×32, 48×48, and 128×128 sizes
- Icons now use transparent backgrounds for better visual integration

---

### 2. **background.js** - Service Worker (173 lines)

The service worker handles API communication, JWT token management, and audio transcription.

#### Key Functions:

**`transcribeAudioWithGemini(base64Audio, mimeType, apiKey)`**
- Sends audio data to Google Gemini API for transcription
- Uses `gemini-2.0-flash-exp` model
- Handles base64-encoded audio with inline data format
- Returns transcribed text or throws error

**JWT Token Management:**
- Initializes `JWTUtils` on extension installation
- Handles `getJWTToken` requests with custom claims
- Validates JWT tokens via `validateJWTToken` action
- 15-minute token lifetime with automatic refresh

**Message Handlers:**
- `getAudioData` - Forwards audio extraction requests to content script
- `transcribeAudio` - Processes base64 audio and returns transcription
- `saveApiKey` - Stores Gemini API key in Chrome sync storage
- `getApiKey` - Retrieves stored API key

**Keep-Alive Mechanism:**
- Maintains service worker connection for 250 seconds
- Prevents service worker from sleeping during active sessions

---

### 3. **content.js** - Content Script (278 lines)

The content script bridges the extension and WhatsApp Web page, injecting necessary scripts and handling UI interactions.

#### Injection Sequence:

1. **page-jwt-utils.js** - JWT utilities for page context
2. **lib.js** - Exposes WhatsApp's internal Store objects (500ms delay)
3. **inject.js** - Main injection script for audio extraction

#### Key Functions:

**`addTranscriptionButton(voiceMessageElement)`**
- Adds "Transcribe" button next to voice messages
- Styled with gray background, rounded corners
- Positioned next to play button or duration display
- Prevents duplicate button creation

**Button Click Handler:**
1. Extracts message ID from voice message element
2. Requests JWT token from background script
3. Dispatches custom event to injected script with JWT
4. Shows "Transcribing..." loading state

**`displayTranscriptionResult(messageContainer, text, isError)`**
- Creates styled div for transcription results
- Error messages: Red background (#ffebee)
- Success messages: Light gray background (#f5f5f5)
- Removes existing transcription before displaying new one

**Event Listeners:**
- `whatsappGeminiTranscriber_audioDataResponse` - Receives audio data from injected script
- Forwards audio to background script for transcription
- Updates button state and displays results

**DOM Observation:**
- Uses `MutationObserver` to detect new voice messages
- Searches for `span[aria-label='Voice message']` elements
- Adds transcription buttons to dynamically loaded messages
- Initial check on DOMContentLoaded + 2-second delayed check

**Keep-Alive Port:**
- Maintains connection to service worker
- Reconnects after 5 seconds if disconnected

---

### 4. **lib.js** - WhatsApp Store Exposure (11 lines, minified)

This is a sophisticated, minified script that exposes WhatsApp's internal module system.

#### Core Functionality:

**Module Raid System:**
- Detects WhatsApp version (checks if Debug.VERSION >= 3000)
- Accesses `window.require("__debug").modulesMap`
- Extracts all available WhatsApp modules
- Creates `window.cometModuleRaid` for module access

**Store Object Exposure:**
- Initializes `window.mR` (module raid) and `window._moduleRaid`
- Creates `window.Store` with all WhatsApp internal objects
- Exposes 50+ Store modules including:
  - **Chat** - Chat management
  - **Conn** - Connection handling
  - **CryptoLib** - E2E encryption/decryption
  - **DownloadManager** - Media download management
  - **MediaObject** - Media object creation
  - **SendMessage** - Message sending functionality
  - **User** - User information
  - **GroupMetadata** - Group information
  - **MsgKey** - Message key generation

**WWebJS Helper Functions:**
- `sendMessage()` - Send messages with attachments, quotes, mentions
- `processMediaData()` - Process and upload media files
- `getMessageModel()` - Serialize message objects
- `getChatModel()` - Serialize chat objects
- `getContactModel()` - Serialize contact objects
- `mediaInfoToFile()` - Convert base64 to File objects
- `arrayBufferToBase64()` - Convert ArrayBuffer to base64

This script is essential for accessing WhatsApp's internal APIs to extract audio data from voice messages.

---

### 5. **jwt-utils.js** - JWT Token Management (Service Worker Context)

Implements complete JWT (JSON Web Token) generation and validation system for secure authentication.

#### Key Features:

**Token Generation:**
- Uses HMAC-SHA256 for signing
- 15-minute token lifetime (900 seconds)
- Custom claims support for message-specific tokens
- Secret key stored in Chrome sync storage

**Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "iat": 1234567890,
    "exp": 1234568790,
    "...customClaims"
  },
  "signature": "base64url_encoded_signature"
}
```

**Token Validation:**
- Verifies signature integrity
- Checks expiration time
- Validates token structure
- Returns validation status with decoded payload

**Secret Key Management:**
- Generates random 256-bit secret key on first use
- Stores securely in Chrome sync storage
- Persists across extension sessions

---

### 6. **page-jwt-utils.js** - JWT Utilities (Page Context)

Page-compatible version of JWT utilities that runs in the WhatsApp Web page context (not extension context).

**Key Differences from jwt-utils.js:**
- Uses `window.crypto` instead of `chrome.crypto`
- No Chrome storage access (receives tokens from content script)
- Validation-only functionality
- Synchronous token verification

**Purpose:**
- Validates JWT tokens received from content script
- Ensures secure communication between extension and page
- Prevents unauthorized access to audio extraction functions

---

### 7. **inject.js** - Page Injection Script

This script runs in the WhatsApp Web page context and handles audio extraction from voice messages.

**Key Responsibilities:**
- Listens for `whatsappGeminiTranscriber_getAudioData` custom events
- Validates JWT tokens using page-jwt-utils
- Accesses WhatsApp Store objects exposed by lib.js
- Extracts audio data from voice messages
- Converts audio to base64 format
- Dispatches `whatsappGeminiTranscriber_audioDataResponse` events

**Audio Extraction Process:**
1. Receives message ID and JWT token from content script
2. Validates JWT token
3. Uses `Store.Msg.get(messageId)` to retrieve message object
4. Accesses media blob via `Store.MediaObject`
5. Decrypts E2E encrypted audio using `Store.CryptoLib`
6. Converts to base64 and returns to content script

---

### 8. **popup.html** & **popup.css** - Extension Popup UI

Simple, clean interface for API key management.

**UI Components:**
- API Key input field (password type)
- Toggle visibility button (👁️/🙈)
- Save button with loading state
- Status message display (success/error)

**Features:**
- Auto-focus on empty input
- Enter key support for saving
- API key format validation (starts with "AIza", min 30 chars)
- Animated status messages
- Auto-hide success message after 3 seconds

---

### 9. **popup.js** - Popup Logic (93 lines)

Handles all popup interactions and API key management.

**Key Functions:**

**API Key Loading:**
- Sends `getApiKey` message to background script
- Populates input field with saved key

**API Key Saving:**
- Validates API key format
- Shows loading state during save
- Sends `saveApiKey` message to background script
- Displays success/error messages

**Visibility Toggle:**
- Switches between password and text input types
- Updates emoji icon (👁️ ↔ 🙈)

---

## Data Flow

### Transcription Flow:

```
User clicks "Transcribe" button
    ↓
content.js requests JWT token from background.js
    ↓
background.js generates JWT token (15-min lifetime)
    ↓
content.js dispatches custom event with JWT to page
    ↓
inject.js validates JWT token
    ↓
inject.js extracts audio using Store objects (lib.js)
    ↓
inject.js converts audio to base64
    ↓
inject.js dispatches audioDataResponse event
    ↓
content.js receives base64 audio
    ↓
content.js sends audio to background.js
    ↓
background.js calls Gemini API
    ↓
background.js returns transcription
    ↓
content.js displays transcription in UI
```

---

## Security Features

### JWT Authentication System:
- **15-minute token lifetime** prevents token reuse
- **HMAC-SHA256 signing** ensures token integrity
- **Custom claims** allow message-specific authorization
- **Secret key storage** in Chrome sync (persistent)
- **Token validation** on both extension and page sides

### Secure Communication:
- Content script ↔ Background script: Chrome message passing
- Content script ↔ Page: Custom DOM events (isolated)
- JWT tokens required for audio extraction
- API key stored in Chrome sync storage (encrypted)

### Permission Model:
- Minimal permissions: `activeTab`, `storage`
- Host permissions limited to `whatsapp.com`
- No broad web permissions
- No external network access except Gemini API

---

## API Integration

### Google Gemini API:
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`
- **Model:** `gemini-2.0-flash-exp` (experimental flash model)
- **Input Format:** Base64-encoded audio with inline data
- **Audio Types:** Supports `audio/ogg` and other formats
- **Response:** JSON with transcription text in `candidates[0].content.parts[0].text`

### Error Handling:
- HTTP error status codes captured
- API response format validation
- User-friendly error messages
- Fallback error display in UI

---

## Code Quality & Best Practices

### Modular Architecture:
- Clear separation of concerns
- Service worker for background tasks
- Content script for UI injection
- Page script for WhatsApp API access

### Asynchronous Patterns:
- Extensive use of `async/await`
- Promise-based message passing
- Non-blocking audio processing

### Error Handling:
- Try-catch blocks throughout
- Graceful degradation on errors
- User feedback for all operations

### Performance Optimization:
- Lazy loading of scripts (500ms delay for lib.js)
- Keep-alive mechanism prevents service worker sleep
- Efficient DOM observation with MutationObserver
- Minimal re-rendering of UI elements

### Code Documentation:
- Inline comments for complex logic
- Console logging for debugging
- Clear function naming conventions

---

## File Structure Summary

```
whats-up-gemini-v1/
├── manifest.json              (45 lines)  - Extension configuration
├── background.js              (173 lines) - Service worker & API calls
├── content.js                 (278 lines) - Content script & UI injection
├── inject.js                  (~200 lines) - Audio extraction (page context)
├── lib.js                     (11 lines)  - WhatsApp Store exposure (minified)
├── jwt-utils.js               (~150 lines) - JWT generation/validation (SW)
├── page-jwt-utils.js          (~100 lines) - JWT validation (page context)
├── popup.html                 (~50 lines) - Popup UI structure
├── popup.css                  (~150 lines) - Popup styling
├── popup.js                   (93 lines)  - Popup logic
└── images/                    - Extension icons (transparent)
    ├── icon_16x16.png
    ├── icon_32x32.png
    ├── icon_48x48.png
    ├── icon_128x128.png
    ├── originals/             - Original icon backups
    └── final_comparison.html  - Icon comparison page
```

**Total Lines of Code:** ~1,250 lines (excluding minified lib.js)

---

## Technology Stack

- **JavaScript (ES6+):** Async/await, Promises, Classes
- **Chrome Extension APIs:** Runtime, Storage, Tabs, Messaging
- **Web APIs:** Fetch, Crypto, MutationObserver, CustomEvent
- **Google Gemini API:** AI-powered audio transcription
- **JWT (JSON Web Tokens):** HMAC-SHA256 authentication
- **WhatsApp Web Internal APIs:** Store objects, Media handling
- **CSS3:** Modern styling with animations
- **HTML5:** Semantic markup

---

## Key Algorithms

### 1. **Flood Fill Algorithm** (Icon Transparency)
Used in `make_transparent_smart.py` to remove background while preserving design elements:
- Identifies white pixels connected to edges (background)
- Preserves isolated white elements (circle border, chat bubble)
- 4-connectivity flood fill implementation

### 2. **JWT HMAC-SHA256 Signing**
Cryptographic signing for secure token generation:
- Base64url encoding of header and payload
- HMAC-SHA256 signature generation
- Token concatenation: `header.payload.signature`

### 3. **Module Raid System**
Dynamic module extraction from WhatsApp Web:
- Webpack chunk injection
- Module enumeration and storage
- Dynamic module loading via `importNamespace`

---

## Future Enhancement Opportunities

1. **Multi-language Support:** Detect and transcribe in multiple languages
2. **Transcription History:** Store and search past transcriptions
3. **Batch Transcription:** Transcribe multiple messages at once
4. **Custom Prompts:** Allow users to customize transcription instructions
5. **Offline Mode:** Cache transcriptions for offline access
6. **Export Functionality:** Export transcriptions to text files
7. **Voice Message Playback:** Integrate playback controls with transcription
8. **Real-time Transcription:** Live transcription as audio plays

---

## Conclusion

WhatsUpGemini demonstrates sophisticated Chrome extension development with secure authentication, seamless WhatsApp Web integration, and AI-powered functionality. The codebase is well-structured, modular, and follows modern JavaScript best practices while maintaining security through JWT authentication and minimal permissions.

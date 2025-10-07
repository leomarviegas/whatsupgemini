# WhatsUpGemini - Architecture Documentation

## System Overview

WhatsUpGemini is a Chrome extension that provides AI-powered transcription of WhatsApp voice messages using Google Gemini. The architecture follows a multi-layered approach with clear separation between extension context, page context, and external API services.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                      (WhatsApp Web Page)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ DOM Injection
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Content Script Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  content.js  │  │  inject.js   │  │  page-jwt-utils.js│   │
│  │              │  │              │  │                   │   │
│  │ • UI Inject  │  │ • Audio      │  │ • JWT Validation  │   │
│  │ • Event      │  │   Extraction │  │   (Page Context)  │   │
│  │   Handling   │  │ • Store      │  │                   │   │
│  │              │  │   Access     │  │                   │   │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────┘   │
│         │                 │                                     │
│         │  ┌──────────────┴──────────────┐                    │
│         │  │         lib.js              │                    │
│         │  │  (WhatsApp Store Exposure)  │                    │
│         │  └─────────────────────────────┘                    │
└─────────┼─────────────────────────────────────────────────────┘
          │
          │ Chrome Message Passing
          ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Service Worker Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     background.js                        │  │
│  │  ┌────────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │ JWT Management │  │ API Handler  │  │ Storage Mgr │ │  │
│  │  │  (jwt-utils)   │  │              │  │             │ │  │
│  │  └────────────────┘  └──────────────┘  └─────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS API Call
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Google Gemini API                           │  │
│  │         (gemini-2.0-flash-exp model)                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Layers

### 1. User Interface Layer

**Location:** WhatsApp Web DOM

**Components:**
- Transcribe buttons (injected by content.js)
- Transcription result displays
- Voice message elements

**Responsibilities:**
- Display transcription UI elements
- Capture user interactions
- Show transcription results and errors

---

### 2. Content Script Layer

**Location:** Extension context with page DOM access

#### 2.1 content.js

**Purpose:** Bridge between extension and page

**Key Responsibilities:**
- Inject scripts into page context (lib.js, inject.js, page-jwt-utils.js)
- Add transcription buttons to voice messages
- Handle user interactions
- Communicate with service worker
- Display transcription results

**Communication Channels:**
- **To Service Worker:** Chrome message passing API
- **To Page Scripts:** Custom DOM events
- **From Page Scripts:** Custom DOM events

**Event Flow:**
```javascript
// To page (audio request)
document.dispatchEvent(new CustomEvent("whatsappGeminiTranscriber_getAudioData", {
  detail: { messageId, jwtToken }
}));

// From page (audio response)
document.addEventListener("whatsappGeminiTranscriber_audioDataResponse", (event) => {
  const { messageId, base64Audio, mimeType, error } = event.detail;
});
```

#### 2.2 inject.js

**Purpose:** Audio extraction in page context

**Key Responsibilities:**
- Listen for audio data requests
- Validate JWT tokens
- Access WhatsApp Store objects
- Extract and decrypt audio data
- Convert audio to base64
- Send audio data back to content script

**Security:**
- JWT token validation before processing
- Token expiration checking
- Secure event communication

#### 2.3 lib.js

**Purpose:** Expose WhatsApp's internal APIs

**Key Responsibilities:**
- Module raid system initialization
- WhatsApp Store object exposure
- Helper function creation (WWebJS)

**Exposed Store Objects:**
- `Store.Msg` - Message management
- `Store.Chat` - Chat management
- `Store.MediaObject` - Media handling
- `Store.CryptoLib` - Encryption/decryption
- `Store.DownloadManager` - Media downloads
- And 40+ more modules

#### 2.4 page-jwt-utils.js

**Purpose:** JWT validation in page context

**Key Responsibilities:**
- Token structure validation
- Signature verification
- Expiration checking
- Payload decoding

---

### 3. Service Worker Layer

**Location:** Extension background context

#### 3.1 background.js

**Purpose:** Central orchestrator and API gateway

**Key Responsibilities:**
- JWT token generation and management
- Google Gemini API communication
- API key storage management
- Message routing
- Keep-alive mechanism

**Message Handlers:**

| Action | Purpose | Response |
|--------|---------|----------|
| `getJWTToken` | Generate JWT token | `{ success, token }` |
| `validateJWTToken` | Validate JWT token | `{ success, validation }` |
| `getAudioData` | Forward audio request | Audio data |
| `transcribeAudio` | Transcribe audio | `{ transcription }` or `{ error }` |
| `saveApiKey` | Store API key | `{ status }` |
| `getApiKey` | Retrieve API key | `{ apiKey }` |

#### 3.2 jwt-utils.js

**Purpose:** JWT cryptographic operations

**Key Responsibilities:**
- Secret key generation and storage
- Token creation with HMAC-SHA256
- Token validation and verification
- Expiration management (15-minute lifetime)

**Token Structure:**
```
Header (Base64URL):
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (Base64URL):
{
  "iat": 1234567890,      // Issued at
  "exp": 1234568790,      // Expires at (iat + 900)
  "messageId": "ABC123"   // Custom claims
}

Signature (HMAC-SHA256):
HMAC-SHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

---

### 4. Storage Layer

**Location:** Chrome Storage API

**Storage Types:**

#### Chrome Sync Storage:
- **API Key:** User's Gemini API key
- **JWT Secret:** HMAC secret key for token signing

**Data Persistence:**
- Synced across user's Chrome instances
- Encrypted by Chrome
- Survives extension updates

---

### 5. External Services Layer

#### Google Gemini API

**Endpoint:**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
```

**Request Format:**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Please provide a transcript of this audio message."
        },
        {
          "inline_data": {
            "mime_type": "audio/ogg",
            "data": "<base64_audio_data>"
          }
        }
      ]
    }
  ]
}
```

**Response Format:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Transcribed text here..."
          }
        ]
      }
    }
  ]
}
```

---

## Security Architecture

### 1. JWT Authentication Flow

```
┌─────────────┐
│ User clicks │
│  Transcribe │
└──────┬──────┘
       │
       ↓
┌──────────────────────────────────────────────┐
│ content.js requests JWT from background.js   │
└──────┬───────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────┐
│ background.js (jwt-utils.js):                │
│ 1. Load secret key from storage              │
│ 2. Create payload with iat, exp, claims      │
│ 3. Sign with HMAC-SHA256                     │
│ 4. Return token                              │
└──────┬───────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────┐
│ content.js sends token to page via event     │
└──────┬───────────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────────────┐
│ inject.js (page-jwt-utils.js):               │
│ 1. Validate token structure                  │
│ 2. Verify signature                          │
│ 3. Check expiration                          │
│ 4. Decode payload                            │
└──────┬───────────────────────────────────────┘
       │
       ↓ (if valid)
┌──────────────────────────────────────────────┐
│ inject.js extracts audio and returns data    │
└───────────────────────────────────────────────┘
```

### 2. Isolation Boundaries

**Extension Context ↔ Page Context:**
- Separate JavaScript execution contexts
- Communication only via custom DOM events
- No direct function calls between contexts
- JWT tokens required for sensitive operations

**Content Script ↔ Service Worker:**
- Chrome message passing API
- Asynchronous communication
- Type-safe message format
- Error handling on both sides

### 3. Permission Model

**Minimal Permissions:**
- `activeTab` - Only access active tab when needed
- `storage` - Store API key and JWT secret
- `*://*.whatsapp.com/*` - Only WhatsApp Web access

**No Permissions For:**
- All websites
- Browsing history
- Downloads
- Clipboard
- Notifications

---

## Data Flow Diagrams

### Transcription Flow

```
┌──────┐     ┌─────────┐     ┌────────────┐     ┌────────┐
│ User │────▶│Content  │────▶│Service     │────▶│Gemini  │
│      │     │Script   │     │Worker      │     │API     │
└──────┘     └─────────┘     └────────────┘     └────────┘
   │             │                  │                 │
   │ Click       │ Request JWT      │ Generate JWT    │
   │ Transcribe  │                  │                 │
   │             │◀─────────────────│                 │
   │             │ JWT Token        │                 │
   │             │                  │                 │
   │             │ Dispatch Event   │                 │
   │             │ with JWT         │                 │
   │             │                  │                 │
   │             ↓                  │                 │
   │      ┌──────────┐              │                 │
   │      │inject.js │              │                 │
   │      │(Page)    │              │                 │
   │      └──────────┘              │                 │
   │             │                  │                 │
   │             │ Validate JWT     │                 │
   │             │ Extract Audio    │                 │
   │             │                  │                 │
   │             │ Audio Response   │                 │
   │             │ (base64)         │                 │
   │             │                  │                 │
   │             │ Forward Audio    │                 │
   │             │─────────────────▶│                 │
   │             │                  │ Transcribe      │
   │             │                  │────────────────▶│
   │             │                  │                 │
   │             │                  │◀────────────────│
   │             │                  │ Transcription   │
   │             │                  │                 │
   │             │◀─────────────────│                 │
   │             │ Transcription    │                 │
   │             │                  │                 │
   │◀────────────│                  │                 │
   │ Display     │                  │                 │
   │ Result      │                  │                 │
   └─────────────┴──────────────────┴─────────────────┘
```

### API Key Management Flow

```
┌──────┐     ┌─────────┐     ┌────────────┐     ┌─────────┐
│ User │────▶│Popup    │────▶│Service     │────▶│Chrome   │
│      │     │UI       │     │Worker      │     │Storage  │
└──────┘     └─────────┘     └────────────┘     └─────────┘
   │             │                  │                 │
   │ Open Popup  │                  │                 │
   │             │ Get API Key      │                 │
   │             │─────────────────▶│                 │
   │             │                  │ Retrieve        │
   │             │                  │────────────────▶│
   │             │                  │◀────────────────│
   │             │◀─────────────────│                 │
   │             │ API Key          │                 │
   │             │                  │                 │
   │ Enter Key   │                  │                 │
   │ Click Save  │                  │                 │
   │             │ Save API Key     │                 │
   │             │─────────────────▶│                 │
   │             │                  │ Store           │
   │             │                  │────────────────▶│
   │             │                  │◀────────────────│
   │             │◀─────────────────│                 │
   │◀────────────│ Success Message  │                 │
   └─────────────┴──────────────────┴─────────────────┘
```

---

## Performance Considerations

### 1. Script Loading Optimization

**Sequential Loading:**
```
page-jwt-utils.js (immediate)
    ↓ onload
lib.js (immediate)
    ↓ 500ms delay
inject.js (delayed)
```

**Rationale:**
- JWT utils must load first for security
- lib.js needs time to expose Store objects
- inject.js depends on both previous scripts

### 2. DOM Observation

**MutationObserver Strategy:**
- Observes entire document body
- Filters for voice message elements only
- Prevents duplicate button creation
- Minimal performance impact

**Initial Checks:**
- DOMContentLoaded event
- 2-second delayed check for dynamic content

### 3. Keep-Alive Mechanism

**Service Worker:**
- 250-second connection timeout
- Prevents service worker sleep during active use
- Automatic reconnection on disconnect

**Content Script:**
- 5-second reconnection delay
- Maintains persistent connection

### 4. Caching Strategy

**No Caching:**
- Transcriptions not cached (privacy)
- API key cached in Chrome storage
- JWT secret cached in Chrome storage

---

## Error Handling Strategy

### 1. Error Propagation

```
inject.js (audio extraction error)
    ↓ Custom event with error
content.js (receives error)
    ↓ Display error message
User sees error in UI
```

### 2. Error Types

| Error Source | Error Type | User Message |
|--------------|------------|--------------|
| JWT Generation | Token creation failed | "Authentication failed" |
| JWT Validation | Invalid/expired token | "Authentication failed" |
| Audio Extraction | Message not found | "Audio data not found" |
| API Call | Network error | "Network error" |
| API Call | Invalid API key | "Invalid API key" |
| API Call | Rate limit | "Rate limit exceeded" |

### 3. Recovery Mechanisms

**Automatic Retry:**
- Keep-alive reconnection (5s delay)
- Service worker reconnection

**User Action Required:**
- Invalid API key → User must update key
- Expired JWT → Automatic regeneration on next click

---

## Scalability Considerations

### Current Limitations:

1. **Single Message Processing:** One transcription at a time
2. **No Batch Processing:** Each message requires separate API call
3. **No Caching:** Repeated transcriptions call API again
4. **No Offline Support:** Requires internet connection

### Future Scalability Improvements:

1. **Batch Transcription:** Process multiple messages in parallel
2. **Transcription Cache:** Store results in IndexedDB
3. **Queue System:** Queue multiple requests
4. **Offline Mode:** Cache transcriptions for offline access
5. **Background Sync:** Sync transcriptions when online

---

## Deployment Architecture

### Development Environment:
```
Local Files → Chrome Extensions Page (Load Unpacked)
```

### Production Environment:
```
Source Code → Build Process → Chrome Web Store → User Installation
```

### Update Mechanism:
- Chrome automatically updates extensions
- Users receive updates within 24-48 hours
- No user action required

---

## Monitoring & Debugging

### Logging Strategy:

**Console Logs:**
- `[Background]` prefix for service worker logs
- `[Content]` prefix for content script logs
- `[Page]` prefix for inject.js logs

**Debug Information:**
- JWT token generation/validation status
- Audio extraction progress
- API call status and responses
- Error messages with context

### Chrome DevTools Integration:

**Service Worker:**
- chrome://extensions → Service Worker → Inspect

**Content Script:**
- Right-click page → Inspect → Console (filter by extension ID)

**Page Scripts:**
- Right-click page → Inspect → Console (no filter)

---

## Conclusion

WhatsUpGemini's architecture demonstrates a well-designed, secure, and scalable Chrome extension with clear separation of concerns, robust security through JWT authentication, and efficient communication between multiple execution contexts. The modular design allows for easy maintenance and future enhancements while maintaining security and performance standards.

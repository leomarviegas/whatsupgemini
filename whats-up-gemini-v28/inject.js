// inject.js

console.log("Whats up Gemini? inject script loaded.");

// JWT-authenticated Store initialization (page context compatible)
let pageJWTUtils = null;
let storeInitialized = false;

// Initialize JWT utilities and Store objects
async function initializeStoreWithJWT() {
  try {
    // Initialize page-compatible JWT utilities if not already done
    if (!pageJWTUtils && typeof window.PageJWTUtils === 'function') {
      pageJWTUtils = new window.PageJWTUtils();
      console.log("[Inject] Page JWT utilities initialized");
    }
    
    // Debug: Check what's available in window
    console.log("[Inject] Checking available functions:", {
      ExposeStore: typeof window.ExposeStore,
      PageJWTUtils: typeof window.PageJWTUtils,
      cometModuleRaid: typeof window.cometModuleRaid,
      mR: typeof window.mR,
      _moduleRaid: typeof window._moduleRaid
    });
    
    // Check if ExposeStore function is available
    if (typeof window.ExposeStore === 'function' && !storeInitialized) {
      try {
        console.log("[Inject] Calling ExposeStore function...");
        window.ExposeStore();
        storeInitialized = true;
        console.log("[Inject] WhatsApp Store objects exposed successfully");
        
        // Verify Store objects are available
        console.log("[Inject] Store objects check:", {
          Store: typeof window.Store,
          Msg: window.Store ? typeof window.Store.Msg : 'Store not available',
          DownloadManager: window.Store ? typeof window.Store.DownloadManager : 'Store not available'
        });
      } catch (error) {
        console.error("[Inject] Error calling ExposeStore:", error);
      }
    } 
  } catch (error) {
    console.error("[Inject] Store initialization with JWT failed:", error);
    setTimeout(initializeStoreWithJWT, 1000);
  }
}

// Start the initialization process
setTimeout(initializeStoreWithJWT, 100);

// Function to get audio data from WhatsApp's internal store with JWT authentication
async function getWhatsAppAudioData(messageId, jwtToken) {
  return new Promise(async (resolve, reject) => {
    // Validate JWT token first (basic validation without Chrome APIs)
    if (jwtToken && pageJWTUtils) {
      try {
        const validation = pageJWTUtils.validateBasicToken(jwtToken);
        if (!validation.valid) {
          return reject("JWT token validation failed: " + validation.error);
        }
        console.log("[Inject] JWT token validated successfully for message:", messageId);
        if (validation.note) {
          console.log("[Inject] Note:", validation.note);
        }
      } catch (error) {
        return reject("JWT token validation error: " + error.message);
      }
    } else if (jwtToken) {
      console.warn("[Inject] JWT token provided but PageJWTUtils not available, proceeding without validation");
    } else {
      console.warn("[Inject] No JWT token provided");
    }

    if (!window.Store || !window.Store.Msg || !window.Store.DownloadManager) {
      return reject("WhatsApp internal Store objects not found. Ensure lib.js is loaded and ExposeStore() is called.");
    }

    // WhatsApp message IDs are complex. Try to get the message using the provided ID.
    // Handle Store.Wid constructor issues with improved error handling
    let msgKey;
    try {
      // First, try to find the message directly in the Store
      const directMsg = window.Store.Msg.get(messageId);
      if (directMsg) {
        msgKey = messageId;
      } else {
        // Try parsing the messageId format 'false_12345@c.us_ABCDEF'
        const parts = messageId.split('_');
        if (parts.length >= 3 && window.Store.WidFactory) {
          try {
            // Use WidFactory instead of direct Wid constructor
            const remoteWid = window.Store.WidFactory.createWid(parts[1]);
            msgKey = {
              id: parts[2],
              fromMe: parts[0] === 'true',
              remote: remoteWid,
            };
          } catch (widError) {
            console.warn("[Inject] WidFactory failed, trying alternative approach:", widError);
            msgKey = messageId;
          }
        } else {
          msgKey = messageId;
        }
      }
    } catch (e) {
      console.warn("[Inject] Could not parse messageId, trying direct use:", messageId, e);
      msgKey = messageId;
    }

    const storeMsg = window.Store.Msg.get(msgKey);

    if (!storeMsg) {
      return reject("Message not found in WhatsApp store with ID: " + messageId);
    }

    // Check if it's an audio message
    const isAudio = (msg) => msg.type === 'ptt' || msg.type === 'audio';

    if (isAudio(storeMsg)) {
      // Use WWebJS utility if available, otherwise try direct download manager
      const msg = window.WWebJS && window.WWebJS.getMessageModel ? window.WWebJS.getMessageModel(storeMsg) : storeMsg;

      const dlFn =
        window.Store.DownloadManager.downloadAndDecrypt ||
        window.Store.DownloadManager.downloadAndMaybeDecrypt;

      // Ensure all required media properties are present
      if (dlFn && msg.directPath && msg.encFilehash && msg.filehash && msg.mediaKey) {
        try {
          const blobData = await dlFn({
            directPath: msg.directPath,
            encFilehash: msg.encFilehash,
            filehash: msg.filehash,
            mediaKey: msg.mediaKey,
            mediaKeyTimestamp: msg.mediaKeyTimestamp,
            type: msg.type,
            signal: new AbortController().signal,
          });

          const blob = new Blob([blobData], { type: msg.mimetype || 'application/octet-stream' });
          const reader = new FileReader();

          reader.onload = function () {
            if (!reader.result || typeof reader.result !== 'string') {
              return reject("Failed to convert blob to base64.");
            }
            const base64Audio = reader.result.split(',')[1]; // Remove data:mime/type;base64, prefix
            resolve({ base64Audio, mimeType: blob.type });
          };

          reader.onerror = reject;
          reader.readAsDataURL(blob);
        } catch (downloadError) {
          reject("Error downloading or decrypting audio: " + downloadError.message);
        }
      } else {
        reject("Required media properties or download function not found for audio message. Message ID: " + messageId);
      }
    } else {
      reject("Message is not an audio message. Message ID: " + messageId);
    }
  });
}

// Listen for custom events from the content script to request audio data with JWT
document.addEventListener("whatsappGeminiTranscriber_getAudioData", async (event) => {
  const { messageId, jwtToken } = event.detail;
  try {
    console.log("[Inject] Processing audio data request with JWT for message:", messageId);
    const { base64Audio, mimeType } = await getWhatsAppAudioData(messageId, jwtToken);
    document.dispatchEvent(new CustomEvent("whatsappGeminiTranscriber_audioDataResponse", {
      detail: { messageId, base64Audio, mimeType }
    }));
  } catch (error) {
    console.error("[Inject] Error in JWT-authenticated getWhatsAppAudioData:", error);
    document.dispatchEvent(new CustomEvent("whatsappGeminiTranscriber_audioDataResponse", {
      detail: { messageId, error: error.message }
    }));
  }
});



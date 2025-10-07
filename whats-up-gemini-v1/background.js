// background.js

// Import JWT utilities
importScripts('jwt-utils.js');

let jwtUtils = null;

chrome.runtime.onInstalled.addListener(async () => {
  console.log("WhatsApp Gemini Transcriber installed.");
  
  // Initialize JWT utilities
  try {
    jwtUtils = new JWTUtils();
    await jwtUtils.initializeSecretKey();
    console.log("[Background] JWT utilities initialized");
  } catch (error) {
    console.error("[Background] Failed to initialize JWT utilities:", error);
  }
});

// Function to transcribe audio using Google Gemini API
async function transcribeAudioWithGemini(base64Audio, mimeType, apiKey) {
  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: "Please provide a transcript of this audio message."
            },
            {
              inline_data: {
                mime_type: mimeType || "audio/ogg",
                data: base64Audio // Base64 data is already without prefix
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unexpected response format from Gemini API");
    }
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle JWT token requests
  if (request.action === "getJWTToken") {
    console.log("[Background] JWT token requested");
    
    (async () => {
      try {
        if (!jwtUtils) {
          jwtUtils = new JWTUtils();
          await jwtUtils.initializeSecretKey();
        }
        
        const token = await jwtUtils.getValidToken(request.customClaims || {});
        sendResponse({ success: true, token: token });
      } catch (error) {
        console.error("[Background] JWT token generation failed:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    
    return true; // Indicate that sendResponse will be called asynchronously
  }

  // Handle JWT token validation
  if (request.action === "validateJWTToken") {
    console.log("[Background] JWT token validation requested");
    
    (async () => {
      try {
        if (!jwtUtils) {
          jwtUtils = new JWTUtils();
          await jwtUtils.initializeSecretKey();
        }
        
        const validation = await jwtUtils.validateToken(request.token);
        sendResponse({ success: true, validation: validation });
      } catch (error) {
        console.error("[Background] JWT token validation failed:", error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    
    return true; // Indicate that sendResponse will be called asynchronously
  }

  if (request.action === "getAudioData") {
    console.log("Received getAudioData request for message ID:", request.messageId);
    // Forward the request to the content script to be handled by the injected script
    chrome.tabs.sendMessage(sender.tab.id, { action: "forwardGetAudioData", messageId: request.messageId }, (response) => {
      sendResponse(response); // Send the response from the injected script back to the content script
    });
    return true; // Indicate that sendResponse will be called asynchronously
  }

  if (request.action === "transcribeAudio") {
    console.log("Received transcribeAudio request (base64):", request.base64Audio.substring(0, 50) + "...");
    
    // Get API key from storage
    chrome.storage.sync.get(["geminiApiKey"], async (result) => {
      if (!result.geminiApiKey) {
        sendResponse({ error: "Gemini API key not found. Please set it in the extension popup." });
        return;
      }

      try {
        // Transcribe using Gemini API
        const transcription = await transcribeAudioWithGemini(request.base64Audio, request.mimeType, result.geminiApiKey);
        
        sendResponse({ transcription: transcription });
      } catch (error) {
        console.error("Transcription error:", error);
        sendResponse({ error: error.message });
      }
    });
    
    return true; // Indicate that sendResponse will be called asynchronously
  }

  if (request.action === "saveApiKey") {
    chrome.storage.sync.set({ geminiApiKey: request.apiKey }, () => {
      console.log("Gemini API Key saved.");
      sendResponse({ status: "API Key saved." });
    });
    return true; // Indicate that sendResponse will be called asynchronously
  }

  if (request.action === "getApiKey") {
    chrome.storage.sync.get(["geminiApiKey"], (result) => {
      sendResponse({ apiKey: result.geminiApiKey });
    });
    return true; // Indicate that sendResponse will be called asynchronously
  }
});

// Keep-alive mechanism
chrome.runtime.onConnect.addListener(port => {
  if (port.name === "keep-alive") {
    setTimeout(() => port.disconnect(), 250 * 1000); // Disconnect after 250 seconds
    port.onDisconnect.addListener(() => {
      console.log("Keep-alive port disconnected, re-establishing...");
      // No need to re-establish here, content script will do it
    });
  }
});



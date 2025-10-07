// content.js

console.log("Whats up Gemini? content script loaded.");

// Use a self-executing anonymous function to create a private scope
(function() {
  // Check if the script has already been loaded in this context
  if (window.hasWhatsAppGeminiTranscriberLoaded) {
    console.log("Whats up Gemini? content script already loaded. Skipping re-initialization.");
    return;
  }
  window.hasWhatsAppGeminiTranscriberLoaded = true;

  // First inject page-compatible JWT utilities
  const jwtScript = document.createElement("script");
  jwtScript.src = chrome.runtime.getURL("page-jwt-utils.js");
  jwtScript.onload = () => {
    console.log("[Content] Page JWT utilities loaded successfully");
    jwtScript.remove();
    
    // Now inject lib.js to expose WhatsApp's internal Store objects
    const libScript = document.createElement("script");
    libScript.src = chrome.runtime.getURL("lib.js");
    libScript.onload = () => {
      console.log("[Content] lib.js loaded successfully");
      libScript.remove();
      
      // Wait a moment for lib.js to execute and expose Store objects
      setTimeout(() => {
        // Now inject the main inject script
        const injectScript = document.createElement("script");
        injectScript.src = chrome.runtime.getURL("inject.js");
        injectScript.onload = () => {
          console.log("[Content] inject.js loaded successfully");
          injectScript.remove();
        };
        injectScript.onerror = (error) => {
          console.error("[Content] Failed to load inject.js:", error);
        };
        (document.head || document.documentElement).appendChild(injectScript);
      }, 500); // Give lib.js time to execute
    };
    libScript.onerror = (error) => {
      console.error("[Content] Failed to load lib.js:", error);
    };
    (document.head || document.documentElement).appendChild(libScript);
  };
  jwtScript.onerror = (error) => {
    console.error("[Content] Failed to load page-jwt-utils.js:", error);
  };
  (document.head || document.documentElement).appendChild(jwtScript);

  // Listen for custom events from the injected script (responses to audio data requests)
  document.addEventListener("whatsappGeminiTranscriber_audioDataResponse", (event) => {
    const { messageId, base64Audio, mimeType, error } = event.detail;
    // Find the button associated with this messageId and update its state or trigger transcription
    const voiceMessageElement = document.querySelector(`[data-id="${messageId}"]`);
    if (!voiceMessageElement) return;

    const transcribeButton = voiceMessageElement.querySelector(".transcribe-button");
    if (!transcribeButton) return;

    if (error) {
      console.error("Error getting audio data from injected script:", error);
      displayTranscriptionResult(voiceMessageElement, `Error: ${error}`, true);
      transcribeButton.innerText = "Transcribe";
      transcribeButton.disabled = false;
      transcribeButton.style.backgroundColor = "#e0e0e0";
      return;
    }

    if (!base64Audio) {
      console.warn("Base64 audio data not received from injected script.");
      displayTranscriptionResult(voiceMessageElement, "Error: Audio data not found.", true);
      transcribeButton.innerText = "Transcribe";
      transcribeButton.disabled = false;
      transcribeButton.style.backgroundColor = "#e0e0e0";
      return;
    }

    console.log("Sending base64 audio for transcription (first 50 chars):", base64Audio.substring(0, 50));
          
    chrome.runtime.sendMessage({ action: "transcribeAudio", base64Audio: base64Audio, mimeType: mimeType }, (response) => {
      console.log("Transcription request response:", response);
      
      // Reset button state
      transcribeButton.innerText = "Transcribe";
      transcribeButton.disabled = false;
      transcribeButton.style.backgroundColor = "#e0e0e0";
      
      if (response.error) {
        // Display error message
        displayTranscriptionResult(voiceMessageElement, `Error: ${response.error}`, true);
      } else if (response.transcription) {
        // Display transcription result
        displayTranscriptionResult(voiceMessageElement, response.transcription, false);
      }
    });
  });

  function addTranscriptionButton(voiceMessageElement) {
    // Ensure it's a voice message and a button hasn't been added yet
    if (voiceMessageElement && !voiceMessageElement.dataset.transcribeButtonAdded) {
      const messageContainer = voiceMessageElement.closest(".message-in, .message-out");
      if (!messageContainer) return; // Not a message bubble

      const existingButton = messageContainer.querySelector(".transcribe-button");
      if (existingButton) return; // Button already exists

      const transcribeButton = document.createElement("button");
      transcribeButton.innerText = "Transcribe";
      transcribeButton.className = "transcribe-button";
      transcribeButton.style.marginLeft = "10px";
      transcribeButton.style.padding = "5px 10px";
      transcribeButton.style.border = "1px solid #ccc";
      transcribeButton.style.borderRadius = "5px";
      transcribeButton.style.cursor = "pointer";
      transcribeButton.style.backgroundColor = "#e0e0e0";
      transcribeButton.style.fontSize = "12px";

      transcribeButton.addEventListener("click", async () => {
        const messageId = voiceMessageElement.closest("[data-id]")?.dataset.id;
        if (!messageId) {
          console.warn("Message ID not found for voice message element.");
          displayTranscriptionResult(messageContainer, "Error: Message ID not found.", true);
          return;
        }

        console.log("Requesting audio data for message ID:", messageId);
        
        // Show loading state
        transcribeButton.innerText = "Transcribing...";
        transcribeButton.disabled = true;
        transcribeButton.style.backgroundColor = "#ccc";
        
        // Request JWT token before audio extraction
        try {
          const tokenResponse = await chrome.runtime.sendMessage({ 
            action: "getJWTToken", 
            customClaims: { messageId: messageId } 
          });
          
          if (!tokenResponse.success) {
            throw new Error("Failed to get JWT token: " + tokenResponse.error);
          }
          
          console.log("[Content] JWT token obtained for audio extraction");
          
          // Dispatch a custom event to the injected script to request audio data with JWT
          document.dispatchEvent(new CustomEvent("whatsappGeminiTranscriber_getAudioData", {
            detail: { 
              messageId: messageId,
              jwtToken: tokenResponse.token
            }
          }));
        } catch (error) {
          console.error("[Content] JWT token request failed:", error);
          displayTranscriptionResult(messageContainer, "Error: Authentication failed - " + error.message, true);
          
          // Reset button state
          transcribeButton.innerText = "Transcribe";
          transcribeButton.disabled = false;
          transcribeButton.style.backgroundColor = "#e0e0e0";
        }
      });

      // Insert the button next to the play button or duration
      const playButtonContainer = voiceMessageElement.querySelector("button[aria-label='Play voice message']");
      const durationElement = voiceMessageElement.querySelector("div[aria-hidden='true']");

      if (playButtonContainer) {
        playButtonContainer.parentElement.appendChild(transcribeButton);
      } else if (durationElement) {
        durationElement.parentElement.appendChild(transcribeButton);
      } else {
        // Fallback: append to the main voice message element
        voiceMessageElement.appendChild(transcribeButton);
      }
      
      voiceMessageElement.dataset.transcribeButtonAdded = "true";
    }
  }

  function displayTranscriptionResult(messageContainer, text, isError = false) {
    // Remove existing transcription result
    const existingResult = messageContainer.querySelector(".transcription-result");
    if (existingResult) {
      existingResult.remove();
    }

    // Create transcription result element
    const transcriptionDiv = document.createElement("div");
    transcriptionDiv.className = "transcription-result";
    transcriptionDiv.style.marginTop = "8px";
    transcriptionDiv.style.padding = "8px";
    transcriptionDiv.style.borderRadius = "8px";
    transcriptionDiv.style.fontSize = "14px";
    transcriptionDiv.style.lineHeight = "1.4";
    transcriptionDiv.style.wordWrap = "break-word";
    
    if (isError) {
      transcriptionDiv.style.backgroundColor = "#ffebee";
      transcriptionDiv.style.color = "#c62828";
      transcriptionDiv.style.border = "1px solid #ffcdd2";
    } else {
      // For successful transcriptions
      transcriptionDiv.style.backgroundColor = "#f5f5f5"; // Light gray
      transcriptionDiv.style.color = "#424242"; // Dark gray
      transcriptionDiv.style.border = "1px solid #e0e0e0"; // Gray border
    }
    
    transcriptionDiv.innerHTML = `<strong>${isError ? 'Error' : 'Transcription'}:</strong> ${text}`;
    
    // Insert after the message body
    const messageBody = messageContainer.querySelector(".message-body");
    if (messageBody) {
      messageBody.appendChild(transcriptionDiv);
    } else {
      messageContainer.appendChild(transcriptionDiv);
    }
  }

  // Keep-alive mechanism for service worker
  let keepAlivePort;

  function connectKeepAlivePort() {
    keepAlivePort = chrome.runtime.connect({ name: "keep-alive" });
    keepAlivePort.onDisconnect.addListener(() => {
      console.log("Keep-alive port disconnected, re-connecting...");
      setTimeout(connectKeepAlivePort, 5000); // Reconnect after 5 seconds
    });
  }

  connectKeepAlivePort();

  // Observe the DOM for new voice message elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const voiceMessageSpans = node.querySelectorAll("span[aria-label='Voice message']");
            voiceMessageSpans.forEach(span => {
              const voiceMessageElement = span.closest("div.x78zum5.x6s0dn4.xzt5al7.xjkvuk6");
              if (voiceMessageElement) {
                addTranscriptionButton(voiceMessageElement);
              }
            });
          }
        });
      }
    });
  });

  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });

  // Also check for existing voice message elements on page load
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("span[aria-label='Voice message']").forEach(span => {
      const voiceMessageElement = span.closest("div.x78zum5.x6s0dn4.xzt5al7.xjkvuk6");
      if (voiceMessageElement) {
        addTranscriptionButton(voiceMessageElement);
      }
    });
  });

  // Check for voice message elements after a short delay to catch dynamically loaded content
  setTimeout(() => {
    document.querySelectorAll("span[aria-label='Voice message']").forEach(span => {
      const voiceMessageElement = span.closest("div.x78zum5.x6s0dn4.xzt5al7.xjkvuk6");
      if (voiceMessageElement) {
        addTranscriptionButton(voiceMessageElement);
      }
    });
  }, 2000);
})();


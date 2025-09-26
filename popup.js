// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveApiKeyButton = document.getElementById("saveApiKeyButton");
  const statusMessage = document.getElementById("statusMessage");
  const toggleVisibility = document.getElementById("toggleVisibility");

  // Load saved API key
  chrome.runtime.sendMessage({ action: "getApiKey" }, (response) => {
    if (response && response.apiKey) {
      apiKeyInput.value = response.apiKey;
    }
  });

  // Toggle password visibility
  toggleVisibility.addEventListener("click", () => {
    if (apiKeyInput.type === "password") {
      apiKeyInput.type = "text";
      toggleVisibility.textContent = "🙈";
    } else {
      apiKeyInput.type = "password";
      toggleVisibility.textContent = "👁️";
    }
  });

  // Save API key
  saveApiKeyButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatusMessage("Please enter an API Key.", "error");
      return;
    }

    // Validate API key format (basic check)
    if (!apiKey.startsWith("AIza") || apiKey.length < 30) {
      showStatusMessage("Invalid API key format. Please check your key.", "error");
      return;
    }

    // Show loading state
    saveApiKeyButton.disabled = true;
    saveApiKeyButton.classList.add("loading");
    saveApiKeyButton.textContent = "Saving...";

    chrome.runtime.sendMessage({ action: "saveApiKey", apiKey: apiKey }, (response) => {
      // Reset button state
      saveApiKeyButton.disabled = false;
      saveApiKeyButton.classList.remove("loading");
      saveApiKeyButton.textContent = "Save API Key";

      if (response && response.status) {
        showStatusMessage("API Key saved successfully!", "success");
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          hideStatusMessage();
        }, 3000);
      } else {
        showStatusMessage("Failed to save API Key. Please try again.", "error");
      }
    });
  });

  // Handle Enter key in input field
  apiKeyInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      saveApiKeyButton.click();
    }
  });

  // Show status message with animation
  function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type} show`;
  }

  // Hide status message
  function hideStatusMessage() {
    statusMessage.classList.remove("show");
    setTimeout(() => {
      statusMessage.textContent = "";
      statusMessage.className = "status-message";
    }, 300);
  }

  // Auto-focus on API key input if empty
  if (!apiKeyInput.value) {
    apiKeyInput.focus();
  }
});


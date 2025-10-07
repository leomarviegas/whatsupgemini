# WhatsUpGemini - Installation Guide

Complete step-by-step guide for installing and configuring WhatsUpGemini Chrome extension.

---

## Prerequisites

Before installing WhatsUpGemini, ensure you have:

- ✅ **Google Chrome** (version 88 or higher) or any Chromium-based browser
- ✅ **WhatsApp Account** with access to WhatsApp Web
- ✅ **Google Account** for obtaining Gemini API key
- ✅ **Internet Connection** for API calls

---

## Installation Methods

### Method 1: Install from Source (Development Mode)

This method is for developers or users who want to install the extension from the GitHub repository.

#### Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/leomarviegas/whatsupgemini.git
cd whatsupgemini
```

Or download the ZIP file:
1. Visit https://github.com/leomarviegas/whatsupgemini
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file to a folder

#### Step 2: Obtain Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" button
4. Select a Google Cloud project (or create a new one)
5. Copy the generated API key (starts with `AIza...`)
6. **Important:** Keep this key secure and don't share it publicly

**API Key Example:**
```
AIzaSyABC123def456GHI789jkl012MNO345pqr678
```

#### Step 3: Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" button
5. Navigate to the cloned repository folder
6. Select the `whats-up-gemini-v1` folder
7. Click "Select Folder"

**Visual Guide:**
```
chrome://extensions/
    ↓
[Developer mode: ON]
    ↓
[Load unpacked]
    ↓
Select: /path/to/whatsupgemini/whats-up-gemini-v1/
    ↓
Extension loaded! ✅
```

#### Step 4: Configure API Key

1. Click the Extensions icon (puzzle piece) in Chrome toolbar
2. Find "WhatsUpGemini?" in the list
3. Click on the extension icon
4. Paste your Gemini API key in the input field
5. Click "Save API Key"
6. Wait for the success message: "API Key saved successfully!"

#### Step 5: Verify Installation

1. Open [WhatsApp Web](https://web.whatsapp.com)
2. Log in with your phone (scan QR code)
3. Navigate to any chat with voice messages
4. Look for "Transcribe" buttons next to voice messages
5. If buttons appear, installation is successful! ✅

---

### Method 2: Install from Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store in the future. This method will provide automatic updates and easier installation.

**Steps (when available):**
1. Visit Chrome Web Store
2. Search for "WhatsUpGemini"
3. Click "Add to Chrome"
4. Configure API key
5. Start using!

---

## Post-Installation Configuration

### Configuring the Extension

#### API Key Management

**To Save API Key:**
1. Click extension icon in Chrome toolbar
2. Enter your Gemini API key
3. Click "Save API Key"

**To View Saved API Key:**
1. Click extension icon
2. Click the eye icon (👁️) to toggle visibility
3. Key will be displayed in plain text

**To Update API Key:**
1. Click extension icon
2. Clear existing key
3. Enter new API key
4. Click "Save API Key"

#### Extension Permissions

The extension requires the following permissions:

| Permission | Purpose | Required |
|------------|---------|----------|
| `activeTab` | Access WhatsApp Web page | Yes |
| `storage` | Store API key securely | Yes |
| `*://*.whatsapp.com/*` | Run on WhatsApp Web only | Yes |

**To Review Permissions:**
1. Go to `chrome://extensions/`
2. Find "WhatsUpGemini?"
3. Click "Details"
4. Scroll to "Permissions" section

---

## Verification & Testing

### Test Installation

1. **Open WhatsApp Web**
   ```
   https://web.whatsapp.com
   ```

2. **Find a Voice Message**
   - Open any chat with voice messages
   - Or send yourself a voice message

3. **Click Transcribe**
   - Click the "Transcribe" button
   - Wait 2-5 seconds for processing
   - Transcription should appear below the message

### Expected Behavior

**Successful Transcription:**
- Button changes to "Transcribing..."
- After a few seconds, transcription appears in a gray box
- Button returns to "Transcribe" state

**Error Handling:**
- If API key is invalid, you'll see an error message
- If audio extraction fails, you'll see "Audio data not found"
- If network fails, you'll see "Network error"

---

## Troubleshooting Installation Issues

### Issue 1: Extension Not Loading

**Symptoms:**
- "Load unpacked" fails
- Error message appears

**Solutions:**
1. Ensure you selected the correct folder (`whats-up-gemini-v1`)
2. Check that `manifest.json` exists in the folder
3. Verify Chrome version is 88 or higher
4. Try restarting Chrome

### Issue 2: API Key Not Saving

**Symptoms:**
- "API Key saved successfully!" doesn't appear
- Key disappears after closing popup

**Solutions:**
1. Check Chrome storage permissions
2. Ensure you're signed in to Chrome
3. Try disabling and re-enabling the extension
4. Check Chrome sync settings

### Issue 3: Transcribe Button Not Appearing

**Symptoms:**
- No "Transcribe" buttons on voice messages
- Extension seems inactive

**Solutions:**
1. Refresh WhatsApp Web page (F5)
2. Check extension is enabled in `chrome://extensions/`
3. Verify you're on `web.whatsapp.com` (not `web.whatsapp.com/send`)
4. Check browser console for errors (F12)

### Issue 4: "Authentication Failed" Error

**Symptoms:**
- Clicking transcribe shows "Authentication failed"
- JWT token errors in console

**Solutions:**
1. Refresh WhatsApp Web page
2. Try clicking transcribe again (token may have expired)
3. Disable and re-enable the extension
4. Check system clock is correct

### Issue 5: API Key Format Error

**Symptoms:**
- "Invalid API key format" message
- Can't save API key

**Solutions:**
1. Verify key starts with `AIza`
2. Ensure key is at least 30 characters
3. Check for extra spaces or line breaks
4. Copy key directly from Google AI Studio

---

## Advanced Installation Options

### Installing on Multiple Browsers

WhatsUpGemini can be installed on any Chromium-based browser:

**Supported Browsers:**
- Google Chrome
- Microsoft Edge
- Brave Browser
- Opera
- Vivaldi

**Installation Steps:**
1. Follow the same steps as Chrome installation
2. Navigate to the browser's extensions page
3. Enable developer mode
4. Load unpacked extension

### Installing for Multiple Chrome Profiles

If you use multiple Chrome profiles:

1. Install extension in each profile separately
2. Each profile needs its own API key configuration
3. API keys are not shared between profiles

### Installing on Chrome OS

1. Open Chrome browser on Chrome OS
2. Follow standard installation steps
3. Extension works the same as on other platforms

---

## Updating the Extension

### Manual Updates (Development Mode)

1. Navigate to the repository folder
2. Run `git pull origin main` to get latest changes
3. Go to `chrome://extensions/`
4. Click the refresh icon on the extension card
5. Extension will reload with new code

### Automatic Updates (Chrome Web Store)

When installed from Chrome Web Store:
- Updates happen automatically
- No user action required
- Updates typically arrive within 24-48 hours

---

## Uninstallation

### Complete Removal

1. Go to `chrome://extensions/`
2. Find "WhatsUpGemini?"
3. Click "Remove"
4. Confirm removal

**Data Cleanup:**
- API key is automatically removed
- No residual data remains
- JWT secret is deleted

### Temporary Disable

To disable without removing:
1. Go to `chrome://extensions/`
2. Find "WhatsUpGemini?"
3. Toggle the switch to OFF
4. Extension remains installed but inactive

---

## Installation Checklist

Use this checklist to ensure proper installation:

- [ ] Chrome version 88 or higher installed
- [ ] Repository cloned or downloaded
- [ ] Developer mode enabled in Chrome
- [ ] Extension loaded from `whats-up-gemini-v1` folder
- [ ] Google Gemini API key obtained
- [ ] API key configured in extension popup
- [ ] WhatsApp Web opened and logged in
- [ ] Transcribe buttons visible on voice messages
- [ ] Test transcription successful

---

## Getting Help

If you encounter issues during installation:

1. **Check Documentation:**
   - [README.md](../README.md)
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
   - [FAQ.md](FAQ.md)

2. **Search Existing Issues:**
   - Visit [GitHub Issues](https://github.com/leomarviegas/whatsupgemini/issues)
   - Search for similar problems

3. **Report New Issue:**
   - Create a new issue with:
     - Chrome version
     - Operating system
     - Error messages
     - Steps to reproduce

4. **Community Support:**
   - Join [GitHub Discussions](https://github.com/leomarviegas/whatsupgemini/discussions)
   - Ask questions and get help from the community

---

## Next Steps

After successful installation:

1. **Read the User Guide:** [USER_GUIDE.md](USER_GUIDE.md)
2. **Explore Features:** Try transcribing different types of voice messages
3. **Customize Settings:** Configure according to your preferences
4. **Provide Feedback:** Share your experience and suggestions

---

**Installation Complete! 🎉**

You're now ready to transcribe WhatsApp voice messages with AI-powered accuracy!

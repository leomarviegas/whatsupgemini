// jwt-utils.js - JWT Token Generation and Validation Utilities

class JWTUtils {
  constructor() {
    this.secretKey = null;
    this.algorithm = 'HS256';
    this.tokenExpiry = 15 * 60 * 1000; // 15 minutes in milliseconds
  }

  // Initialize or retrieve the secret key
  async initializeSecretKey() {
    try {
      const stored = await chrome.storage.local.get(['jwtSecretKey']);
      if (stored.jwtSecretKey) {
        this.secretKey = stored.jwtSecretKey;
      } else {
        // Generate a new secret key
        this.secretKey = this.generateSecretKey();
        await chrome.storage.local.set({ jwtSecretKey: this.secretKey });
      }
      return this.secretKey;
    } catch (error) {
      console.error('Failed to initialize JWT secret key:', error);
      throw error;
    }
  }

  // Generate a cryptographically secure secret key
  generateSecretKey() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Create JWT header
  createHeader() {
    return {
      alg: this.algorithm,
      typ: 'JWT'
    };
  }

  // Create JWT payload
  createPayload(customClaims = {}) {
    const now = Date.now();
    return {
      iss: 'whatsupgemini-extension',
      sub: 'store-access',
      aud: 'whatsapp-web',
      exp: Math.floor((now + this.tokenExpiry) / 1000),
      iat: Math.floor(now / 1000),
      scope: ['store-read', 'audio-extract'],
      ...customClaims
    };
  }

  // Base64URL encode
  base64URLEncode(str) {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Base64URL decode
  base64URLDecode(str) {
    str += '='.repeat((4 - str.length % 4) % 4);
    return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  }

  // Create HMAC-SHA256 signature
  async createSignature(data, key) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const dataBuffer = encoder.encode(data);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
    return new Uint8Array(signature);
  }

  // Generate JWT token
  async generateToken(customClaims = {}) {
    try {
      if (!this.secretKey) {
        await this.initializeSecretKey();
      }

      const header = this.createHeader();
      const payload = this.createPayload(customClaims);

      const encodedHeader = this.base64URLEncode(JSON.stringify(header));
      const encodedPayload = this.base64URLEncode(JSON.stringify(payload));
      
      const data = `${encodedHeader}.${encodedPayload}`;
      const signature = await this.createSignature(data, this.secretKey);
      
      // Convert signature to base64URL
      const signatureArray = Array.from(signature);
      const signatureString = String.fromCharCode.apply(null, signatureArray);
      const encodedSignature = this.base64URLEncode(signatureString);

      const token = `${data}.${encodedSignature}`;
      
      console.log('[JWT] Token generated successfully');
      return token;
    } catch (error) {
      console.error('[JWT] Token generation failed:', error);
      throw error;
    }
  }

  // Validate JWT token
  async validateToken(token) {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token format');
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token structure');
      }

      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      
      // Decode and parse header and payload
      const header = JSON.parse(this.base64URLDecode(encodedHeader));
      const payload = JSON.parse(this.base64URLDecode(encodedPayload));

      // Verify algorithm
      if (header.alg !== this.algorithm) {
        throw new Error('Invalid algorithm');
      }

      // Verify expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }

      // Verify signature
      if (!this.secretKey) {
        await this.initializeSecretKey();
      }

      const data = `${encodedHeader}.${encodedPayload}`;
      const expectedSignature = await this.createSignature(data, this.secretKey);
      
      // Convert expected signature to base64URL for comparison
      const expectedSignatureArray = Array.from(expectedSignature);
      const expectedSignatureString = String.fromCharCode.apply(null, expectedSignatureArray);
      const expectedEncodedSignature = this.base64URLEncode(expectedSignatureString);

      if (encodedSignature !== expectedEncodedSignature) {
        throw new Error('Invalid signature');
      }

      console.log('[JWT] Token validated successfully');
      return { valid: true, payload };
    } catch (error) {
      console.error('[JWT] Token validation failed:', error);
      return { valid: false, error: error.message };
    }
  }

  // Check if token needs refresh (within 2 minutes of expiry)
  needsRefresh(payload) {
    if (!payload || !payload.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - now;
    return timeUntilExpiry < 120; // Refresh if less than 2 minutes remaining
  }

  // Get or generate a valid token
  async getValidToken(customClaims = {}) {
    try {
      // Try to get existing token
      const stored = await chrome.storage.local.get(['currentJWT']);
      
      if (stored.currentJWT) {
        const validation = await this.validateToken(stored.currentJWT);
        
        if (validation.valid && !this.needsRefresh(validation.payload)) {
          console.log('[JWT] Using existing valid token');
          return stored.currentJWT;
        }
      }

      // Generate new token
      console.log('[JWT] Generating new token');
      const newToken = await this.generateToken(customClaims);
      
      // Store the new token
      await chrome.storage.local.set({ currentJWT: newToken });
      
      return newToken;
    } catch (error) {
      console.error('[JWT] Failed to get valid token:', error);
      throw error;
    }
  }

  // Clear stored tokens
  async clearTokens() {
    try {
      await chrome.storage.local.remove(['currentJWT']);
      console.log('[JWT] Tokens cleared');
    } catch (error) {
      console.error('[JWT] Failed to clear tokens:', error);
    }
  }
}

// Export for use in different contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JWTUtils;
} else if (typeof window !== 'undefined') {
  window.JWTUtils = JWTUtils;
}

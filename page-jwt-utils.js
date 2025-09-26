// page-jwt-utils.js - Simplified JWT utilities for page context (no Chrome APIs)

class PageJWTUtils {
  constructor() {
    this.algorithm = 'HS256';
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

  // Validate JWT token structure and signature (without storage access)
  async validateTokenStructure(token, secretKey) {
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

      // Verify signature if secret key is provided
      if (secretKey) {
        const data = `${encodedHeader}.${encodedPayload}`;
        const expectedSignature = await this.createSignature(data, secretKey);
        
        // Convert expected signature to base64URL for comparison
        const expectedSignatureArray = Array.from(expectedSignature);
        const expectedSignatureString = String.fromCharCode.apply(null, expectedSignatureArray);
        const expectedEncodedSignature = this.base64URLEncode(expectedSignatureString);

        if (encodedSignature !== expectedEncodedSignature) {
          throw new Error('Invalid signature');
        }
      }

      console.log('[PageJWT] Token structure validated successfully');
      return { valid: true, payload };
    } catch (error) {
      console.error('[PageJWT] Token validation failed:', error);
      return { valid: false, error: error.message };
    }
  }

  // Simple token validation without storage (for basic structure checks)
  validateBasicToken(token) {
    try {
      if (!token || typeof token !== 'string') {
        return { valid: false, error: 'Invalid token format' };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token structure' };
      }

      const [encodedHeader, encodedPayload] = parts;
      
      // Decode and parse header and payload
      const header = JSON.parse(this.base64URLDecode(encodedHeader));
      const payload = JSON.parse(this.base64URLDecode(encodedPayload));

      // Verify algorithm
      if (header.alg !== this.algorithm) {
        return { valid: false, error: 'Invalid algorithm' };
      }

      // Verify expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return { valid: false, error: 'Token expired' };
      }

      // Basic validation passed (signature not checked without secret key)
      console.log('[PageJWT] Basic token validation passed');
      return { valid: true, payload, note: 'Signature not verified in page context' };
    } catch (error) {
      console.error('[PageJWT] Basic token validation failed:', error);
      return { valid: false, error: error.message };
    }
  }

  // Extract payload without validation (for debugging)
  extractPayload(token) {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(this.base64URLDecode(parts[1]));
      return payload;
    } catch (error) {
      console.error('[PageJWT] Failed to extract payload:', error);
      return null;
    }
  }
}

// Make available globally in page context
if (typeof window !== 'undefined') {
  window.PageJWTUtils = PageJWTUtils;
}

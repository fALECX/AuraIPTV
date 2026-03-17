/**
 * Secure storage utilities using Web Crypto API
 * Encrypts sensitive data before storing in localStorage
 */

// Generate a unique key based on the domain/origin
const getEncryptionKey = async () => {
    const salt = 'aura-iptv-salt-v1';
    const iterations = 100000;

    // Use a combination of origin and a static key derivation
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(`${window.location.origin}-${salt}`),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: new TextEncoder().encode(salt),
            iterations,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
};

const ENCRYPTION_IV = new Uint8Array(12); // Fixed IV for simplicity (in production, should be random per encryption)

/**
 * Encrypt a string value
 * @param {string} plainText - The text to encrypt
 * @returns {Promise<string>} Base64 encoded encrypted string
 */
export const encrypt = async (plainText) => {
    if (!plainText) return '';

    try {
        const key = await getEncryptionKey();
        const encodedData = new TextEncoder().encode(plainText);

        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: ENCRYPTION_IV },
            key,
            encodedData
        );

        // Convert to base64
        return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
    } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypt an encrypted string
 * @param {string} encryptedBase64 - Base64 encoded encrypted string
 * @returns {Promise<string>} Decrypted plain text
 */
export const decrypt = async (encryptedBase64) => {
    if (!encryptedBase64) return '';

    try {
        const key = await getEncryptionKey();

        // Convert from base64
        const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ENCRYPTION_IV },
            key,
            encryptedData
        );

        return new TextDecoder().decode(decryptedData);
    } catch (error) {
        console.error('Decryption failed:', error);
        // Return empty string if decryption fails (could be legacy unencrypted data)
        return '';
    }
};

/**
 * Check if a value looks like it's encrypted (base64 encoded)
 * @param {string} value - The value to check
 * @returns {boolean}
 */
export const isEncrypted = (value) => {
    if (!value || typeof value !== 'string') return false;
    // Base64 regex pattern
    return /^[A-Za-z0-9+/]+=*$/.test(value) && value.length > 20;
};

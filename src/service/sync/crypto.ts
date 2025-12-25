// src/service/sync/crypto.ts
import { SYNC_CONFIG } from './config'
import { logError } from './logger'

interface EncryptedData {
  iv: string
  content: string
}

async function getKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(`${SYNC_CONFIG.appSecret}:${userId}`),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('static-salt-bookmarks'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64)
  const len = binary_string.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

export async function encryptData(
  data: any,
  userId: string
): Promise<EncryptedData> {
  try {
    const key = await getKey(userId)
    // iv is generated as a Uint8Array
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encodedData = new TextEncoder().encode(JSON.stringify(data))

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    )

    return {
      // FIX: pass iv.buffer because the function expects ArrayBuffer, not Uint8Array
      iv: arrayBufferToBase64(iv.buffer),
      content: arrayBufferToBase64(encryptedContent),
    }
  } catch (e) {
    logError('Encryption failed', e)
    throw e
  }
}

export async function decryptData(
  data: EncryptedData,
  userId: string
): Promise<any> {
  try {
    const key = await getKey(userId)
    const iv = base64ToArrayBuffer(data.iv)
    const content = base64ToArrayBuffer(data.content)

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      content
    )

    const decodedString = new TextDecoder().decode(decryptedBuffer)
    return JSON.parse(decodedString)
  } catch (e) {
    logError('Decryption failed (Bad key or data corruption)', e)
    throw e
  }
}

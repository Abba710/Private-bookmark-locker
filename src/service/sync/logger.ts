// src/service/sync/logger.ts
import { SYNC_CONFIG } from './config'

export function log(message: string, ...args: any[]) {
  if (SYNC_CONFIG.enableLogging) {
    const timestamp = new Date().toLocaleTimeString()
    console.log(
      `%c[Sync ${timestamp}] ${message}`,
      'color: #0ea5e9; font-weight: bold;',
      ...args
    )
  }
}

export function logError(message: string, error: any) {
  if (SYNC_CONFIG.enableLogging) {
    console.error(
      `%c[Sync Error] ${message}`,
      'color: #ef4444; font-weight: bold;',
      error
    )
  }
}

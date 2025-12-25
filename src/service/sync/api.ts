// src/service/sync/api.ts
import { supabase } from '@/service/supabase'
import type { Bookmark } from '@/types/types'
import { encryptData, decryptData } from './crypto'
import { log, logError } from './logger'

export async function fetchRemoteBookmarks(
  userId: string
): Promise<{ bookmarks: Bookmark[]; updatedAt: number } | null> {
  const { data, error } = await supabase
    .from('user_bookmarks')
    .select('bookmarks, updated_at')
    .eq('user_id', userId)
    .single()

  if (error) {
    // PGRST116 indicates no record was found, which is a normal case for new users
    if (error.code !== 'PGRST116') logError('Supabase fetch error', error)
    return null
  }

  let bookmarks: Bookmark[] = []

  // CHECK: Is this new encrypted data or legacy JSON?
  if (data.bookmarks && (data.bookmarks as any).iv) {
    log('🔐 Data is encrypted, decrypting...')
    try {
      bookmarks = await decryptData(data.bookmarks as any, userId)
    } catch (e) {
      logError('Critical: Could not decrypt remote bookmarks', e)
      // Return null to prevent overwriting local data with corrupted state
      return null
    }
  } else {
    log('⚠️ Data is unencrypted (Legacy)')
    bookmarks = data.bookmarks as Bookmark[]
  }

  return {
    bookmarks,
    updatedAt: new Date(data.updated_at).getTime(),
  }
}

export async function uploadBookmarks(
  userId: string,
  bookmarks: Bookmark[]
): Promise<boolean> {
  const now = new Date().toISOString()

  log('🔐 Encrypting before upload...')
  const encryptedPayload = await encryptData(bookmarks, userId)

  const { error } = await supabase.from('user_bookmarks').upsert(
    {
      user_id: userId,
      bookmarks: encryptedPayload,
      updated_at: now,
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    logError('Upload failed', error)
    return false
  }
  return true
}

export async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_bookmarks')
      .select('user_id')
      .limit(1)
    return !error
  } catch {
    return false
  }
}

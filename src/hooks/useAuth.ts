import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/service/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User } from '@/types/types'

interface ChromeManifest {
  oauth2?: {
    client_id: string
    scopes: string[]
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const mapUser = (u: SupabaseUser): User => ({
    id: u.id,
    mail: u.email,
  })

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ? mapUser(session.user) : null)
      setLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(() => {
    const manifest = chrome.runtime.getManifest() as ChromeManifest

    if (!manifest.oauth2) {
      console.error('oauth2 is missing in manifest')
      return
    }

    const clientId = manifest.oauth2.client_id
    const scopes = manifest.oauth2.scopes.join(' ')
    const redirectUri = chrome.identity.getRedirectURL()

    const authUrl = new URL('https://accounts.google.com/o/oauth2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'id_token')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('prompt', 'select_account')

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true,
      },
      async (redirectedTo) => {
        if (chrome.runtime.lastError || !redirectedTo) {
          console.error('Auth failed', chrome.runtime.lastError)
          return
        }

        const redirectedUrl = new URL(redirectedTo)
        const params = new URLSearchParams(redirectedUrl.hash.replace('#', ''))

        const idToken = params.get('id_token')

        if (!idToken) {
          console.error('id_token not found')
          return
        }

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        })

        console.log('Supabase signInWithIdToken response', { data })

        if (error) {
          console.error('Supabase auth error', error)
          return
        }

        if (data.session?.user) {
          setUser(mapUser(data.session.user))
          console.log(data)
        }
      }
    )
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
  }
}

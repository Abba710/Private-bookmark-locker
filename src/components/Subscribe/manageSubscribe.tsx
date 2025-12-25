import { useState } from 'preact/hooks'
import { ExternalLink, Loader2, Settings2 } from 'lucide-react'
import { supabase } from '@/service/supabase' // Path to your Supabase client

export default function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenPortal = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      // IMPORTANT: Get the current session to pass the access token
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        throw new Error('Not authenticated. Please log in.')
      }

      // Invoke the Edge Function with the correct authorization headers
      const { data, error } = await supabase.functions.invoke(
        'get-portal-url',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (error) {
        console.error('Function error:', error)
        throw error
      }

      if (data?.url) {
        // Open the portal in a new tab
        window.open(data.url, '_blank', 'noopener,noreferrer')
      } else {
        throw new Error('Portal URL not found in response')
      }
    } catch (err) {
      console.error('Portal Error:', err)

      // Provide a more informative error message
      const message =
        err instanceof Error ? err.message : 'Unknown error occurred'
      alert(`Failed to open subscription portal: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleOpenPortal}
      disabled={isLoading}
      className={`
        flex items-center justify-between w-full px-4 py-3 
        bg-white/[0.03] border border-white/10 rounded-xl
        hover:bg-white/[0.06] hover:border-white/20 
        transition-all duration-200 group
        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
          <Settings2 size={18} />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">Subscription Plan</p>
          <p className="text-xs text-zinc-500">Manage billing and invoices</p>
        </div>
      </div>

      {isLoading ? (
        <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
      ) : (
        <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
      )}
    </button>
  )
}

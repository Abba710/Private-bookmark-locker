import { useNotificationDialogStore } from '@/storage/statelibrary'
import { useState, useEffect } from 'preact/hooks'
import {
  X,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  ScrollText,
} from 'lucide-react'

/**
 * MarkdownRenderer
 * Clean typography for Reddit selftext content.
 */
function MarkdownRenderer({ text }: { text: string }) {
  const parseMarkdown = (markdown: string) => {
    let html = markdown
    // Headers
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-sm font-bold text-white mt-4 mb-2">$1</h3>'
    )
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-base font-bold text-white mt-5 mb-2">$2</h2>'
    )

    // Formatting
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold text-zinc-100">$1</strong>'
    )
    html = html.replace(
      /\*(.*?)\*/g,
      '<em class="italic text-zinc-300">$1</em>'
    )

    // Inline Code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono text-indigo-300">$1</code>'
    )

    // Lists
    html = html.replace(
      /^\* (.*$)/gim,
      '<li class="ml-4 list-disc text-zinc-400 mb-1">$1</li>'
    )
    html = html.replace(
      /^- (.*$)/gim,
      '<li class="ml-4 list-disc text-zinc-400 mb-1">$1</li>'
    )

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" class="text-indigo-400 hover:underline">$1</a>'
    )

    const paragraphs = html
      .split('\n\n')
      .map((p) => (p.trim() ? `<p class="mb-3">${p}</p>` : ''))
      .join('')
    return paragraphs
  }

  return (
    <div
      className="text-zinc-400 text-[13px] leading-relaxed select-text"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }}
    />
  )
}

/**
 * RedditPostCard
 * Premium card for Reddit content integration.
 */
function RedditPostCard({ postUrl }: { postUrl: string }) {
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const urlObj = new URL(postUrl)
        const jsonUrl = `https://www.reddit.com${urlObj.pathname}.json`
        const response = await fetch(jsonUrl)
        const data = await response.json()
        setPost(data[0].data.children[0].data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postUrl])

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 bg-white/[0.02] rounded-2xl border border-white/5">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
      </div>
    )

  if (!post)
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        Content unavailable
      </div>
    )

  return (
    <div className="bg-[#161618] border border-white/5 rounded-2xl p-5 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 shadow-inner">
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-white leading-snug tracking-tight">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-zinc-500">
          <span className="text-indigo-400">u/{post.author}</span>
          <span>•</span>
          <span>r/{post.subreddit}</span>
        </div>
      </div>

      {post.selftext && (
        <div className="mb-4 border-t border-white/5 pt-4">
          <MarkdownRenderer text={post.selftext} />
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-bold">
          <ThumbsUp className="w-3.5 h-3.5" />
          {post.score}
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-bold">
          <MessageSquare className="w-3.5 h-3.5" />
          {post.num_comments}
        </div>
      </div>
    </div>
  )
}

/**
 * ChangelogDialog
 * The main notification/update modal.
 */
export default function ChangelogDialog() {
  const { notificationOpen, setNotificationOpen } = useNotificationDialogStore()
  const redditPostUrl =
    'https://www.reddit.com/user/Sad-Bed-3125/comments/1p66zu1/private_bookmark_locker_changelog_v_107/'

  if (!notificationOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setNotificationOpen(false)}
      />

      <div className="relative w-full max-w-[500px] bg-[#0f0f11] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Accent Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />

        <button
          onClick={() => setNotificationOpen(false)}
          className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8">
          <div className="flex flex-col items-center text-center mb-8 pt-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-white/10 flex items-center justify-center mb-5 shadow-inner ring-1 ring-white/5">
              <ScrollText className="w-7 h-7 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              What's New
            </h2>
            <p className="text-zinc-500 text-sm font-medium">
              Version 1.0.7 is here with new features
            </p>
          </div>

          <RedditPostCard postUrl={redditPostUrl} />

          <div className="mt-8 space-y-3">
            <button
              onClick={() => window.open(redditPostUrl, '_blank')}
              className="group relative w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full duration-500 transition-transform -skew-x-12 -translate-x-full" />
              <span className="relative flex items-center justify-center gap-2 text-sm">
                Open Full Post on Reddit
                <ExternalLink className="w-4 h-4" />
              </span>
            </button>

            <button
              onClick={() => setNotificationOpen(false)}
              className="w-full py-3 text-sm font-semibold text-zinc-500 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

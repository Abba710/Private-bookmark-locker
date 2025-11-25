import { useNotificationDialogStore } from '@/storage/statelibrary'
import { useState, useEffect } from 'react'

interface RedditPost {
  title: string
  author: string
  subreddit: string
  permalink: string
  selftext: string
  selftext_html?: string
  score: number
  num_comments: number
  created_utc: number
}

function MarkdownRenderer({ text }: { text: string }) {
  // Simple markdown parser for basic elements
  const parseMarkdown = (markdown: string) => {
    let html = markdown

    // Headers
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-base font-semibold mt-3 mb-2">$1</h3>'
    )
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>'
    )
    html = html.replace(
      /^# (.*$)/gim,
      '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>'
    )

    // Bold text
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold">$1</strong>'
    )
    html = html.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>')

    // Italic text
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>')

    // Strikethrough text
    html = html.replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>')

    // Inline code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>'
    )

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>'
    )

    // Unordered lists
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')

    // Blockquotes
    html = html.replace(
      /^&gt; (.*$)/gim,
      '<blockquote class="border-l-2 border-white/30 pl-3 italic text-white/70">$1</blockquote>'
    )
    html = html.replace(
      /^> (.*$)/gim,
      '<blockquote class="border-l-2 border-white/30 pl-3 italic text-white/70">$1</blockquote>'
    )

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="border-white/20 my-3" />')
    html = html.replace(/^\*\*\*$/gim, '<hr class="border-white/20 my-3" />')

    // Code blocks
    html = html.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="bg-black/30 p-3 rounded-lg overflow-x-auto my-2"><code class="text-xs font-mono">$2</code></pre>'
    )

    // Paragraphs (split by double line breaks)
    const paragraphs = html
      .split('\n\n')
      .map((p) => (p.trim() ? `<p class="mb-2">${p}</p>` : ''))
      .join('')

    return paragraphs
  }

  return (
    <div
      className="prose prose-invert prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }}
    />
  )
}

function RedditPostCard({ postUrl }: { postUrl: string }) {
  const [post, setPost] = useState<RedditPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Extract path from URL and add .json
        const urlObj = new URL(postUrl)
        const jsonUrl = `https://www.reddit.com${urlObj.pathname}.json`

        const response = await fetch(jsonUrl)
        const data = await response.json()
        const postData = data[0].data.children[0].data

        setPost({
          title: postData.title,
          author: postData.author,
          subreddit: postData.subreddit,
          permalink: postData.permalink,
          selftext: postData.selftext,
          selftext_html: postData.selftext_html,
          score: postData.score,
          num_comments: postData.num_comments,
          created_utc: postData.created_utc,
        })
        setLoading(false)
      } catch (error) {
        console.error('Failed to load Reddit post:', error)
        setLoading(false)
      }
    }

    fetchPost()
  }, [postUrl])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-8 text-white/60">Failed to load post</div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-[400px] overflow-y-auto">
      {/* Post title */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-white leading-tight">
          {post.title}
        </h3>
      </div>

      {/* Post metadata */}
      <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
        <span>Posted by u/{post.author}</span>
        <span>•</span>
        <span>in r/{post.subreddit}</span>
      </div>

      {/* Post content with markdown formatting */}
      {post.selftext && (
        <div className="text-sm text-white/80 leading-relaxed mb-3">
          <MarkdownRenderer text={post.selftext} />
        </div>
      )}

      {/* Post stats */}
      <div className="flex items-center gap-4 text-xs text-white/60 pt-3 border-t border-white/10">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          {post.score} upvotes
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
          {post.num_comments} comments
        </span>
      </div>
    </div>
  )
}

export default function ChangelogDialog() {
  const changelogOpen = useNotificationDialogStore(
    (state) => state.notificationOpen
  )
  const setChangelogOpen = useNotificationDialogStore(
    (state) => state.setNotificationOpen
  )

  const redditPostUrl =
    'https://www.reddit.com/user/Sad-Bed-3125/comments/1p66zu1/private_bookmark_locker_changelog_v_107/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button'

  return (
    <>
      {changelogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/10 border border-white/20 rounded-xl shadow-lg w-[480px] max-w-[90vw] p-6 text-white">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-center leading-snug">
              Changelog
            </h2>

            <p className="text-white/80 text-sm text-center mb-4">
              You can read the latest updates on my reddit post below:
            </p>

            <RedditPostCard postUrl={redditPostUrl} />

            <button
              onClick={() => window.open(redditPostUrl, '_blank')}
              className="w-full mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-center text-sm"
            >
              Open Full Post on Reddit →
            </button>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setChangelogOpen(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

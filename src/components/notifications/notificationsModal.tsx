import { useNotificationDialogStore } from '@/storage/statelibrary'
import { useState, useEffect } from 'react'

interface RedditPost {
  title: string
  author: string
  subreddit: string
  permalink: string
  selftext: string
  score: number
  num_comments: number
  created_utc: number
}

function RedditPostCard({ postUrl }: { postUrl: string }) {
  const [post, setPost] = useState<RedditPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
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
      <div className="mb-3">
        <h3 className="text-base font-semibold text-white leading-tight">
          {post.title}
        </h3>
      </div>

      <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
        <span>Posted by u/{post.author}</span>
        <span>•</span>
        <span>in r/{post.subreddit}</span>
      </div>

      {post.selftext && (
        <div className="text-sm text-white/80 leading-relaxed mb-3 whitespace-pre-wrap">
          {post.selftext.length > 300
            ? `${post.selftext.substring(0, 300)}...`
            : post.selftext}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-white/60">
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
    'https://www.reddit.com/r/chrome_extensions/comments/1ogcr5g/a_trick_i_found_with_the_bookmark_manager_i_built/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button'

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

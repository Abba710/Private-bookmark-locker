import { useNotificationDialogStore } from "@/storage/statelibrary";
import { useState, useEffect } from "preact/hooks";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  MessageSquare,
  ThumbsUp,
  ExternalLink,
  ScrollText,
} from "lucide-react";

/**
 * MarkdownRenderer
 * Clean typography for Reddit selftext content.
 */
function MarkdownRenderer({ text }: { text: string }) {
  const parseMarkdown = (markdown: string) => {
    let html = markdown;
    // Headers
    html = html.replace(
      /^### (.*$)/gim,
      '<h3 class="text-sm font-bold text-white mt-4 mb-2">$1</h3>',
    );
    html = html.replace(
      /^## (.*$)/gim,
      '<h2 class="text-base font-bold text-white mt-5 mb-2">$1</h2>',
    );

    // Formatting
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold text-zinc-100">$1</strong>',
    );
    html = html.replace(
      /\*(.*?)\*/g,
      '<em class="italic text-zinc-300">$1</em>',
    );

    // Inline Code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono text-indigo-300">$1</code>',
    );

    // Lists
    html = html.replace(
      /^\* (.*$)/gim,
      '<li class="ml-4 list-disc text-zinc-400 mb-1">$1</li>',
    );
    html = html.replace(
      /^- (.*$)/gim,
      '<li class="ml-4 list-disc text-zinc-400 mb-1">$1</li>',
    );

    // Links — reuse the same accent link style as the login modal's terms/privacy links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="ds-link--accent">$1</a>',
    );

    const paragraphs = html
      .split("\n\n")
      .map((p) => (p.trim() ? `<p class="mb-3">${p}</p>` : ""))
      .join("");
    return paragraphs;
  };

  return (
    <div
      className="text-zinc-400 text-[13px] leading-relaxed select-text"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }}
    />
  );
}

/**
 * RedditPostCard
 * Content well inside the ds-login-card. No new component classes invented —
 * just the same subtle white/5 border + white/[0.02] fill already used for
 * secondary surfaces in this app.
 */
function RedditPostCard({ postUrl }: { postUrl: string }) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const urlObj = new URL(postUrl);
        const jsonUrl = `https://www.reddit.com${urlObj.pathname}.json`;
        const response = await fetch(jsonUrl);
        const data = await response.json();
        setPost(data[0].data.children[0].data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postUrl]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
      </div>
    );

  if (!post)
    return (
      <div className="ds-text-tertiary text-center py-8 text-sm">
        {chrome.i18n.getMessage("app_changelog_unavailable")}
      </div>
    );

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 max-h-[380px] overflow-y-auto">
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

      <div className="flex items-center gap-4 pt-4 border-t border-white/5 text-zinc-500 text-[11px] font-bold">
        <div className="flex items-center gap-1.5">
          <ThumbsUp size={14} />
          {post.score}
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare size={14} />
          {post.num_comments}
        </div>
      </div>
    </div>
  );
}

/**
 * ChangelogDialog
 * The main notification/update modal — now built on the same ds-tpl-login /
 * ds-login-card shell as LockOverlay: same glass card, top accent glow,
 * spring transitions, and typography scale.
 */
export default function ChangelogDialog() {
  const { notificationOpen, setNotificationOpen } =
    useNotificationDialogStore();
  const redditPostUrl =
    "https://www.reddit.com/user/Sad-Bed-3125/comments/1usmqr9/locker_private_bookmark_locker_v220_fullscreen/";

  if (!notificationOpen) return null;

  return (
    <AnimatePresence>
      <div className="ds-section ds-section-marker h-full">
        <div className="fixed inset-0 bg-[var(--ds-bg)] backdrop-blur-md z-[100] flex items-center justify-center p-4">
          {/* same backdrop treatment as before — LockOverlay has no backdrop of its own
            since it can't be dismissed, but this modal needs one */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 "
            onClick={() => setNotificationOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="ds-tpl-login"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40  text-indigo-400 opacity-[0.08] blur-[60px] rounded-full pointer-events-none" />

            <div className="ds-login-card relative">
              <button
                onClick={() => setNotificationOpen(false)}
                className="absolute top-6 cursor-pointer right-6 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                aria-label={chrome.i18n.getMessage("app_changelog_dismiss")}
              >
                <X size={18} />
              </button>

              <div className="ds-login-logo">
                <span className="ds-login-logo-mark">
                  <ScrollText size={16} className="text-indigo-400" />
                </span>
              </div>

              <div className="ds-login-header">
                <h2 className="ds-login-title">
                  {chrome.i18n.getMessage("app_changelog_modal_title")}
                </h2>
              </div>

              <RedditPostCard postUrl={redditPostUrl} />

              <button
                onClick={() => window.open(redditPostUrl, "_blank")}
                className="btn btn--primary mt-4"
              >
                <span className="flex items-center justify-center gap-2">
                  {chrome.i18n.getMessage("app_changelog_open_reddit")}
                  <ExternalLink size={16} />
                </span>
              </button>

              <p
                onClick={() => setNotificationOpen(false)}
                className="ds-text-tertiary text-center cursor-pointer hover:text-white transition-colors mt-2"
              >
                {chrome.i18n.getMessage("app_changelog_dismiss")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

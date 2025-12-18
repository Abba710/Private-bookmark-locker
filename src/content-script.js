// content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_METRICS') {
    // Determine the true scroll height of the page
    const body = document.body
    const html = document.documentElement

    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    )
    const width = Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth
    )

    // Force hide scrollbars for a clean screenshot
    const originalOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    sendResponse({
      width,
      height,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio,
    })
    return true
  }

  if (request.type === 'SCROLL_TO') {
    // Reliable scrolling for any site structure
    window.scrollTo(0, request.y)
    document.documentElement.scrollTop = request.y
    document.body.scrollTop = request.y

    // Small delay to allow images/content to render after scroll
    setTimeout(() => {
      sendResponse({ success: true, currentY: window.scrollY })
    }, 200)
    return true
  }
})

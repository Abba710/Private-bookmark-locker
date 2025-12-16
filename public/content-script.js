// content-script.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureFullPage') {
    captureFullPageScreenshots()
      .then((screenshots) => {
        sendResponse({ success: true, screenshots })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }
})

async function captureFullPageScreenshots() {
  const screenshots = []

  const originalScrollY = window.scrollY
  const originalScrollX = window.scrollX

  const pageHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  )

  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth

  let currentPosition = 0

  while (currentPosition < pageHeight) {
    window.scrollTo(0, currentPosition)

    await new Promise((resolve) => setTimeout(resolve, 300))

    const screenshot = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, resolve)
    })

    screenshots.push({
      dataUrl: screenshot,
      offsetY: currentPosition,
      viewportHeight: viewportHeight,
      viewportWidth: viewportWidth,
    })

    currentPosition += viewportHeight
  }

  window.scrollTo(originalScrollX, originalScrollY)

  return {
    screenshots,
    pageHeight,
    pageWidth: viewportWidth,
  }
}

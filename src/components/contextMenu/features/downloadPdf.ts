/**
 * Converts Base64 string from Chrome Debugger to a downloadable Blob
 */
function b64toBlob(b64Data: string, contentType = '') {
  const sliceSize = 512
  const byteCharacters = atob(b64Data)
  const byteArrays = []
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    const byteArraysItem = new Uint8Array(byteNumbers)
    byteArrays.push(byteArraysItem)
  }
  return new Blob(byteArrays, { type: contentType })
}

/**
 * Main function to export a URL to PDF using Chrome Debugger API
 * Styled to match the Premium Modern Dark UI
 */
const exportToPDF = async (url: string) => {
  if (!url) {
    alert('No URL provided')
    return
  }

  // PREMIUM UI FEEDBACK (Toast)
  const loadingToast = document.createElement('div')
  loadingToast.className = `
    fixed top-6 left-1/2 -translate-x-1/2 z-[10000] 
    flex items-center gap-4 
    bg-[#0f0f11]/80 backdrop-blur-xl 
    border border-white/10 
    text-white text-sm font-medium
    px-6 py-3 rounded-2xl 
    shadow-[0_20px_50px_rgba(0,0,0,0.5)]
    animate-in fade-in slide-in-from-top-4 duration-300
  `

  const spinner = document.createElement('div')
  spinner.className = `
    w-5 h-5 rounded-full 
    border-2 border-indigo-500/30 border-t-indigo-500 
    animate-spin
  `

  const text = document.createElement('span')
  text.className = 'tracking-tight'
  text.textContent = 'Generating high-quality PDF...'

  loadingToast.appendChild(spinner)
  loadingToast.appendChild(text)
  document.body.appendChild(loadingToast)

  let tab: chrome.tabs.Tab | undefined

  try {
    // 1. Create a new tab (background)
    tab = await chrome.tabs.create({ url, active: true })

    // 2. Wait for the page to load
    await new Promise<void>((resolve) => {
      const listener = (tid: number, info: any) => {
        if (tid === tab!.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener)
          resolve()
        }
      }
      chrome.tabs.onUpdated.addListener(listener)
    })

    const target = { tabId: tab.id! }

    // 3. Attach debugger
    await chrome.debugger.attach(target, '1.3')

    // 4. Setup environment
    await chrome.debugger.sendCommand(target, 'Page.enable')
    await chrome.debugger.sendCommand(target, 'Emulation.setEmulatedMedia', {
      media: 'screen',
    })

    // Wait for dynamic content/fonts
    await new Promise((r) => setTimeout(r, 2000))

    // 5. Measure dimensions
    const metricsResult: any = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => ({
        width:
          document.documentElement.offsetWidth || document.body.scrollWidth,
        height:
          document.documentElement.offsetHeight || document.body.scrollHeight,
      }),
    })

    const { width, height } = metricsResult[0].result

    // 6. Force frame paint to prevent blank pages
    await chrome.debugger.sendCommand(target, 'Runtime.evaluate', {
      expression:
        'new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))',
      awaitPromise: true,
    })

    // 7. Generate PDF
    const result: any = await chrome.debugger.sendCommand(
      target,
      'Page.printToPDF',
      {
        printBackground: true,
        displayHeaderFooter: false,
        paperWidth: width / 96,
        paperHeight: height / 96,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        preferCSSPageSize: false,
        generateDocumentOutline: true,
      }
    )

    if (!result?.data) throw new Error('PDF data is empty')

    // 8. Handle output
    const pdfBlob = b64toBlob(result.data, 'application/pdf')
    const pdfUrl = URL.createObjectURL(pdfBlob)

    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${
      new URL(url).hostname
    }-${new Date().toLocaleDateString()}.pdf`
    link.click()

    // 9. Cleanup
    await chrome.debugger.detach(target)
    URL.revokeObjectURL(pdfUrl)
  } catch (error: any) {
    console.error('Print Error:', error)
    // Small error toast logic could go here
  } finally {
    // Smooth fade out
    loadingToast.style.opacity = '0'
    loadingToast.style.transition = 'opacity 300ms ease'
    setTimeout(() => {
      if (document.body.contains(loadingToast))
        document.body.removeChild(loadingToast)
    }, 300)

    if (tab?.id) chrome.tabs.remove(tab.id)
  }
}

export default exportToPDF

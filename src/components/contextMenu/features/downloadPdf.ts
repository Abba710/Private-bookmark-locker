// exportToPDF.ts

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
 */
const exportToPDF = async (url: string) => {
  if (!url) {
    alert('No URL provided')
    return
  }

  // UI Feedback in the current document
  const loadingToast = document.createElement('div')
  loadingToast.className =
    'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] ' +
    'flex items-center gap-3 ' +
    'bg-white/10 backdrop-blur-md ' +
    'border border-white/20 ' +
    'text-white text-sm font-sans ' +
    'px-4 py-2 rounded-xl ' +
    'shadow-lg ' +
    'animate-[fadeInDown_200ms_ease-out]'

  const spinner = document.createElement('div')
  spinner.className =
    'w-4 h-4 rounded-full ' +
    'border-2 border-white/30 border-t-white ' +
    'animate-spin'

  const text = document.createElement('span')
  text.textContent = 'Preparing the download...'

  loadingToast.appendChild(spinner)
  loadingToast.appendChild(text)
  document.body.appendChild(loadingToast)

  let tab: chrome.tabs.Tab | undefined

  try {
    // 1. Create a new tab (background)
    tab = await chrome.tabs.create({ url, active: true })

    // 2. Wait for the page to load completely
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

    // 4. Setup environment for "Screen" view
    await chrome.debugger.sendCommand(target, 'Page.enable')
    await chrome.debugger.sendCommand(target, 'Emulation.setEmulatedMedia', {
      media: 'screen',
    })

    // Wait for CSS styles to settle
    await new Promise((r) => setTimeout(r, 2500))

    // 5. Measure actual page dimensions
    const metricsResult: any = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: () => {
        window.scrollTo(0, 0)
        return {
          width:
            document.documentElement.offsetWidth || document.body.scrollWidth,
          height:
            document.documentElement.offsetHeight || document.body.scrollHeight,
        }
      },
    })

    const { width, height } = metricsResult[0].result

    // 6. FORCE RENDER: Ensures the PDF isn't blank by waiting for a frame paint
    await chrome.debugger.sendCommand(target, 'Runtime.evaluate', {
      expression:
        'new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))',
      awaitPromise: true,
    })

    // 7. Generate PDF via Chrome's native print engine
    const result: any = await chrome.debugger.sendCommand(
      target,
      'Page.printToPDF',
      {
        printBackground: true,
        displayHeaderFooter: false,
        paperWidth: width / 96, // Convert pixels to inches
        paperHeight: height / 96,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        preferCSSPageSize: false,
        generateDocumentOutline: true,
      }
    )

    if (!result || !result.data) {
      throw new Error('Failed to retrieve PDF data from Chrome')
    }

    // 8. Handle the output
    const pdfBlob = b64toBlob(result.data, 'application/pdf')
    const pdfUrl = URL.createObjectURL(pdfBlob)

    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${new URL(url).hostname}-${
      new Date().toISOString().split('T')[0]
    }.pdf`
    link.click()

    // 9. Cleanup
    await chrome.debugger.detach(target)
    URL.revokeObjectURL(pdfUrl)
  } catch (error: any) {
    console.error('Print Error:', error)
    alert('Capture failed: ' + error.message)

    // Attempt to detach if error occurs after attach
    if (tab?.id) {
      chrome.debugger.detach({ tabId: tab.id }).catch(() => {})
    }
  } finally {
    if (document.body.contains(loadingToast)) {
      document.body.removeChild(loadingToast)
    }
    if (tab?.id) {
      chrome.tabs.remove(tab.id)
    }
  }
}

// Exporting the function so it can be used in other files
export default exportToPDF

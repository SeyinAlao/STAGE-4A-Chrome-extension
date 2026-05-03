if (!window.hasSummarizerContentScript) {
  window.hasSummarizerContentScript = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractText") {
      const container = document.querySelector('article') || document.querySelector('main') || document.body;
      let text = container.innerText.replace(/\s+/g, ' ').trim();
      sendResponse({ text: text });
    }
    return true; 
  });
}
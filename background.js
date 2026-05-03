chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarizeText") {
    generateSummary(request.text, request.url).then(sendResponse);
    return true; 
  }
});

async function generateSummary(text, url) {
  try {
    const cacheKey = `summary_${url}`;
    const cachedData = await chrome.storage.local.get([cacheKey]);
    
    if (cachedData[cacheKey]) {
      console.log("Found in cache! Skipping API call.");
      return { summary: cachedData[cacheKey] };
    }
    
    const safeText = text.substring(0, 15000);
    
    const response = await fetch('https://backend-chrome-extension-lenf.onrender.com/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: safeText
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return { error: data.error };
    }
    const finalSummary = data.summary;
    await chrome.storage.local.set({ [cacheKey]: finalSummary });
    
    return { summary: finalSummary };

  } catch (error) {
    return { error: "Failed to connect to the proxy server. Please check your internet connection." };
  }
}
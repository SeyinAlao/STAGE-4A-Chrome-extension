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
    const storage = await chrome.storage.local.get(['openaiApiKey']);
    if (!storage.openaiApiKey) {
      return { error: "No API key found. Please add it in the Extension Options." };
    }
    
    const safeText = text.substring(0, 15000);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', 
        messages: [
          {
            role: "system",
            content: "You are a highly efficient assistant. Summarize the provided webpage text into 3 to 5 concise bullet points. Do not use markdown symbols like * or **. Just return plain text sentences separated by newlines."
          },
          {
            role: "user",
            content: safeText
          }
        ],
        temperature: 0.5
      })
    });

    const data = await response.json();
    if (data.error) {
      return { error: data.error.message };
    }
    
    const finalSummary = data.choices[0].message.content;
    await chrome.storage.local.set({ [cacheKey]: finalSummary });
    return { summary: finalSummary };

  } catch (error) {
    return { error: "Failed to connect to OpenAI. Please check your internet connection." };
  }
}
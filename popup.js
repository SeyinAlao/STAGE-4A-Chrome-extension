function showState(stateId) {
  ['idle', 'loading', 'error', 'result'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(stateId).classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.title) {
    document.getElementById('pageTitle').textContent = tab.title;
  }
});

async function runSummarizer() {
  showState('loading');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    chrome.tabs.sendMessage(tab.id, { action: "extractText" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        showError("Could not read this page. Try refreshing the tab or picking a normal website.");
        return;
      }

      const wordCount = response.text.split(/\s+/).length;
      const readTimeMins = Math.max(1, Math.ceil(wordCount / 250));
      document.getElementById('readTime').textContent = `${readTimeMins} min read`;

      console.log("Extracted text, sending to AI...");
      
      // --- NEW: Added 'url: tab.url' to the message payload ---
      chrome.runtime.sendMessage({ action: "summarizeText", text: response.text, url: tab.url }, (aiResponse) => {
        
        if (chrome.runtime.lastError || !aiResponse) {
          showError("Lost connection to the background worker.");
          return;
        }
        
        if (aiResponse.error) {
          showError(`AI Error: ${aiResponse.error}`);
          return;
        }
        const bulletPoints = aiResponse.summary.split('\n').filter(line => line.trim() !== '');
        const listHTML = bulletPoints.map(point => `<li>${point.replace(/^[-\u2022]\s*/, '')}</li>`).join('');
        
        document.getElementById('summaryList').innerHTML = listHTML;
        showState('result');
      });
    });

  } catch (err) {
    showError("Cannot read this specific page. Chrome protects certain system pages.");
  }
}

function showError(message) {
  document.getElementById('errorText').textContent = message;
  showState('error');
}

document.getElementById('summarizeBtn').addEventListener('click', runSummarizer);
document.getElementById('retryBtn').addEventListener('click', runSummarizer);

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('summaryList').innerHTML = '';
  showState('idle');
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById('copyBtn').addEventListener('click', async () => {
  const summaryText = Array.from(document.querySelectorAll('#summaryList li'))
                           .map(li => '• ' + li.textContent)
                           .join('\n');
                           
  if (!summaryText) return;

  try {
    await navigator.clipboard.writeText(summaryText);
    
    const copyBtn = document.getElementById('copyBtn');
    const originalHTML = copyBtn.innerHTML;
    
    copyBtn.innerHTML = '✓ Copied';
    copyBtn.classList.add('copied'); 
    
    setTimeout(() => {
      copyBtn.innerHTML = originalHTML;
      copyBtn.classList.remove('copied');
    }, 2000);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
});
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['openaiApiKey'], (result) => {
    if (result.openaiApiKey) {
      document.getElementById('apiKey').value = result.openaiApiKey;
    }
  });
});
document.getElementById('saveBtn').addEventListener('click', () => {
  const key = document.getElementById('apiKey').value.trim();
  
  if (key) {
    chrome.storage.local.set({ openaiApiKey: key }, () => {
      const statusText = document.getElementById('status');
      statusText.style.display = 'block';
      setTimeout(() => {
        statusText.style.display = 'none';
      }, 2000);
    });
  } else {
    alert("Please enter a valid API key.");
  }
});
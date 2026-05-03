# Summarise — AI Page Intelligence

> Most pages take longer to read than they're worth. Summarise extracts what matters and hands it back to you in seconds — no clutter, no noise.

A lightweight, secure **Manifest V3 Chrome Extension** that intelligently extracts article content from the active web page and uses OpenAI to return a clean, bulleted summary. Built for Frontend Wizards — Stage 4A.

---

## 📸 Preview

<img width="1881" height="938" alt="Screenshot 2026-05-03 122019" src="https://github.com/user-attachments/assets/19ec1d5c-ee7b-4997-aa8b-94d322886fa0" />

---

## ✨ Features

| Feature | Detail |
|---|---|
| Smart Content Extraction | Targets `<article>`, `<main>`, or `<body>` — ignores navbars, sidebars, and footer clutter |
| AI-Powered Summaries | Uses `gpt-4o-mini` to return 3–5 concise, plain-text key insights |
| Smart Caching | Summaries are saved per URL — no duplicate API calls, no wasted credits |
| Graceful Error Handling | Covers missing API key, unreadable pages, network failures, and rate limits |
| Polished UI | Loading states, dynamic reading time, 1-click copy, and smooth staggered animations |
| Secure by Design | API key never touches source code — stored only in `chrome.storage.local` |

---

## 🏗️ Architecture

The extension follows a strict separation of concerns across four files:

**`manifest.json`**
Configures Manifest V3, registers the background service worker, and declares only the minimum required permissions — `activeTab`, `scripting`, and `storage`. No broad `<all_urls>` access.

**`popup.html` / `popup.js`**
Owns the user interface and all state transitions (idle → loading → result → error). Never touches the API directly — communicates exclusively with the background worker via `chrome.runtime.sendMessage`.

**`content.js`**
Injected programmatically into the active tab only when the user initiates a summary. Uses heuristic DOM filtering to extract the most relevant article text and strips excessive whitespace before returning it.

**`background.js`**
The secure core of the extension. Retrieves the API key from Chrome storage at runtime, manages the OpenAI network request with proper authorization headers, handles local URL-based caching, and returns structured results or descriptive errors back to the popup.

---

## 🔒 Security

Security was a primary constraint throughout, not an afterthought:

- **No hardcoded secrets.** The API key is never written into any source file. It is entered once by the user via the Options page and saved to `chrome.storage.local`.
- **Frontend never calls the API.** The popup and content scripts have no access to the API key and make no network requests. All outbound calls are handled exclusively by the background service worker.
- **Minimal permissions.** `activeTab` + programmatic injection means the extension only accesses a page when the user explicitly clicks Summarise — not on every page load.
- **XSS prevention.** All AI-generated content is injected into the DOM via `textContent`, never `innerHTML`.
- **Input sanitisation.** Messages passed between extension contexts are validated before acting on them.

---

## ⚖️ Trade-offs & Decisions

**Heuristic DOM extraction vs. Mozilla Readability**
Opted for lightweight `<article>` / `<main>` heuristics rather than bundling a full parsing library. This keeps the extension fast and dependency-free, at the cost of occasionally missing content on non-standard page layouts.

**`gpt-4o-mini` vs. `gpt-4o`**
Summarisation is a low-complexity task. The mini model delivers near-instant results at a fraction of the cost — prioritising speed and UX without sacrificing quality for this use case.

**`chrome.storage.local` vs. `chrome.storage.sync`**
Local storage provides a significantly larger quota than sync, which matters when caching full summary strings. The trade-off is that summaries don't persist across a user's devices — an acceptable limitation for this scope.

---

## 🛠️ Installation

This extension is not published on the Chrome Web Store. To run it locally:

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle, top-right).
4. Click **Load unpacked** and select the project folder.
5. Pin the extension to your toolbar.

**Adding your API key:**
1. Right-click the extension icon → **Options**.
2. Paste your OpenAI API key and click **Save Key**.
3. You're ready — navigate to any article and click the extension icon.

---

*Built by Alao Oluwaseyin · Frontend Wizards Stage 4A*

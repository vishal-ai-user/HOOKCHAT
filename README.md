<div align="center">

<img src="src/logo.svg" alt="HookChat Logo" width="80" />

# HOOKCHAT

**A futuristic, glassmorphic web chat dashboard to test, debug, and manage your n8n AI webhook assistants.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-hookchat--teal.vercel.app-FF6B00?style=for-the-badge&logo=vercel&logoColor=white)](https://hookchat-teal.vercel.app)
[![HTML](https://img.shields.io/badge/HTML-38.9%25-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://github.com/vishal-ai-user/HOOKCHAT)
[![CSS](https://img.shields.io/badge/CSS-35.4%25-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://github.com/vishal-ai-user/HOOKCHAT)
[![JavaScript](https://img.shields.io/badge/JavaScript-25.7%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/vishal-ai-user/HOOKCHAT)

</div>

---

## What is HookChat?

**HookChat** is a free, open-source, browser-based chat interface designed specifically for developers who build AI agents with **n8n webhooks**. Instead of manually testing your webhook endpoints via Postman or curl, HookChat gives you a beautiful, real-time chat UI to interact with your bots directly.

> 🔒 **100% Private** — All webhook URLs and chat histories are stored in your browser's `localStorage`. Nothing is sent to any external server.

---

## Features

- **Futuristic Glassmorphic UI** — Dark theme with orange neon accents, built using Share Tech fonts
- **Manage up to 5 Webhook Assistants** — Add, rename, delete, and switch between multiple bots
- **Real-time Chat** — Send messages and receive AI responses instantly
- **Secure URL Masking** — Toggle between masked (`••••`) and visible webhook URLs using the 👁 icon
- **Per-assistant Chat History** — Each assistant maintains its own conversation stored in localStorage
- **Clear Chat** — Wipe a conversation's history without deleting the assistant
- **Feedback System** — Built-in feedback form with star ratings
- **Fully Responsive** — Works seamlessly on desktop and mobile
- **Zero Backend / Zero Sign-up** — Just open the page and start chatting
- **SEO-Ready** — Includes Open Graph, Twitter Card, JSON-LD structured data, sitemap, and robots.txt

---

## Live Demo

👉 **[https://hookchat-teal.vercel.app](https://hookchat-teal.vercel.app)**

---

## Project Structure

```
HOOKCHAT/
├── index.html        # Main chat dashboard UI
├── Docs.html         # Documentation & setup guide
├── app.js            # Core application logic
├── style.css         # Glassmorphic styling
├── robots.txt        # SEO crawling rules
├── sitemap.xml       # XML sitemap for search engines
└── src/
    ├── logo.svg      # HookChat SVG logo
    └── icon.ico      # Browser favicon
```

---

## Quick Start

No installation needed. Just open the app in your browser:

```bash
# Option 1 — Use the live hosted version
https://hookchat-teal.vercel.app

# Option 2 — Clone and open locally
git clone https://github.com/vishal-ai-user/HOOKCHAT.git
cd HOOKCHAT
open index.html   # or double-click the file
```

---

## How to Connect Your n8n Webhook

### Step 1 — Add an Assistant

Click the **`+`** button in the sidebar. Enter:
- **Assistant Name** — e.g., `Support Bot`
- **Webhook URL** — Paste your n8n **Production Webhook URL**

### Step 2 — Configure Your n8n Workflow

Your n8n **Webhook Node** must be set up as follows:

| Setting | Value |
|---|---|
| HTTP Method | `POST` |
| Response Mode | `On Received / Respond to Webhook` |

**HookChat sends this JSON payload to your webhook:**
```json
{
  "chatInput": "Hello, how can you help me today?"
}
```

**In your n8n AI Agent or Code node, access the message with:**
```
{{ $json.body.chatInput }}
```

**Your n8n workflow must respond with:**
```json
{
  "output": "This is the AI assistant's reply!"
}
```
> HookChat also accepts `message` as the response key. If neither is found, it displays the raw JSON.

### Step 3 — Fix CORS (Self-hosted n8n Only)

Since HookChat runs in the browser, you must allow cross-origin requests from your n8n server. Add these environment variables to your n8n instance:

```env
N8N_ENFORCE_SETTINGS_FILE_FOR_USERS=true
N8N_CROSS_ORIGIN_OPENER_POLICY=same-origin
N8N_DISABLE_CORS=false
```

---

## Data Privacy & Storage

| Question | Answer |
|---|---|
| Where is data saved? | Browser `localStorage` only — never on a server |
| Does it survive browser restarts? | ✅ Yes |
| What clears the data? | Clicking "Delete" / "Clear Chat", clearing browser site data, or using Incognito mode |
| Are webhook URLs sent anywhere? | ❌ No — they stay in your browser |

---

## Troubleshooting

**"Failed to reach webhook" error?**

1. **CORS Blocked** — Open `F12 → Console`. If you see a red CORS error, apply the CORS configuration above.
2. **Wrong URL** — Make sure you're using the **Production URL**, not the Test URL. n8n test URLs expire after 120 seconds.
3. **n8n Offline** — Ensure your n8n instance is running and reachable from your network.

Full documentation is available at: **[hookchat-teal.vercel.app/Docs.html](https://hookchat-teal.vercel.app/Docs.html)**

---

## Tech Stack

- **Vanilla HTML, CSS, JavaScript** — No frameworks, no build tools
- **Share Tech & Share Tech Mono** — Google Fonts for the techy aesthetic
- **localStorage API** — For persistent, private data storage
- **Fetch API** — For sending messages to n8n webhooks
- **Vercel** — For hosting the live demo

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## Author

**Vishal** — [@vishal-ai-user](https://github.com/vishal-ai-user)

---

<div align="center">

Made with 🧡 for the n8n community

⭐ If you find this useful, please star the repository!

</div>

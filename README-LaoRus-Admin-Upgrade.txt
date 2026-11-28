LaoRus Admin Hybrid Upgrade
===========================

WHAT CHANGED
- Updated admin.html with a Super Command Center.
- Added AI Copilot UI for the same-origin POST /api/ai endpoint; server-only credentials are never sent to the browser.
- Added a LaoRus AI tab with the supplied compact brain icon to the main app bottom navigation; the Admin page links to the same learner tutor.
- Added POST /api/tutor for all app users and Admins; server-side retrieval uses only public vocabulary and lesson JSON files.
- Added Backup Center exporting selected Firestore collections and the three static JSON datasets.
- Added System Diagnostics for admin session, Firestore reads, and static JSON assets.
- Added browser-local activity log.
- Preserved Firestore rules and all three source JSON datasets; index.html now loads the separate tutor CSS/JS files.

DEPLOYMENT
1. Keep all six original files in the same hosting directory.
2. Replace the old admin.html with this upgraded admin.html.
3. Keep index.html with `laorus-ai.js` and `laorus-ai.css`, plus `laorus-ai-icon.webp`, `firestore.rules`, and all three source JSON files together.
4. Deploy the site and open /admin.html.
5. Sign in with the authorized admin Google account.
6. Run System Diagnostics after deployment.

AI COPILOT
The upgraded server hosts the AI endpoint at POST /api/ai; no separate endpoint URL is required in the browser.
The Admin endpoint verifies the Firebase ID token, verified email and admin allowlist before making an AI request. If the server secret `LAORUS_GEMINI_API_KEY` is configured, both AI endpoints use Google Gemini through its Interactions API; otherwise they fall back to the managed Manus AI service.
The Admin server accepts assistant, proofread, grammar, translate, lesson and analyze tasks; the input limit is 12,000 characters and the per-account rate limit is 8 requests per minute.
The Gemini API key is stored as a protected server-side secret and is never sent to the browser or included in this ZIP. Gemini requests use the Google project’s quota and may incur Google charges under that account. If no Gemini key is configured, requests use Manus credentials and consume project AI credits. Do not commit or expose API keys.
The Admin Copilot sees only text deliberately submitted by the admin. It does not read, write or delete Firestore, and it cannot carry out admin actions. Review every suggestion before using it.
Do not submit passwords, tokens, API keys, private user data or other secrets.

PUBLIC LEARNER TUTOR
The LaoRus AI bottom tab and Admin link call POST /api/tutor only after the user submits a question.
This public endpoint searches only public/vocab-base.json and public/content-base.json for related vocabulary, reading and dialogue entries. It does not query Firestore or read profiles, visitor records, or private Admin data.
The tutor accepts a question up to 3,000 characters, limits use to 8 requests/minute and 30 requests/24 hours per observed IP in each server process, and returns explanations/recommendations only. It cannot edit, write, delete or publish site data.
When Gemini is configured, the question is sent to Google through the Interactions API with `store: false`; Google still processes the content under the applicable Google AI terms. Do not enter passwords, account details or other private information. Requests use the Google project's quota and may be billable. Without a Gemini key, the service falls back to Manus and uses project AI credits. AI answers can be wrong; check them before relying on them.

LIMITATIONS
- Backup export is implemented. Automated restore is intentionally not included to avoid accidental overwrites.
- Activity log is local to the current browser; it is not a tamper-resistant server audit log.
- The 8-request-per-minute AI limit is in memory per server process; it resets on restart and is not shared across multiple instances.
- The public tutor's rate limit is also in memory per server process; it resets on restart and is not shared across multiple instances.
- Diagnostics test read access and asset loading; they do not prove every Firestore rule or write path is correct.
- AI requires the managed server runtime and either a valid `LAORUS_GEMINI_API_KEY` secret or the managed Manus AI service credentials. Choose `LAORUS_GEMINI_MODEL` only as a server-side environment setting; it defaults to `gemini-3.5-flash-lite`.
- The update does not claim unlimited capability or bypass Firebase security controls.

SAFETY
- Store backup files securely; they may contain user profile and visitor information.
- Do not publish admin credentials, Firebase service-account keys, or AI provider API keys.

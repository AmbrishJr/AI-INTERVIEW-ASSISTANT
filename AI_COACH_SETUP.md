# AI coach setup

Set `GROQ_API_KEY` in the local `.env` file and run `npm run dev`. The frontend calls same-origin `/api/chat`; `npm run dev:client` proxies `/api` to port 3000. Keep API keys on the server.

`GROQ_MODEL` overrides the default `openai/gpt-oss-20b` model in `server/ai-config.ts`. Choose a model compatible with the configured completion options.

The coach offers interview-preparation guidance. It does not automatically receive session notes or recordings. Chat sends the typed message; analytics sends saved measurements only after the user requests an explanation or insights. These requests go to the configured AI provider.

Without a key, AI endpoints return 503 and the interface shows a configuration message with retry. Generic practice tips are labeled separately. Invalid structured analytics responses return 502 rather than invented statistics. News-summary fallback responses identify themselves as fallback content.

Use `npm run test` and `npm run test:e2e` for isolated checks without paid provider calls. To verify a live integration, open the app, select **Ask your coach**, and send a question after configuring the key. Deployment-specific rate limits and persistent session infrastructure remain outside the local redesign.

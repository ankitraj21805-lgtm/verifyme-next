# Personal AI Assistant Proxy

Vercel-ready backend proxy for the Android Personal AI Assistant MVP.

## Endpoints

- `GET /api/health`
- `POST /v1/assistant/command`

## Environment Variables

- `ANTHROPIC_API_KEY` required
- `ASSISTANT_SHARED_SECRET` optional
- `ANTHROPIC_MODEL` optional

This proxy keeps the Claude API key server-side. The Android app should call this proxy URL, not the LLM provider directly.

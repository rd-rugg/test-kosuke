# Implementation Notes

## Knect Integration
- Added protected route at `app/(logged-in)/knect` with a client entry component.
- Ported components: `NetworkingDashboard`, `ContactList`, `ContactForm`, `QRScanner` under `app/(logged-in)/knect/components/`.
- Reused existing shadcn UI components and toast provider.
- Utilities:
  - `lib/knect/linkedin.ts` for LinkedIn deep linking and URL handling.
  - `hooks/use-speech-to-text.ts` demo transcription flow.
- Dependency: installed `qr-scanner` for QR code scanning.
- Assets: expects `public/logos/lets-knect-logo.png`.

## Behavior
- Page requires Clerk auth via `requireAuth()` and global middleware.
- Contacts are persisted in `localStorage`.
- QR Scanner reads LinkedIn QR; fallback demo/manual entry provided.
- Speech-to-text is simulated; replace with backend API when available.

## Next Steps
- Persist contacts to Postgres (add tables in `lib/db/schema.ts` + migrations).
- Optional feature gating via billing (`lib/billing`) for premium features.
- Add real transcription endpoint and wire in `use-speech-to-text`.


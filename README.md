# Cinenova

Cinenova is a small movie & TV discovery web app built with Next.js (App Router), TypeScript, and Supabase. It integrates The Movie Database (TMDB) for media data and includes Supabase auth with reCAPTCHA-protected login.

![Cinenova preview](assets/preview.png)

## Getting Started

Prerequisites: Node.js 18+ and a package manager (npm, yarn, or pnpm).

Install and run the development server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment

Create a `.env.local` file in the project root with the values required for Supabase and reCAPTCHA. Typical keys:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_RECAPTCHA_SITE_KEY (reCAPTCHA v3 site key)
- RECAPTCHA_SECRET

## Features

- Next.js App Router + TypeScript
- Supabase Auth and session handling
- reCAPTCHA v3 protected login flow with attempt lockout
- Responsive UI with mobile navigation

## Development

- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Run production build: `npm start`

## Preview

The screenshot above is located at `assets/preview.png` in the repository.

## Contributing

Contributions are welcome — open issues or PRs on the repository.

## License

MIT

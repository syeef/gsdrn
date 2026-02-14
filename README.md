# Get started with React Router V7 ((Framework Mode) + Vite + Cloudflare D1 + Drizzle ORM + Better Auth

A modern, production-ready template for building full-stack applications using React Router.

## Features

- React Router V7
- Vite
- Cloudflare D1
- Drizzle ORM
- Better Auth

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

```bash
npm run db:generate
```

```bash
npm run db:migrate
```

### Development

Run an initial database migration:

```bash
npm run db:migrate
```

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

Deployment is done using the Wrangler CLI.

First, you need to create a d1 database in Cloudflare.

```sh
npx wrangler d1 create <name-of-your-database>
```

Be sure to update the `wrangler.toml` file with the correct database name and id.

You will also need to [update the `drizzle.config.ts` file](https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit), and then run the production migration:

```sh
npm run db:migrate-production
```

To build and deploy directly to production:

```sh
npm run deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

# Rumi Self-Improvement Website

## Image Setup Instructions

This project requires two images to be placed in the `/public` directory:

1. `rumi_logo.png` - The Rumi logo used in the header and footer
2. `feeling_agent.png` - The main image shown on the homepage

### How to Add Images

1. Create a `/public` directory in the root of your project if it doesn't exist
2. Add your images to this directory with the exact filenames mentioned above
3. Make sure the images are in PNG format
4. For best results:
   - `rumi_logo.png` should be approximately 150x50 pixels
   - `feeling_agent.png` should be approximately 500x900 pixels

### Deployment

When deploying to Vercel or another hosting platform, make sure to include the `/public` directory with your images.

## Development

To run the project locally:

\`\`\`bash
npm run dev
\`\`\`

## Testing

```bash
pnpm test          # single run
pnpm test:watch    # watch mode
```

See [TESTING.md](./TESTING.md) for conventions and framework details.

## Environment Variables

Make sure you have the following environment variables set up for Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
\`\`\`

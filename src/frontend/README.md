# Frontend

Based on a great template [here](https://github.com/connorp987/vite-firebase-tanstack-router-template/tree/main).

## Development Setup

### Prerequisites

- [Node.js 22+](https://nodejs.org/en/download)
- Firebase Access

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Setup Firebase

- Ensure you've logged in with Firebase: `firebase login`
- Start local Firebase emulators

    ```bash
    npm run emulators
    ```

    > If you want to preserve data between sessions, instead use:
    >
    > ```bash
    > npm run emulators:export
    > ```

3. Start the development server

```bash
npm run dev
```

4. To apply standardized formatting, run `npm run format`

## Helpful Links

- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [Firebase Documentation](https://firebase.google.com/docs/auth/web/start)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs/installation)

# Planning Center Dashboard

An open-source dashboard built on top of the [Planning Center](https://www.planningcenter.com/) API. It gives your team a unified view into Planning Center data using a fast, modern frontend powered by Vue 3, TypeScript, and Vite.

## Tech Stack

- **Vue 3** with Composition API
- **TypeScript**
- **Vite**
- **Pinia** for state management
- **Vue Router** for client-side routing
- **oidc-client-ts** for OAuth 2.0 / OIDC

## Authentication & Authorization

Authentication is handled entirely in the browser via **OAuth 2.0 Authorization Code flow** against the Planning Center API.

### How it works

1. **Login** — The user visits `/login` and clicks "Sign in with Planning Center." The app calls `userManager.signinRedirect()` ([src/services/oauth.ts](src/services/oauth.ts)), which redirects the browser to `https://api.planningcenteronline.com` with the configured `client_id`, `redirect_uri`, `response_type=code`, and `scope`.

2. **Callback** — After the user authorizes the app, Planning Center redirects back to `/callback`. The `Callback` view calls `userManager.signinRedirectCallback()`, which exchanges the authorization code for an access token. The token is stored in `localStorage` via `WebStorageStateStore`.

3. **Session hydration** — On every page load the router guard in [src/router/index.ts](src/router/index.ts) calls `authStore.checkAuth()`. This reads the stored OIDC session, reattaches the access token to the API client, and fetches the current user profile from `GET /people/v2/me`.

4. **API calls** — [src/services/api.ts](src/services/api.ts) is a thin wrapper around `fetch` that injects the `Authorization: Bearer <token>` header on every request.

5. **Route protection** — Routes marked `meta: { requiresAuth: true }` redirect unauthenticated users to `/login`. Authenticated users who navigate to `/login` are redirected back to `/`.

6. **Logout** — Calls `userManager.signoutRedirect()`, which clears the local session and redirects to Planning Center's sign-out endpoint.

### Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```sh
cp .env.example .env
```

| Variable                         | Description                                                           |
| -------------------------------- | --------------------------------------------------------------------- |
| `VITE_PLANNING_CENTER_CLIENT_ID` | OAuth application Client ID from the Planning Center developer portal |

Register your OAuth app at [https://api.planningcenteronline.com/oauth/applications](https://api.planningcenteronline.com/oauth/applications) and set the redirect URI to `http://localhost:8000/callback` for local development (update to your production domain when deploying).

## Project Setup

```sh
npm install
```

### Development

```sh
npm run dev
```

### Production Build

```sh
npm run build
```

### Type Check

```sh
npm run type-check
```

### Lint

```sh
npm run lint
```

## Contributing

Contributions are welcome. Open an issue or pull request on GitHub.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur if installed).

## License

MIT

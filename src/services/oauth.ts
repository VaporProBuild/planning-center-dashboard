import { UserManager, WebStorageStateStore, User as OidcUser } from 'oidc-client-ts'

const clientId = import.meta.env.VITE_PLANNING_CENTER_CLIENT_ID
const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL}callback`

// Initialize OIDC UserManager
const settings = {
  authority: 'https://api.planningcenteronline.com',
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'openid people',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
}

export const userManager = new UserManager(settings)

export async function initiateLogin(): Promise<void> {
  try {
    await userManager.signinRedirect()
  } catch (error) {
    console.error('Login redirect failed:', error)
    throw error
  }
}

export async function handleCallback(): Promise<OidcUser | null> {
  try {
    const user = await userManager.signinRedirectCallback()
    return user
  } catch (error) {
    console.error('Callback handling failed:', error)
    throw error
  }
}

export async function logout(): Promise<void> {
  try {
    await userManager.signoutRedirect()
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

export async function getUser(): Promise<OidcUser | null> {
  try {
    return await userManager.getUser()
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}

export async function getAccessToken(): Promise<string | null> {
  const user = await getUser()
  return user?.access_token || null
}

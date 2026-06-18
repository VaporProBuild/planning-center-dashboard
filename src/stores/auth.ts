import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { User as OidcUser } from 'oidc-client-ts'
import { api } from '@/services/api'
import { getUser, getAccessToken } from '@/services/oauth'

export interface User {
  id: string
  name: string
  email?: string
}

interface PlanningCenterUser {
  data?: {
    id: string
    attributes?: {
      name?: string
      email?: string
    }
  }
  [key: string]: unknown
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  async function initializeWithUser(oidcUser: OidcUser | null) {
    if (!oidcUser) {
      error.value = 'No user data from OAuth'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      api.setAccessToken(oidcUser.access_token)

      // Fetch current user from Planning Center API
      const response = await api.getCurrentUser()
      if (response.data) {
        const userData = response.data as PlanningCenterUser
        user.value = {
          id: userData.data?.id || 'unknown',
          name: userData.data?.attributes?.name || 'User',
          email: userData.data?.attributes?.email,
        }
      } else {
        // If we can't fetch user profile (CORS, etc), still mark as authenticated
        // since we have a valid OAuth token
        user.value = {
          id: 'authenticated-user',
          name: 'User',
          email: undefined,
        }
        console.warn('Could not fetch user profile:', response.error)
      }
    } catch (err) {
      // On CORS or other errors, still authenticate if we have the token
      user.value = {
        id: 'authenticated-user',
        name: 'User',
        email: undefined,
      }
      console.warn('Authentication partially successful (no profile data):', err)
    } finally {
      isLoading.value = false
    }
  }

  async function checkAuth() {
    try {
      const oidcUser = await getUser()
      if (oidcUser) {
        const token = await getAccessToken()
        if (token) {
          api.setAccessToken(token)
          const response = await api.getCurrentUser()
          if (response.data) {
            const userData = response.data as PlanningCenterUser
            user.value = {
              id: userData.data?.id || 'unknown',
              name: userData.data?.attributes?.name || 'User',
              email: userData.data?.attributes?.email,
            }
          } else {
            // If we can't fetch profile but have a valid token, stay authenticated
            user.value = {
              id: 'authenticated-user',
              name: 'User',
              email: undefined,
            }
          }
        }
      }
    } catch (err) {
      // Even on CORS errors, if we have a token we should stay authenticated
      const token = await getAccessToken()
      if (token) {
        user.value = {
          id: 'authenticated-user',
          name: 'User',
          email: undefined,
        }
      }
      console.error('Auth check encountered error, but keeping session if token exists:', err)
    }
  }

  function logout() {
    user.value = null
    error.value = null
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    initializeWithUser,
    checkAuth,
    logout,
  }
})

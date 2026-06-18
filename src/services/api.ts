const BASE_URL = 'https://api.planningcenteronline.com'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

class PlanningCenterAPI {
  private accessToken: string | null = null

  setAccessToken(token: string) {
    this.accessToken = token
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    if (!this.accessToken) {
      return { error: 'No access token available' }
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return { error: `API Error: ${response.status} ${response.statusText}` }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getCurrentUser(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.get(`${BASE_URL}/people/v2/me`)
  }

  async getPeople(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.get(`${BASE_URL}/people/v2/people`)
  }

  async getCurrentPeople(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.get(`${BASE_URL}/current/v2/people`)
  }
}

export const api = new PlanningCenterAPI()

const BASE_URL = 'https://api.planningcenteronline.com'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PaginatedParams {
  perPage?: number
  offset?: number
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

  async getPeopleCount(): Promise<ApiResponse<number>> {
    const resp = await this.get<Record<string, unknown>>(`${BASE_URL}/people/v2/people?per_page=1`)
    if (resp.error) return { error: resp.error }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (resp.data as any)?.meta
    return { data: meta?.total_count ?? 0 }
  }

  async getGroupTypes(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.get(`${BASE_URL}/groups/v2/group_types`)
  }

  async getGroups(params?: {
    groupTypeId?: string
    perPage?: number
    offset?: number
  }): Promise<ApiResponse<Record<string, unknown>>> {
    const qs = new URLSearchParams()
    if (params?.perPage) qs.set('per_page', String(params.perPage))
    if (params?.offset) qs.set('offset', String(params.offset))
    const query = qs.toString() ? `?${qs.toString()}` : ''
    // Use nested route so Planning Center filters by type server-side
    const base = params?.groupTypeId
      ? `${BASE_URL}/groups/v2/group_types/${params.groupTypeId}/groups`
      : `${BASE_URL}/groups/v2/groups`
    return this.get(`${base}${query}`)
  }
}

export const api = new PlanningCenterAPI()

const BASE_URL = 'https://api.planningcenteronline.com'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PaginatedParams {
  perPage?: number
  offset?: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Planning Center enforces 100 requests per 20 seconds and returns 429 with a
// Retry-After header when exceeded; back off and retry rather than failing.
const MAX_RATE_LIMIT_RETRIES = 4

class PlanningCenterAPI {
  private accessToken: string | null = null

  setAccessToken(token: string) {
    this.accessToken = token
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    if (!this.accessToken) {
      return { error: 'No access token available' }
    }

    for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
          const retryAfterSeconds = Number(response.headers.get('Retry-After')) || 2
          await sleep(retryAfterSeconds * 1000)
          continue
        }

        if (!response.ok) {
          return { error: `API Error: ${response.status} ${response.statusText}` }
        }

        const data = await response.json()
        return { data }
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    return { error: 'Rate limit exceeded, please try again shortly' }
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

  async getCheckInsCount(params: {
    gte: string
    lte: string
    kind?: string
  }): Promise<ApiResponse<number>> {
    const qs = new URLSearchParams()
    qs.set('where[created_at][gte]', params.gte)
    qs.set('where[created_at][lte]', params.lte)
    if (params.kind) qs.set('where[kind]', params.kind)
    qs.set('per_page', '1')
    const resp = await this.get<Record<string, unknown>>(
      `${BASE_URL}/check-ins/v2/check_ins?${qs.toString()}`,
    )
    if (resp.error) return { error: resp.error }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (resp.data as any)?.meta
    return { data: meta?.total_count ?? 0 }
  }

  async getAttendanceTypes(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.get(`${BASE_URL}/check-ins/v2/attendance_types`)
  }

  async getHeadcounts(params: {
    gte: string
    lte: string
    perPage?: number
    offset?: number
  }): Promise<ApiResponse<Record<string, unknown>>> {
    const qs = new URLSearchParams()
    qs.set('where[created_at][gte]', params.gte)
    qs.set('where[created_at][lte]', params.lte)
    qs.set('per_page', String(params.perPage ?? 100))
    if (params.offset) qs.set('offset', String(params.offset))
    return this.get(`${BASE_URL}/check-ins/v2/headcounts?${qs.toString()}`)
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

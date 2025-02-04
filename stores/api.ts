import { defineStore } from 'pinia'

interface ApiUsage {
  date: string
  requests: number
  limit: number
}

interface TokenHistory {
  id: string
  createdAt: string
  revokedAt: string | null
  lastUsed: string | null
}

interface ApiState {
  token: string | null
  loading: boolean
  error: string | null
  usage: ApiUsage[]
  history: TokenHistory[]
  currentPlan: {
    name: string
    requestsPerMonth: number
    remainingRequests: number
  } | null
}

export const useApiStore = defineStore('api', {
  state: (): ApiState => ({
    token: null,
    loading: false,
    error: null,
    usage: [],
    history: [],
    currentPlan: null
  }),

  getters: {
    usagePercentage: (state) => {
      if (!state.currentPlan) return 0
      return Math.round((state.currentPlan.requestsPerMonth - state.currentPlan.remainingRequests) / state.currentPlan.requestsPerMonth * 100)
    }
  },

  actions: {
    async generateToken() {
      this.loading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.apiBaseUrl}/generate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useAuthStore().user?.accessToken}`
          }
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la génération du token')
        }

        const data = await response.json()
        this.token = data.token
        this.history.unshift({
          id: data.id,
          createdAt: new Date().toISOString(),
          revokedAt: null,
          lastUsed: null
        })
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async revokeToken() {
      if (!this.token) return

      this.loading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.apiBaseUrl}/revoke-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useAuthStore().user?.accessToken}`
          }
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la révocation du token')
        }

        const currentToken = this.history.find(t => !t.revokedAt)
        if (currentToken) {
          currentToken.revokedAt = new Date().toISOString()
        }
        this.token = null
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUsage() {
      this.loading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const response = await fetch(`${config.public.apiBaseUrl}/api-usage`, {
          headers: {
            'Authorization': `Bearer ${useAuthStore().user?.accessToken}`
          }
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des statistiques')
        }

        const data = await response.json()
        this.usage = data.usage
        this.currentPlan = data.currentPlan
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  },

  persist: true
})
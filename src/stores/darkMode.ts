import { defineStore } from 'pinia'
import { ref } from 'vue'

export const darkModeKey = 'darkMode'

export const useDarkModeStore = defineStore('darkMode', () => {
  const isEnabled = ref(false)
  const isInProgress = ref(false)

  function init() {
    if (
      typeof localStorage !== 'undefined' &&
      typeof window !== 'undefined' &&
      ((!localStorage[darkModeKey] && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
        localStorage[darkModeKey] === '1')
    ) {
      set(true)
    }
  }

  function set(payload: boolean | null = null, persist = false) {
    const setIsEnabled = payload !== null ? payload : !isEnabled.value

    if (isEnabled.value !== setIsEnabled) {
      isEnabled.value = setIsEnabled
      isInProgress.value = true

      if (typeof document !== 'undefined') {
        document.documentElement.classList[setIsEnabled ? 'add' : 'remove']('dark')
      }

      setTimeout(() => {
        isInProgress.value = false
      }, 200)
    }

    if (persist && typeof localStorage !== 'undefined') {
      localStorage.setItem(darkModeKey, setIsEnabled ? '1' : '0')
    }
  }

  return {
    isEnabled,
    isInProgress,
    init,
    set,
  }
})

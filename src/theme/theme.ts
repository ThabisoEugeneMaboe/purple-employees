export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'purple.theme'

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      return stored
    }
  } catch {
    /* localStorage may be unavailable */
  }

  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }

  return 'light'
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme

  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* localStorage may be unavailable */
  }
}

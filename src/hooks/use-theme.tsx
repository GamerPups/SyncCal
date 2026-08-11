import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ThemeMode } from '@/types'
import {
  applyColorThemeTokens,
  DEFAULT_COLOR_THEME,
  type ColorThemeId,
} from '@/config/color-themes'

const THEME_STORAGE_KEY = 'synccal-theme'
const COLOR_THEME_STORAGE_KEY = 'synccal-color-theme'

type ThemeContextValue = {
  theme: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: ThemeMode) => void
  colorTheme: ColorThemeId
  setColorTheme: (colorTheme: ColorThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function getStoredColorTheme(): ColorThemeId {
  if (typeof window === 'undefined') return DEFAULT_COLOR_THEME
  const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY)
  if (stored) return stored as ColorThemeId
  return DEFAULT_COLOR_THEME
}

function resolveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme()
  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme)
  const [colorTheme, setColorThemeState] = useState<ColorThemeId>(getStoredColorTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    resolveTheme(getStoredTheme()),
  )

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  const setColorTheme = (newColorTheme: ColorThemeId) => {
    setColorThemeState(newColorTheme)
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, newColorTheme)
  }

  useEffect(() => {
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)

    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    applyColorThemeTokens(colorTheme, resolved)
  }, [theme, colorTheme])

  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const resolved = resolveTheme('system')
      setResolvedTheme(resolved)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(resolved)
      applyColorThemeTokens(colorTheme, resolved)
    }

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme, colorTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

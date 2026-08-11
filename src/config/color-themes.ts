export type ColorThemeId =
  | 'forest'
  | 'ocean'
  | 'sunset'
  | 'lavender'
  | 'rose'
  | 'midnight'
  | 'coral'
  | 'sage'
  | 'amber'
  | 'slate'
  | 'berry'
  | 'teal'
  | 'indigo'
  | 'mint'
  | 'wine'
  | 'sky'
  | 'peach'
  | 'emerald'
  | 'plum'
  | 'copper'

type ColorThemeTokens = {
  primary: string
  'primary-foreground': string
  accent: string
  'accent-foreground': string
  ring: string
  today: string
  'today-foreground': string
  'sidebar-accent': string
}

export type ColorTheme = {
  id: ColorThemeId
  label: string
  swatch: string
  light: ColorThemeTokens
  dark: ColorThemeTokens
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'forest',
    label: 'Forest',
    swatch: '#2D5A3D',
    light: { primary: '148 33% 27%', 'primary-foreground': '40 33% 98%', accent: '148 25% 92%', 'accent-foreground': '148 33% 22%', ring: '148 33% 27%', today: '148 33% 27%', 'today-foreground': '40 33% 98%', 'sidebar-accent': '148 25% 92%' },
    dark: { primary: '148 30% 45%', 'primary-foreground': '150 8% 10%', accent: '148 20% 18%', 'accent-foreground': '148 30% 70%', ring: '148 30% 45%', today: '148 30% 45%', 'today-foreground': '150 8% 10%', 'sidebar-accent': '148 20% 15%' },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    swatch: '#2563A8',
    light: { primary: '210 65% 40%', 'primary-foreground': '0 0% 98%', accent: '210 50% 93%', 'accent-foreground': '210 65% 30%', ring: '210 65% 40%', today: '210 65% 40%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '210 50% 93%' },
    dark: { primary: '210 55% 55%', 'primary-foreground': '220 20% 10%', accent: '210 30% 18%', 'accent-foreground': '210 50% 75%', ring: '210 55% 55%', today: '210 55% 55%', 'today-foreground': '220 20% 10%', 'sidebar-accent': '210 30% 16%' },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    swatch: '#C45C3A',
    light: { primary: '15 55% 48%', 'primary-foreground': '0 0% 98%', accent: '15 45% 93%', 'accent-foreground': '15 55% 35%', ring: '15 55% 48%', today: '15 55% 48%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '15 45% 93%' },
    dark: { primary: '15 50% 58%', 'primary-foreground': '15 15% 10%', accent: '15 25% 18%', 'accent-foreground': '15 45% 75%', ring: '15 50% 58%', today: '15 50% 58%', 'today-foreground': '15 15% 10%', 'sidebar-accent': '15 25% 16%' },
  },
  {
    id: 'lavender',
    label: 'Lavender',
    swatch: '#7C5CBF',
    light: { primary: '262 45% 52%', 'primary-foreground': '0 0% 98%', accent: '262 40% 94%', 'accent-foreground': '262 45% 38%', ring: '262 45% 52%', today: '262 45% 52%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '262 40% 94%' },
    dark: { primary: '262 40% 62%', 'primary-foreground': '260 15% 10%', accent: '262 25% 18%', 'accent-foreground': '262 40% 78%', ring: '262 40% 62%', today: '262 40% 62%', 'today-foreground': '260 15% 10%', 'sidebar-accent': '262 25% 16%' },
  },
  {
    id: 'rose',
    label: 'Rose',
    swatch: '#C44B6E',
    light: { primary: '345 55% 48%', 'primary-foreground': '0 0% 98%', accent: '345 45% 94%', 'accent-foreground': '345 55% 35%', ring: '345 55% 48%', today: '345 55% 48%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '345 45% 94%' },
    dark: { primary: '345 50% 58%', 'primary-foreground': '345 15% 10%', accent: '345 25% 18%', 'accent-foreground': '345 45% 78%', ring: '345 50% 58%', today: '345 50% 58%', 'today-foreground': '345 15% 10%', 'sidebar-accent': '345 25% 16%' },
  },
  {
    id: 'midnight',
    label: 'Midnight',
    swatch: '#3D4F7A',
    light: { primary: '225 35% 38%', 'primary-foreground': '0 0% 98%', accent: '225 30% 93%', 'accent-foreground': '225 35% 28%', ring: '225 35% 38%', today: '225 35% 38%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '225 30% 93%' },
    dark: { primary: '225 30% 55%', 'primary-foreground': '225 20% 10%', accent: '225 20% 18%', 'accent-foreground': '225 30% 75%', ring: '225 30% 55%', today: '225 30% 55%', 'today-foreground': '225 20% 10%', 'sidebar-accent': '225 20% 16%' },
  },
  {
    id: 'coral',
    label: 'Coral',
    swatch: '#E07055',
    light: { primary: '8 70% 58%', 'primary-foreground': '0 0% 98%', accent: '8 55% 94%', 'accent-foreground': '8 70% 42%', ring: '8 70% 58%', today: '8 70% 58%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '8 55% 94%' },
    dark: { primary: '8 65% 62%', 'primary-foreground': '8 15% 10%', accent: '8 30% 18%', 'accent-foreground': '8 55% 78%', ring: '8 65% 62%', today: '8 65% 62%', 'today-foreground': '8 15% 10%', 'sidebar-accent': '8 30% 16%' },
  },
  {
    id: 'sage',
    label: 'Sage',
    swatch: '#6B8F71',
    light: { primary: '130 20% 48%', 'primary-foreground': '0 0% 98%', accent: '130 18% 93%', 'accent-foreground': '130 20% 35%', ring: '130 20% 48%', today: '130 20% 48%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '130 18% 93%' },
    dark: { primary: '130 18% 55%', 'primary-foreground': '130 10% 10%', accent: '130 12% 18%', 'accent-foreground': '130 18% 72%', ring: '130 18% 55%', today: '130 18% 55%', 'today-foreground': '130 10% 10%', 'sidebar-accent': '130 12% 16%' },
  },
  {
    id: 'amber',
    label: 'Amber',
    swatch: '#C4882A',
    light: { primary: '38 65% 45%', 'primary-foreground': '0 0% 98%', accent: '38 50% 93%', 'accent-foreground': '38 65% 32%', ring: '38 65% 45%', today: '38 65% 45%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '38 50% 93%' },
    dark: { primary: '38 60% 55%', 'primary-foreground': '38 15% 10%', accent: '38 25% 18%', 'accent-foreground': '38 50% 75%', ring: '38 60% 55%', today: '38 60% 55%', 'today-foreground': '38 15% 10%', 'sidebar-accent': '38 25% 16%' },
  },
  {
    id: 'slate',
    label: 'Slate',
    swatch: '#5A6578',
    light: { primary: '215 15% 42%', 'primary-foreground': '0 0% 98%', accent: '215 12% 93%', 'accent-foreground': '215 15% 30%', ring: '215 15% 42%', today: '215 15% 42%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '215 12% 93%' },
    dark: { primary: '215 12% 58%', 'primary-foreground': '215 10% 10%', accent: '215 8% 18%', 'accent-foreground': '215 12% 75%', ring: '215 12% 58%', today: '215 12% 58%', 'today-foreground': '215 10% 10%', 'sidebar-accent': '215 8% 16%' },
  },
  {
    id: 'berry',
    label: 'Berry',
    swatch: '#9B3D6E',
    light: { primary: '330 45% 42%', 'primary-foreground': '0 0% 98%', accent: '330 35% 93%', 'accent-foreground': '330 45% 30%', ring: '330 45% 42%', today: '330 45% 42%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '330 35% 93%' },
    dark: { primary: '330 40% 55%', 'primary-foreground': '330 15% 10%', accent: '330 22% 18%', 'accent-foreground': '330 35% 75%', ring: '330 40% 55%', today: '330 40% 55%', 'today-foreground': '330 15% 10%', 'sidebar-accent': '330 22% 16%' },
  },
  {
    id: 'teal',
    label: 'Teal',
    swatch: '#2A8F8F',
    light: { primary: '180 55% 38%', 'primary-foreground': '0 0% 98%', accent: '180 40% 93%', 'accent-foreground': '180 55% 28%', ring: '180 55% 38%', today: '180 55% 38%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '180 40% 93%' },
    dark: { primary: '180 45% 50%', 'primary-foreground': '180 15% 10%', accent: '180 25% 18%', 'accent-foreground': '180 40% 72%', ring: '180 45% 50%', today: '180 45% 50%', 'today-foreground': '180 15% 10%', 'sidebar-accent': '180 25% 16%' },
  },
  {
    id: 'indigo',
    label: 'Indigo',
    swatch: '#4F46B5',
    light: { primary: '243 55% 48%', 'primary-foreground': '0 0% 98%', accent: '243 45% 94%', 'accent-foreground': '243 55% 35%', ring: '243 55% 48%', today: '243 55% 48%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '243 45% 94%' },
    dark: { primary: '243 50% 62%', 'primary-foreground': '243 20% 10%', accent: '243 25% 18%', 'accent-foreground': '243 45% 78%', ring: '243 50% 62%', today: '243 50% 62%', 'today-foreground': '243 20% 10%', 'sidebar-accent': '243 25% 16%' },
  },
  {
    id: 'mint',
    label: 'Mint',
    swatch: '#3BA88C',
    light: { primary: '160 48% 42%', 'primary-foreground': '0 0% 98%', accent: '160 40% 93%', 'accent-foreground': '160 48% 30%', ring: '160 48% 42%', today: '160 48% 42%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '160 40% 93%' },
    dark: { primary: '160 42% 52%', 'primary-foreground': '160 15% 10%', accent: '160 22% 18%', 'accent-foreground': '160 40% 72%', ring: '160 42% 52%', today: '160 42% 52%', 'today-foreground': '160 15% 10%', 'sidebar-accent': '160 22% 16%' },
  },
  {
    id: 'wine',
    label: 'Wine',
    swatch: '#7A3048',
    light: { primary: '350 45% 35%', 'primary-foreground': '0 0% 98%', accent: '350 35% 93%', 'accent-foreground': '350 45% 25%', ring: '350 45% 35%', today: '350 45% 35%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '350 35% 93%' },
    dark: { primary: '350 40% 50%', 'primary-foreground': '350 15% 10%', accent: '350 22% 18%', 'accent-foreground': '350 35% 72%', ring: '350 40% 50%', today: '350 40% 50%', 'today-foreground': '350 15% 10%', 'sidebar-accent': '350 22% 16%' },
  },
  {
    id: 'sky',
    label: 'Sky',
    swatch: '#3B9FD9',
    light: { primary: '200 70% 48%', 'primary-foreground': '0 0% 98%', accent: '200 55% 94%', 'accent-foreground': '200 70% 35%', ring: '200 70% 48%', today: '200 70% 48%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '200 55% 94%' },
    dark: { primary: '200 60% 58%', 'primary-foreground': '200 20% 10%', accent: '200 28% 18%', 'accent-foreground': '200 50% 78%', ring: '200 60% 58%', today: '200 60% 58%', 'today-foreground': '200 20% 10%', 'sidebar-accent': '200 28% 16%' },
  },
  {
    id: 'peach',
    label: 'Peach',
    swatch: '#E8956A',
    light: { primary: '22 75% 62%', 'primary-foreground': '0 0% 98%', accent: '22 60% 94%', 'accent-foreground': '22 75% 45%', ring: '22 75% 62%', today: '22 75% 62%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '22 60% 94%' },
    dark: { primary: '22 65% 58%', 'primary-foreground': '22 15% 10%', accent: '22 28% 18%', 'accent-foreground': '22 55% 78%', ring: '22 65% 58%', today: '22 65% 58%', 'today-foreground': '22 15% 10%', 'sidebar-accent': '22 28% 16%' },
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatch: '#1F8A5C',
    light: { primary: '155 65% 32%', 'primary-foreground': '0 0% 98%', accent: '155 45% 92%', 'accent-foreground': '155 65% 22%', ring: '155 65% 32%', today: '155 65% 32%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '155 45% 92%' },
    dark: { primary: '155 55% 45%', 'primary-foreground': '155 15% 10%', accent: '155 22% 18%', 'accent-foreground': '155 45% 72%', ring: '155 55% 45%', today: '155 55% 45%', 'today-foreground': '155 15% 10%', 'sidebar-accent': '155 22% 16%' },
  },
  {
    id: 'plum',
    label: 'Plum',
    swatch: '#6E3A7A',
    light: { primary: '290 38% 38%', 'primary-foreground': '0 0% 98%', accent: '290 30% 93%', 'accent-foreground': '290 38% 28%', ring: '290 38% 38%', today: '290 38% 38%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '290 30% 93%' },
    dark: { primary: '290 35% 52%', 'primary-foreground': '290 15% 10%', accent: '290 22% 18%', 'accent-foreground': '290 30% 75%', ring: '290 35% 52%', today: '290 35% 52%', 'today-foreground': '290 15% 10%', 'sidebar-accent': '290 22% 16%' },
  },
  {
    id: 'copper',
    label: 'Copper',
    swatch: '#B87333',
    light: { primary: '28 55% 45%', 'primary-foreground': '0 0% 98%', accent: '28 45% 93%', 'accent-foreground': '28 55% 32%', ring: '28 55% 45%', today: '28 55% 45%', 'today-foreground': '0 0% 98%', 'sidebar-accent': '28 45% 93%' },
    dark: { primary: '28 50% 55%', 'primary-foreground': '28 15% 10%', accent: '28 25% 18%', 'accent-foreground': '28 45% 75%', ring: '28 50% 55%', today: '28 50% 55%', 'today-foreground': '28 15% 10%', 'sidebar-accent': '28 25% 16%' },
  },
]

export const DEFAULT_COLOR_THEME: ColorThemeId = 'forest'

export function getColorTheme(id: ColorThemeId): ColorTheme {
  return COLOR_THEMES.find((t) => t.id === id) ?? COLOR_THEMES[0]
}

export function applyColorThemeTokens(id: ColorThemeId, mode: 'light' | 'dark') {
  const theme = getColorTheme(id)
  const tokens = mode === 'dark' ? theme.dark : theme.light
  const root = document.documentElement
  root.dataset.colorTheme = id
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(`--${key}`, value)
  }
}

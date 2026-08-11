import { cn } from '@/lib/utils'

type SyncCalLogoProps = {
  className?: string
  size?: number
  /** Show wordmark beside the icon */
  showWordmark?: boolean
  /** Use theme primary color for the mark background */
  themed?: boolean
}

export function SyncCalLogo({
  className,
  size = 32,
  showWordmark = false,
  themed = true,
}: SyncCalLogoProps) {
  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="synccal-bg" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3A7A52" />
          <stop offset="1" stopColor="#1E4630" />
        </linearGradient>
        <linearGradient id="synccal-sync" x1="18" y1="18" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7FD4A0" />
          <stop offset="1" stopColor="#4A9E6B" />
        </linearGradient>
      </defs>
      <rect
        width="32"
        height="32"
        rx="8"
        fill={themed ? 'hsl(var(--primary))' : 'url(#synccal-bg)'}
      />
      <path
        d="M9 11.5h14a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5H9a1.5 1.5 0 0 1-1.5-1.5V13a1.5 1.5 0 0 1 1.5-1.5z"
        fill="#FAF9F6"
        fillOpacity="0.95"
      />
      <path
        d="M11.5 8.5v3M20.5 8.5v3"
        stroke="#FAF9F6"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M9 13h14"
        stroke="#2D5A3D"
        strokeWidth="1.25"
        strokeOpacity="0.25"
      />
      <circle cx="13" cy="17.5" r="1.25" fill="#2D5A3D" fillOpacity="0.55" />
      <circle cx="16" cy="17.5" r="1.25" fill="#2D5A3D" fillOpacity="0.55" />
      <circle cx="19" cy="17.5" r="1.25" fill="#2D5A3D" fillOpacity="0.55" />
      <circle cx="13" cy="21" r="1.25" fill="#2D5A3D" fillOpacity="0.35" />
      <circle cx="16" cy="21" r="1.25" fill="#2D5A3D" fillOpacity="0.35" />
      <path
        d="M21.5 19.5a3.25 3.25 0 0 0-2.2-3.05M24.75 22.75a3.25 3.25 0 0 0-2.2-3.05"
        stroke={themed ? 'hsl(var(--primary-foreground))' : 'url(#synccal-sync)'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M19.3 16.45l1.2 1.2 2.25-2.25M24.55 21.7l1.2 1.2 2.25-2.25"
        stroke={themed ? 'hsl(var(--primary-foreground))' : 'url(#synccal-sync)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  if (!showWordmark) return icon

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {icon}
      <span className="text-lg font-semibold tracking-tight text-foreground">SyncCal</span>
    </div>
  )
}

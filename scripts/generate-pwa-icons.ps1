# Generates PNG PWA icons for Android/Windows install prompts.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function New-SyncCalIcon {
  param([int]$Size, [string]$OutputPath, [switch]$Maskable)

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bmp)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 250, 249, 246))

  $inset = if ($Maskable) { [int]($Size * 0.12) } else { 0 }
  $side = $Size - (2 * $inset)
  $radius = [int]($side * 0.21)
  $rect = New-Object System.Drawing.Rectangle $inset, $inset, $side, $side

  $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 45, 90, 61))
  $roundPath = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $radius * 2
  [void]$roundPath.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
  [void]$roundPath.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
  [void]$roundPath.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
  [void]$roundPath.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
  [void]$roundPath.CloseFigure()
  $graphics.FillPath($bgBrush, $roundPath)
  $roundPath.Dispose()

  $penWidth = $Size * 0.047
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 250, 249, 246)), $penWidth
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $pad = $Size * 0.22
  $calTop = $Size * 0.38
  $calBottom = $Size * 0.78
  $calLeft = $pad
  $calRight = $Size - $pad

  $graphics.DrawRectangle($pen, $calLeft, $calTop, $calRight - $calLeft, $calBottom - $calTop)
  $graphics.DrawLine($pen, $Size * 0.34, $Size * 0.25, $Size * 0.34, $calTop)
  $graphics.DrawLine($pen, $Size * 0.66, $Size * 0.25, $Size * 0.66, $calTop)

  $dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 250, 249, 246))
  $dotR = $Size * 0.047
  $dots = @(
    @(0.41, 0.53), @(0.50, 0.53), @(0.59, 0.53),
    @(0.41, 0.66), @(0.50, 0.66)
  )
  foreach ($dot in $dots) {
    $cx = $Size * $dot[0]
    $cy = $Size * $dot[1]
    $graphics.FillEllipse($dotBrush, ($cx - $dotR), ($cy - $dotR), ($dotR * 2), ($dotR * 2))
  }

  $dir = Split-Path -Parent $OutputPath
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $graphics.Dispose()
  $bmp.Dispose()
  $bgBrush.Dispose()
  $pen.Dispose()
  $dotBrush.Dispose()
}

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$icons = Join-Path $root 'public\icons'

New-SyncCalIcon -Size 192 -OutputPath (Join-Path $icons 'icon-192.png')
New-SyncCalIcon -Size 512 -OutputPath (Join-Path $icons 'icon-512.png')
New-SyncCalIcon -Size 512 -OutputPath (Join-Path $icons 'maskable-icon-512.png') -Maskable

Write-Host "Generated PWA PNG icons in $icons"

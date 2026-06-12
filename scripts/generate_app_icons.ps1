# Kaynak logodan Expo asset'lerini üretir (1024 app icon, 48 favicon)
param(
  [string]$Source = "$PSScriptRoot\..\assets\logo-source.png"
)

$assets = Join-Path $PSScriptRoot "..\assets"
$icon1024 = Join-Path $assets "icon.png"
$adaptive = Join-Path $assets "adaptive-icon.png"
$splash = Join-Path $assets "splash-icon.png"
$favicon = Join-Path $assets "favicon.png"

Add-Type -AssemblyName System.Drawing

function Save-ResizedPng {
  param([string]$Path, [int]$Size)
  $srcImg = [System.Drawing.Image]::FromFile($Source)
  try {
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    try {
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.DrawImage($srcImg, 0, 0, $Size, $Size)
    } finally { $g.Dispose() }
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally { $srcImg.Dispose() }
}

if (-not (Test-Path $Source)) {
  Write-Error "Source not found: $Source"
  exit 1
}

Save-ResizedPng -Path $icon1024 -Size 1024
Save-ResizedPng -Path $adaptive -Size 1024
Save-ResizedPng -Path $splash -Size 1024
Save-ResizedPng -Path $favicon -Size 48

Write-Host "Generated: icon.png, adaptive-icon.png, splash-icon.png (1024), favicon.png (48)"

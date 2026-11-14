# Converts every .ppt/.pptx under notes/ to PDF (via PowerPoint), then dumps all PDFs to text.
# Output goes to extracted/ (a working directory, not served by the site).
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$pdfDir = Join-Path $root 'extracted/pdf'
$txtDir = Join-Path $root 'extracted/text'
New-Item -ItemType Directory -Force $pdfDir, $txtDir | Out-Null

$decks = Get-ChildItem (Join-Path $root 'notes') -Recurse -File | Where-Object { $_.Extension -in '.ppt', '.pptx' }
if ($decks) {
  $ppt = New-Object -ComObject PowerPoint.Application
  foreach ($d in $decks) {
    $topic = $d.Directory.Name.Substring(0, 2)
    $out = Join-Path $pdfDir ("$topic - " + $d.BaseName.Trim() + '.pdf')
    if (Test-Path $out) { continue }
    try {
      $pres = $ppt.Presentations.Open($d.FullName, $true, $false, $false)
      $pres.SaveAs($out, 32)
      $pres.Close()
      "converted: $($d.Name)"
    } catch {
      "FAILED: $($d.Name) -> $($_.Exception.Message)"
    }
  }
  $ppt.Quit()
}

$pdfs = @(Get-ChildItem (Join-Path $root 'notes') -Recurse -File -Filter *.pdf) + @(Get-ChildItem $pdfDir -File -Filter *.pdf)
foreach ($p in $pdfs) {
  $topic = if ($p.DirectoryName -eq (Resolve-Path $pdfDir).Path) { '' } else { $p.Directory.Name.Substring(0, 2) + ' - ' }
  $txt = Join-Path $txtDir ($topic + $p.BaseName.Trim() + '.txt')
  if (Test-Path $txt) { continue }
  & pdftotext -layout -enc UTF-8 $p.FullName $txt 2>$null
}
Get-ChildItem $txtDir | Select-Object Name, Length | Format-Table -AutoSize

param(
  [switch]$Clean
)

$ErrorActionPreference = "Stop"

function Add-ReportLine {
  param([string]$Line)
  $script:ReportLines += $Line
}

function Get-ToolStatus {
  param([string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($cmd) {
    return "Disponible: $($cmd.Source)"
  }
  return "No disponible"
}

$DocsRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$SourceMarkdown = Join-Path $DocsRoot "MEMORIA_TECNICA_BACKEND.md"
$BuildDir = Join-Path $DocsRoot "build"
$ExportsDir = Join-Path $DocsRoot "exports"
$GeneratedDir = Join-Path $DocsRoot "generated\diagrams"
$UnifiedMarkdown = Join-Path $BuildDir "build-unificado.md"
$ReportPath = Join-Path $BuildDir "reporte-build.md"
$OutputDocx = Join-Path $ExportsDir "MEMORIA_TECNICA_IOTFRONT.docx"
$ReferenceDoc = Join-Path $DocsRoot "reference.docx"

$ReportLines = @()
$MermaidDetected = 0
$SvgGenerated = 0
$PngGenerated = 0
$RenderErrors = @()
$PandocStatus = "No ejecutado"
$MmdcStatus = Get-ToolStatus "mmdc"
$RsvgStatus = Get-ToolStatus "rsvg-convert"

New-Item -ItemType Directory -Force $BuildDir, $ExportsDir, $GeneratedDir | Out-Null

if ($Clean) {
  Get-ChildItem $BuildDir -Filter "diagram-*.mmd" -ErrorAction SilentlyContinue | Remove-Item -Force
  Get-ChildItem $GeneratedDir -Filter "diagram-*.svg" -ErrorAction SilentlyContinue | Remove-Item -Force
  Get-ChildItem $GeneratedDir -Filter "diagram-*.png" -ErrorAction SilentlyContinue | Remove-Item -Force
  if (Test-Path $UnifiedMarkdown) {
    Remove-Item $UnifiedMarkdown -Force
  }
}

try {
  if (-not (Test-Path $SourceMarkdown)) {
    throw "No existe el Markdown fuente: $SourceMarkdown"
  }

  $pandoc = Get-Command pandoc -ErrorAction SilentlyContinue
  if (-not $pandoc) {
    $PandocStatus = "No disponible"
    throw "Pandoc no esta disponible. Instala Pandoc antes de generar el DOCX."
  }
  $PandocStatus = "Disponible: $($pandoc.Source)"

  $mmdc = Get-Command mmdc -ErrorAction SilentlyContinue
  if (-not $mmdc) {
    $MmdcStatus = "No disponible"
    throw "Mermaid CLI no esta disponible. Instalacion requerida: npm install -g @mermaid-js/mermaid-cli"
  }

  $hasRsvg = [bool](Get-Command rsvg-convert -ErrorAction SilentlyContinue)
  $markdown = Get-Content $SourceMarkdown -Raw -Encoding UTF8
  $pattern = '(?s)```mermaid\s*\r?\n(.*?)\r?\n```'
  $matches = [regex]::Matches($markdown, $pattern)
  $MermaidDetected = $matches.Count
$script:DiagramIndex = 0

  $unified = [regex]::Replace($markdown, $pattern, {
    param($match)

    $script:DiagramIndex += 1
    $num = "{0:D3}" -f $script:DiagramIndex
    $mmdPath = Join-Path $BuildDir "diagram-$num.mmd"
    $svgPath = Join-Path $GeneratedDir "diagram-$num.svg"
    $pngPath = Join-Path $GeneratedDir "diagram-$num.png"
    $diagramSource = $match.Groups[1].Value.Trim()

    Set-Content -Path $mmdPath -Value $diagramSource -Encoding UTF8

    try {
      & mmdc -i $mmdPath -o $svgPath | Out-Null
      if ($LASTEXITCODE -ne 0) {
        throw "mmdc devolvio codigo $LASTEXITCODE al generar SVG"
      }
      $script:SvgGenerated += 1

      if ($hasRsvg) {
        & rsvg-convert $svgPath -o $pngPath | Out-Null
        if ($LASTEXITCODE -eq 0 -and (Test-Path $pngPath)) {
          $script:PngGenerated += 1
          return "![Diagrama $num](generated/diagrams/diagram-$num.png)"
        }
      }

      & mmdc -i $mmdPath -o $pngPath | Out-Null
      if ($LASTEXITCODE -ne 0) {
        throw "mmdc devolvio codigo $LASTEXITCODE al generar PNG"
      }
      $script:PngGenerated += 1
      return "![Diagrama $num](generated/diagrams/diagram-$num.png)"
    } catch {
      $script:RenderErrors += "diagram-${num}: $($_.Exception.Message)"
      return "**Diagrama Mermaid no renderizado ($($num)).**"
    }
  })

  Set-Content -Path $UnifiedMarkdown -Value $unified -Encoding UTF8

  $pandocArgs = @(
    "build/build-unificado.md",
    "-o",
    "exports/MEMORIA_TECNICA_IOTFRONT.docx",
    "--toc",
    "--toc-depth=2",
    "--number-sections",
    "--resource-path=.;build;generated/diagrams;assets;assets/img;assets/diagramas"
  )

  if (Test-Path $ReferenceDoc) {
    $pandocArgs += "--reference-doc=reference.docx"
  }

  Push-Location $DocsRoot
  try {
    & pandoc @pandocArgs | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "Pandoc devolvio codigo $LASTEXITCODE"
    }
    if (Test-Path $OutputDocx) {
      $PandocStatus = "Correcto: DOCX generado"
    } else {
      $PandocStatus = "Ejecutado sin DOCX localizado"
    }
  } finally {
    Pop-Location
  }
} catch {
  Add-ReportLine "# Reporte de build documental"
  Add-ReportLine ""
  Add-ReportLine "- Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  Add-ReportLine "- Ruta docs: $DocsRoot"
  Add-ReportLine "- Markdown fuente: $SourceMarkdown"
  Add-ReportLine "- Markdown unificado: $UnifiedMarkdown"
  Add-ReportLine "- DOCX destino: $OutputDocx"
  Add-ReportLine "- Estado de Pandoc: $PandocStatus"
  Add-ReportLine "- Estado de Mermaid CLI: $MmdcStatus"
  Add-ReportLine "- Estado de rsvg-convert: $RsvgStatus"
  Add-ReportLine "- Mermaid detectados: $MermaidDetected"
  Add-ReportLine "- SVG generados: $SvgGenerated"
  Add-ReportLine "- PNG generados: $PngGenerated"
  Add-ReportLine "- Errores de render: $($RenderErrors.Count)"
  foreach ($renderError in $RenderErrors) {
    Add-ReportLine "  - $renderError"
  }
  Add-ReportLine "- Estado final del DOCX: Error"
  Add-ReportLine "- Error: $($_.Exception.Message)"
  Set-Content -Path $ReportPath -Value ($ReportLines -join [Environment]::NewLine) -Encoding UTF8
  Write-Error $_.Exception.Message
  exit 1
}

Add-ReportLine "# Reporte de build documental"
Add-ReportLine ""
Add-ReportLine "- Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Add-ReportLine "- Ruta docs: $DocsRoot"
Add-ReportLine "- Markdown fuente: $SourceMarkdown"
Add-ReportLine "- Markdown unificado: $UnifiedMarkdown"
Add-ReportLine "- DOCX destino: $OutputDocx"
Add-ReportLine "- Estado de Pandoc: $PandocStatus"
Add-ReportLine "- Estado de Mermaid CLI: $MmdcStatus"
Add-ReportLine "- Estado de rsvg-convert: $RsvgStatus"
Add-ReportLine "- Mermaid detectados: $MermaidDetected"
Add-ReportLine "- SVG generados: $SvgGenerated"
Add-ReportLine "- PNG generados: $PngGenerated"
Add-ReportLine "- Errores de render: $($RenderErrors.Count)"
foreach ($renderError in $RenderErrors) {
  Add-ReportLine "  - $renderError"
}
$docxFinalStatus = if (Test-Path $OutputDocx) { "Generado" } else { "No generado" }
Add-ReportLine "- Estado final del DOCX: $docxFinalStatus"

Set-Content -Path $ReportPath -Value ($ReportLines -join [Environment]::NewLine) -Encoding UTF8
Write-Host "Build documental finalizado: $docxFinalStatus"

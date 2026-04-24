param(
  [Parameter(Mandatory = $true)]
  [string]$Source,
  [Parameter(Mandatory = $true)]
  [string]$Dest,
  [string]$RepoUrl = "https://github.com/ohmyjahh/xquads-squads",
  [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$skillMetadata = @{
  "advisory-board" = @{
    DisplayName = "Xquads Advisory Board"
    ShortDescription = "Strategic boardroom counsel for founders and operators"
    Description = "Strategic board-style advisory, decision frameworks, founder counsel, leadership guidance, scaling analysis, and culture problem-solving using the Xquads Advisory Board materials. Use when users want multi-angle strategic thinking, board-level tradeoffs, or executive guidance."
    DefaultPrompt = "Use `$xquads-advisory-board to pressure-test a strategic decision, founder dilemma, or scaling plan."
    Overview = "Apply the Advisory Board squad as a boardroom-style reasoning layer for strategy, leadership, and high-stakes decisions."
  }
  "brand-squad" = @{
    DisplayName = "Xquads Brand Squad"
    ShortDescription = "Brand strategy, positioning, identity, and naming"
    Description = "Brand strategy, positioning, naming, identity systems, archetypes, architecture, and luxury brand thinking using the Xquads Brand Squad materials. Use when users need structured branding guidance, rebranding strategy, naming systems, or brand narrative development."
    DefaultPrompt = "Use `$xquads-brand-squad to shape positioning, naming, identity, or a rebrand strategy."
    Overview = "Apply the Brand Squad as a structured brand strategy layer spanning equity, positioning, naming, identity, and architecture."
  }
  "c-level-squad" = @{
    DisplayName = "Xquads C-Level Squad"
    ShortDescription = "C-suite operating guidance across core functions"
    Description = "C-level operating guidance across product, growth, finance, operations, people, and executive decision-making using the Xquads C-Level Squad materials. Use when users need coordinated executive thinking or cross-functional operating recommendations."
    DefaultPrompt = "Use `$xquads-c-level-squad to frame a cross-functional executive decision or operating plan."
    Overview = "Apply the C-Level Squad as a cross-functional executive operating layer for company-building and organizational tradeoffs."
  }
  "claude-code-mastery" = @{
    DisplayName = "Xquads Claude Code Mastery"
    ShortDescription = "Coding workflows, architecture, and engineering rigor"
    Description = "Engineering execution guidance for coding workflows, architecture, debugging, reviews, and high-quality delivery using the Xquads Claude Code Mastery materials. Use when users need more structured engineering decision-making, implementation quality bars, or coding workflow guidance."
    DefaultPrompt = "Use `$xquads-claude-code-mastery to guide a coding workflow, architecture decision, or engineering review."
    Overview = "Apply the Claude Code Mastery squad as a disciplined engineering workflow layer for implementation, debugging, and review."
  }
  "copy-squad" = @{
    DisplayName = "Xquads Copy Squad"
    ShortDescription = "Messaging, persuasive copy, and conversion writing"
    Description = "Persuasive messaging, conversion copy, offer framing, launch copy, and editorial communication using the Xquads Copy Squad materials. Use when users need sharper messaging, higher-conviction copy, campaign writing, or structured narrative refinement."
    DefaultPrompt = "Use `$xquads-copy-squad to improve messaging, conversion copy, or launch communications."
    Overview = "Apply the Copy Squad as a structured writing layer for persuasive messaging, offer framing, and conversion-focused communication."
  }
  "cybersecurity" = @{
    DisplayName = "Xquads Cybersecurity"
    ShortDescription = "Security reviews, threat thinking, and resilience guidance"
    Description = "Security review, threat modeling, risk identification, defensive planning, and resilience guidance using the Xquads Cybersecurity materials. Use when users need security-minded thinking, security reviews, or operational hardening guidance."
    DefaultPrompt = "Use `$xquads-cybersecurity to review risks, harden a system, or structure a security response."
    Overview = "Apply the Cybersecurity squad as a security-first reasoning layer for risk assessment, controls, and resilience work."
  }
  "data-squad" = @{
    DisplayName = "Xquads Data Squad"
    ShortDescription = "Analytics, decision support, and data storytelling"
    Description = "Analytics strategy, KPI design, dashboards, experimentation, decision support, and data storytelling using the Xquads Data Squad materials. Use when users need structured analytics thinking, metric design, insight generation, or data-informed operating recommendations."
    DefaultPrompt = "Use `$xquads-data-squad to define KPIs, interpret data, or structure a decision-support analysis."
    Overview = "Apply the Data Squad as an analytics and insight layer for KPIs, experiments, dashboards, and decision support."
  }
  "design-squad" = @{
    DisplayName = "Xquads Design Squad"
    ShortDescription = "Design systems, UX/UI, audits, and handoff"
    Description = "Design systems, UX flows, interface audits, component specifications, visual direction, accessibility, and design handoff using the Xquads Design Squad materials. Use when users want premium product design guidance, UX structuring, design system work, or UI implementation direction."
    DefaultPrompt = "Use `$xquads-design-squad to guide a design system, UX flow, or premium UI direction task."
    Overview = "Apply the Design Squad as a structured design advisory layer for systems, UX, UI, audits, and handoff."
  }
  "hormozi-squad" = @{
    DisplayName = "Xquads Hormozi Squad"
    ShortDescription = "Offers, growth mechanics, and value optimization"
    Description = "Offer design, pricing logic, acquisition mechanics, retention leverage, and value optimization using the Xquads Hormozi Squad materials. Use when users need high-leverage commercial thinking around offers, growth systems, monetization, or customer value."
    DefaultPrompt = "Use `$xquads-hormozi-squad to sharpen an offer, pricing structure, or growth mechanism."
    Overview = "Apply the Hormozi Squad as a value-creation and offer-optimization layer for revenue and growth work."
  }
  "movement" = @{
    DisplayName = "Xquads Movement"
    ShortDescription = "Movement-building, community, and cultural momentum"
    Description = "Movement-building, community activation, mission design, and cultural momentum using the Xquads Movement materials. Use when users need to create belief systems, activate communities, or turn a brand into a movement."
    DefaultPrompt = "Use `$xquads-movement to build a movement strategy, community narrative, or cultural activation plan."
    Overview = "Apply the Movement squad as a narrative and community layer for building belief, belonging, and momentum."
  }
  "storytelling" = @{
    DisplayName = "Xquads Storytelling"
    ShortDescription = "Narrative design, story arcs, and emotional framing"
    Description = "Narrative design, story arcs, emotional framing, and structured storytelling using the Xquads Storytelling materials. Use when users need stronger stories for brand, product, launch, founder narrative, or persuasive communication."
    DefaultPrompt = "Use `$xquads-storytelling to build a sharper narrative, story arc, or emotionally resonant message."
    Overview = "Apply the Storytelling squad as a narrative layer for positioning, launches, persuasion, and emotional resonance."
  }
  "traffic-masters" = @{
    DisplayName = "Xquads Traffic Masters"
    ShortDescription = "Paid traffic, channel strategy, and acquisition thinking"
    Description = "Paid traffic strategy, channel selection, acquisition planning, funnel coordination, and campaign scaling using the Xquads Traffic Masters materials. Use when users need structured traffic strategy, campaign architecture, or performance acquisition guidance."
    DefaultPrompt = "Use `$xquads-traffic-masters to plan paid acquisition, channel mix, or campaign scaling."
    Overview = "Apply the Traffic Masters squad as an acquisition strategy layer for paid traffic, channels, and funnel planning."
  }
}

$sourceDirs = @("agents", "tasks", "workflows", "checklists", "config", "data", "scripts", "templates")

function Get-ScalarValue {
  param(
    [string]$Text,
    [string]$Key
  )

  $match = [regex]::Match($Text, "(?m)^" + [regex]::Escape($Key) + ":\s*""?(.*?)""?\s*$")
  if ($match.Success) {
    return $match.Groups[1].Value.Trim()
  }

  return $null
}

function Get-BlockList {
  param(
    [string]$Text,
    [string]$Key
  )

  $result = @()
  $match = [regex]::Match($Text, "(?ms)^" + [regex]::Escape($Key) + ":\s*\n(?<body>(?:^[ \t]*-[^\n]*\n)+)")
  if (-not $match.Success) {
    return $result
  }

  foreach ($line in $match.Groups["body"].Value -split "`n") {
    $trimmed = $line.Trim()
    if ($trimmed.StartsWith("- ")) {
      $result += $trimmed.Substring(2).Trim().Trim('"')
    }
  }

  return $result
}

function Convert-ToTitle {
  param([string]$Value)
  return ((($Value -split "-") | ForEach-Object {
    if ($_.Length -eq 0) { return $_ }
    return $_.Substring(0, 1).ToUpper() + $_.Substring(1)
  }) -join " ")
}

function Copy-ReferenceTree {
  param(
    [string]$SquadPath,
    [string]$ReferencesPath
  )

  $componentMap = @{}

  foreach ($dirName in $sourceDirs) {
    $sourcePath = Join-Path $SquadPath $dirName
    if (-not (Test-Path $sourcePath)) {
      continue
    }

    $destinationPath = Join-Path $ReferencesPath $dirName
    New-Item -ItemType Directory -Path $destinationPath -Force | Out-Null
    $files = @()

    foreach ($item in Get-ChildItem $sourcePath -Recurse -File) {
      if ($item.Name -eq ".DS_Store") {
        continue
      }

      $relative = $item.FullName.Substring($sourcePath.Length).TrimStart("\", "/").Replace("\", "/")
      $target = Join-Path $destinationPath $relative
      $targetParent = Split-Path $target -Parent
      if (-not (Test-Path $targetParent)) {
        New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
      }

      Copy-Item $item.FullName $target -Force
      $files += $relative
    }

    $componentMap[$dirName] = $files
  }

  return $componentMap
}

function New-BulletBlock {
  param(
    [string[]]$Values,
    [string]$Fallback
  )

  if ($null -eq $Values -or $Values.Count -eq 0) {
    return "- $Fallback"
  }

  return ($Values | ForEach-Object { "- $_" }) -join "`n"
}

function New-SkillMarkdown {
  param(
    [string]$SkillName,
    [string]$SquadName,
    [hashtable]$Metadata,
    [string[]]$Tags,
    [hashtable]$ComponentMap
  )

  $tagBlock = if ($Tags.Count -gt 0) {
    ($Tags | ForEach-Object { $_ }) -join ", "
  } else {
    "xquads"
  }

  $taskBlock = New-BulletBlock -Values $ComponentMap["tasks"] -Fallback "Consulte references/manifest.md para os materiais disponíveis."
  $workflowBlock = New-BulletBlock -Values $ComponentMap["workflows"] -Fallback "Nenhum workflow estruturado foi empacotado neste squad."

  return @"
---
name: $SkillName
description: $($Metadata.Description)
---

# $SquadName

## Overview

$($Metadata.Overview)

Comece por references/manifest.md. Depois leia apenas os arquivos realmente relevantes para o pedido atual.

## Workflow

1. Leia `references/manifest.md` para entender agentes, tarefas, workflows e catalogos empacotados.
2. Escolha uma linha principal de trabalho em vez de tentar imitar todos os especialistas ao mesmo tempo.
3. Abra a task ou workflow mais proximo do pedido.
4. Leia apenas os agentes que agregam contexto real para essa execucao.
5. Converta o material em saídas nativas do Codex: decisões, planos, copy, design direction, implementação ou revisão.

## Quick Routing

**Tasks empacotadas**
$taskBlock

**Workflows empacotados**
$workflowBlock

**Temas fortes deste squad**
$tagBlock

## Resource Map

- references/manifest.md: mapa consolidado do squad convertido.
- references/squad.yaml: manifesto original do squad.
- references/agents/: personas, heuristicas e criterios de cada especialista.
- references/tasks/: tarefas prontas do squad original.
- references/workflows/: sequencias de execucao multi-etapas.
- references/checklists/: criterios de qualidade.
- references/config/ e references/data/: catalogos e configuracoes de apoio quando existirem.

## Working Rules

- Traduza o material original para entregas concretas e atuais no contexto do usuario.
- Nao trate os arquivos originais como lei absoluta; use-os como guias especializados.
- Prefira sintese e decisao pratica em vez de reproduzir longos trechos das personas.
- Se houver conflito entre agentes, explicite o trade-off e recomende um caminho.
- Preserve a arquitetura, limitacoes e objetivo real do projeto do usuario.
"@
}

function New-OpenAiYaml {
  param([hashtable]$Metadata)

  return @"
interface:
  display_name: "$($Metadata.DisplayName)"
  short_description: "$($Metadata.ShortDescription)"
  default_prompt: "$($Metadata.DefaultPrompt)"

policy:
  allow_implicit_invocation: false
"@
}

function New-ManifestMarkdown {
  param(
    [string]$SquadName,
    [string]$SourceName,
    [string]$SourceDescription,
    [string[]]$Tags,
    [hashtable]$ComponentMap
  )

  $tagBlock = if ($Tags.Count -gt 0) {
    ($Tags | ForEach-Object { $_ }) -join ", "
  } else {
    "xquads"
  }

  $sections = @()
  foreach ($section in @("agents", "tasks", "workflows", "checklists", "config", "data", "scripts", "templates")) {
    $title = (Convert-ToTitle $section)
    $values = @()
    if ($ComponentMap.ContainsKey($section)) {
      $values = $ComponentMap[$section]
    }

    $bulletBlock = New-BulletBlock -Values $values -Fallback "Nenhum arquivo convertido."
    $sections += "## $title`n`n$bulletBlock"
  }

  return @"
# $SquadName Manifest

- Source repo: `$RepoUrl`
- Source folder: $SourceName
- Original description: $SourceDescription
- Tags: $tagBlock

Use este manifesto como ponto de entrada. Abra depois apenas os diretorios relevantes para o pedido atual.

$($sections -join "`n`n")
"@
}

function Test-SkillStructure {
  param([string]$SkillPath)

  $skillMd = Join-Path $SkillPath "SKILL.md"
  $openAiYaml = Join-Path $SkillPath "agents\openai.yaml"
  $manifest = Join-Path $SkillPath "references\manifest.md"

  if (-not (Test-Path $skillMd)) { throw "Missing SKILL.md in $SkillPath" }
  if (-not (Test-Path $openAiYaml)) { throw "Missing agents/openai.yaml in $SkillPath" }
  if (-not (Test-Path $manifest)) { throw "Missing references/manifest.md in $SkillPath" }

  $skillContent = Get-Content $skillMd -Raw
  if (-not $skillContent.StartsWith("---")) { throw "SKILL.md missing frontmatter in $SkillPath" }
  if ($skillContent -notmatch "(?m)^name:\s+") { throw "SKILL.md missing name field in $SkillPath" }
  if ($skillContent -notmatch "(?m)^description:\s+") { throw "SKILL.md missing description field in $SkillPath" }
}

$sourceRoot = (Resolve-Path $Source).Path
$destRoot = [System.IO.Path]::GetFullPath($Dest)

if (-not (Test-Path $destRoot)) {
  New-Item -ItemType Directory -Path $destRoot -Force | Out-Null
}

$converted = @()

foreach ($squadDir in Get-ChildItem $sourceRoot -Directory | Sort-Object Name) {
  if ($squadDir.Name -eq ".next") {
    continue
  }

  $squadYamlPath = Join-Path $squadDir.FullName "squad.yaml"
  $configYamlPath = Join-Path $squadDir.FullName "config.yaml"
  if (-not (Test-Path $squadYamlPath) -and -not (Test-Path $configYamlPath)) {
    continue
  }

  if (-not $skillMetadata.ContainsKey($squadDir.Name)) {
    throw "No metadata mapping found for $($squadDir.Name)"
  }

  $metadata = $skillMetadata[$squadDir.Name]
  $skillName = "xquads-$($squadDir.Name)"
  $skillPath = Join-Path $destRoot $skillName

  if (Test-Path $skillPath) {
    if (-not $Force) {
      throw "Destination already exists: $skillPath"
    }

    Remove-Item $skillPath -Recurse -Force
  }

  $sourceDefinitionPath = if (Test-Path $squadYamlPath) { $squadYamlPath } else { $configYamlPath }
  $sourceDefinition = Get-Content $sourceDefinitionPath -Raw
  $sourceName = Get-ScalarValue -Text $sourceDefinition -Key "name"
  if (-not $sourceName) {
    $sourceName = $squadDir.Name
  }

  $shortTitle = Get-ScalarValue -Text $sourceDefinition -Key "short-title"
  if (-not $shortTitle) {
    $shortTitle = Get-ScalarValue -Text $sourceDefinition -Key "display_name"
  }
  if (-not $shortTitle) {
    $shortTitle = Convert-ToTitle $sourceName
  }

  $sourceDescription = Get-ScalarValue -Text $sourceDefinition -Key "description"
  if (-not $sourceDescription) {
    $sourceDescription = "Converted squad from $sourceName"
  }

  $tags = @(Get-BlockList -Text $sourceDefinition -Key "tags")
  if ($tags.Count -eq 0) {
    $tags = @(Get-BlockList -Text $sourceDefinition -Key "keywords")
  }

  New-Item -ItemType Directory -Path $skillPath -Force | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $skillPath "references") -Force | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $skillPath "agents") -Force | Out-Null

  $componentMap = Copy-ReferenceTree -SquadPath $squadDir.FullName -ReferencesPath (Join-Path $skillPath "references")
  Copy-Item $sourceDefinitionPath (Join-Path $skillPath "references\squad.yaml") -Force

  $skillMd = New-SkillMarkdown -SkillName $skillName -SquadName $shortTitle -Metadata $metadata -Tags $tags -ComponentMap $componentMap
  Set-Content -Path (Join-Path $skillPath "SKILL.md") -Value $skillMd -Encoding UTF8

  $openAiYaml = New-OpenAiYaml -Metadata $metadata
  Set-Content -Path (Join-Path $skillPath "agents\openai.yaml") -Value $openAiYaml -Encoding UTF8

  $manifestMd = New-ManifestMarkdown -SquadName $shortTitle -SourceName $sourceName -SourceDescription $sourceDescription -Tags $tags -ComponentMap $componentMap
  Set-Content -Path (Join-Path $skillPath "references\manifest.md") -Value $manifestMd -Encoding UTF8

  Test-SkillStructure -SkillPath $skillPath
  $converted += $skillName
  Write-Host "Converted $($squadDir.Name) -> $skillName"
}

Write-Host ""
Write-Host "Installed skills:"
$converted | ForEach-Object { Write-Host "- $_" }

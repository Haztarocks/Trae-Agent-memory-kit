param(
  [Parameter(Position=0)][string]$Action,
  [string]$Agent,
  [string]$MemoryDir,
  [string]$Out,
  [string]$OutputDir,
  [string]$ProjectDir
)

function Resolve-NodeExe {
  $local = Join-Path $PSScriptRoot 'node-v20.10.0-win-x64\node.exe'
  if (Test-Path $local) { return $local }
  $parent = Join-Path (Split-Path $PSScriptRoot -Parent) 'node-v20.10.0-win-x64\node.exe'
  if (Test-Path $parent) { return $parent }
  if ($env:TRAE_NODE_EXE) { return $env:TRAE_NODE_EXE }
  return 'node'
}

$node = Resolve-NodeExe

switch ($Action) {
  'fuse' {
    $script = Join-Path $PSScriptRoot 'scripts\memory_fusion.cjs'
    $args = @()
    if ($OutputDir) { $args += @('--output-dir', $OutputDir) }
    $restore = Get-Location
    try {
      if ($ProjectDir -and (Test-Path $ProjectDir)) { Push-Location $ProjectDir }
      & $node $script @args
    } finally {
      Set-Location $restore
    }
    break
  }
  'bootstrap' {
    $bin = Join-Path $PSScriptRoot 'bin\trae-bootstrap.js'
    $args = @()
    if ($Agent) { $args += @('--agent', $Agent) }
    if ($MemoryDir) { $args += @('--memory-dir', $MemoryDir) }
    if ($Out) { $args += @('--out', $Out) }
    & $node $bin @args
    break
  }
  'bootstrap:rp' {
    $bin = Join-Path $PSScriptRoot 'bin\trae-bootstrap.js'
    $args = @('rp')
    if ($Agent) { $args += @('--agent', $Agent) }
    if ($MemoryDir) { $args += @('--memory-dir', $MemoryDir) }
    if ($Out) { $args += @('--out', $Out) }
    & $node $bin @args
    break
  }
  'append' {
    $script = Join-Path $PSScriptRoot 'scripts\append_fusion.cjs'
    $args = @()
    if ($MemoryDir) { $args += @('--memory-dir', $MemoryDir) }
    & $node $script @args
    break
  }
  default {
    Write-Host 'Usage: .\run-kit.ps1 <action> [options]'
    Write-Host 'Actions: fuse, bootstrap, bootstrap:rp, append'
    Write-Host 'Examples:'
    Write-Host '.\run-kit.ps1 fuse -ProjectDir C:\\path\\to\\project -OutputDir .\\.trae\\shared'
    Write-Host '.\run-kit.ps1 bootstrap -Agent ump45 -MemoryDir C:\\path\\apps\\ump45\\trae_memory'
    Write-Host '.\run-kit.ps1 bootstrap:rp -Agent shop -MemoryDir C:\\path\\apps\\shop\\trae_memory'
    Write-Host '.\run-kit.ps1 append -MemoryDir C:\\path\\apps\\ump45\\trae_memory'
  }
}

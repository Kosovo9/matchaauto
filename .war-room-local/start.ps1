# Wrapper del repo -> llama al War Room central
param(
  [switch]$NoVSCode,
  [switch]$AiderOnly,
  [switch]$Quality,
  [string]$Model = ""
)

$central = "C:\War Room Local\ops\start-war-room.ps1"
& $central -RepoPath "C:\Match-auto-1" -NoVSCode:$NoVSCode -AiderOnly:$AiderOnly -Quality:$Quality -Model ""

<#
  KHO BAU TRI THUC - AUTO RUNNER v2 (task queue for OpenCode)

  Runs every task file in docs/opencode/queue/ (named NN_ID_description.md, in file-name order)
  with OpenCode, one at a time, then keeps watching the queue for new task files.
  Per task: branch p42/ID from main -> opencode run --auto -> commit leftovers ->
            npm run typecheck + npm test + npm run build -> up to 2 auto-fix rounds ->
            merge into LOCAL main.
  Never pushes to GitHub. A task that still fails is marked BLOCKED and the queue pauses there
  (edit that task file, or create docs/opencode/state/ID.retry, to try it again).

  Start : double-click docs\opencode\CHAY_TU_DONG.bat (after the first run it also starts with Windows)
  Stop  : docs\opencode\DUNG_LAI.bat (after the current task) or close the window (immediately)
  Off   : docs\opencode\TAT_TU_DONG.bat (stop + remove the Windows auto-start)
  Status: docs\opencode\TRANG_THAI.md      Logs: docs\opencode\logs\
  Model : docs\opencode\state\model.txt if present, else the model of your latest OpenCode
          session in this project, else the OpenCode default model.
#>
param(
  [string]$Model = '',
  [int]$TaskTimeoutMin = 240,
  [int]$FixTimeoutMin = 120,
  [int]$MaxFixAttempts = 2,
  [int]$IdlePollSec = 120,
  [int]$QuietMin = 20,
  [switch]$Once,
  [switch]$NoAutostart,
  [switch]$NoWait
)

$ErrorActionPreference = 'Continue'
$ProgressPreference = 'SilentlyContinue'

$OcDir    = $PSScriptRoot
$Root     = Split-Path -Parent (Split-Path -Parent $OcDir)
$QueueDir = Join-Path $OcDir 'queue'
$StateDir = Join-Path $OcDir 'state'
$LogDir   = Join-Path $OcDir 'logs'
$RepDir   = Join-Path $OcDir 'reports'
$StatusMd = Join-Path $OcDir 'TRANG_THAI.md'
$StopFile = Join-Path $StateDir 'STOP'
$LockFile = Join-Path $StateDir 'runner.lock'
$BeatFile = Join-Path $StateDir 'heartbeat.txt'
$EmptyIn  = Join-Path $StateDir 'empty-stdin.txt'
$MainLog  = Join-Path $LogDir 'runner.log'

foreach ($d in @($QueueDir, $StateDir, $LogDir, $RepDir)) {
  if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}
Set-Location -Path $Root
[System.IO.File]::WriteAllText($EmptyIn, '')

$script:Phase           = 'KHOI DONG'
$script:Current         = '-'
$script:Note            = ''
$script:ModelId         = ''
$script:OC              = $null
$script:AutoFlag        = ' --auto'
$script:TaskStart       = Get-Date
$script:Tasks           = @()
$script:OwnPids         = @()
$script:LastOwnActivity = [datetime]::MinValue

# ---------------------------------------------------------------- logging / status

function Log([string]$Msg) {
  $line = '[' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + '] ' + $Msg
  Write-Host $line
  try { Add-Content -Path $MainLog -Value $line -Encoding Ascii } catch {}
}

function Task-Result([string]$Id) {
  $f = Join-Path $StateDir ($Id + '.result')
  if (Test-Path $f) {
    $r = (Get-Content -Path $f -Encoding UTF8 -ErrorAction SilentlyContinue | Select-Object -First 1)
    if ($r) { return $r }
  }
  return 'cho'
}

function Write-Status {
  [string[]]$out = @()
  $out += '# Kho Bau Auto Runner - trang thai'
  $out += ''
  $out += ('- Cap nhat luc: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
  $out += ('- Tinh trang: **' + $script:Phase + '**')
  if ($script:ModelId) { $m = $script:ModelId } else { $m = '(model mac dinh cua OpenCode)' }
  $out += ('- Model OpenCode: ' + $m)
  $out += ('- Dang lam: ' + $script:Current + ' ' + $script:Note)
  $done = 0
  foreach ($t in $script:Tasks) { if (Test-Path (Join-Path $StateDir ($t.Id + '.done'))) { $done++ } }
  $out += ('- Tien do: ' + $done + '/' + $script:Tasks.Count + ' task xong')
  $out += ''
  $out += '| # | Task | File | Ket qua |'
  $out += '|---|---|---|---|'
  $i = 0
  foreach ($t in $script:Tasks) {
    $i++
    $out += ('| ' + $i + ' | ' + $t.Id + ' | ' + $t.File + ' | ' + (Task-Result $t.Id) + ' |')
  }
  $out += ''
  $out += '- Them viec: tao file moi trong docs/opencode/queue/ (ten dang NN_ID_mo-ta.md), runner tu nhan.'
  $out += '- Chay lai task bi loi: sua file task do, hoac tao file docs/opencode/state/<ID>.retry'
  $out += '- Dung sau task dang lam: DUNG_LAI.bat | Tat han (ca tu bat cung Windows): TAT_TU_DONG.bat'
  $out += '- Log: docs/opencode/logs/ | Bao cao: docs/opencode/reports/'
  try { Set-Content -Path $StatusMd -Value $out -Encoding UTF8 } catch {}
  try { Set-Content -Path $BeatFile -Value ((Get-Date -Format s) + ' pid=' + $PID) -Encoding Ascii } catch {}
}

function Set-Result([string]$Id, [string]$Text) {
  try { Set-Content -Path (Join-Path $StateDir ($Id + '.result')) -Value $Text -Encoding UTF8 } catch {}
  Log ($Id + ': ' + $Text)
  Write-Status
}

function Heartbeat([string]$What) {
  $mins = [int]((Get-Date) - $script:TaskStart).TotalMinutes
  $script:Note = '(' + $What + ' - ' + $mins + ' phut, cap nhat ' + (Get-Date -Format 'HH:mm') + ')'
  try { $Host.UI.RawUI.WindowTitle = 'Kho Bau Auto Runner - ' + $script:Current + ' - ' + $What } catch {}
  Write-Status
}

# ---------------------------------------------------------------- Windows helpers

$script:CanStayAwake = $false
try {
  Add-Type -Namespace P42Native -Name Power -MemberDefinition '[System.Runtime.InteropServices.DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);' -ErrorAction Stop
  $script:CanStayAwake = $true
} catch {}
function Stay-Awake { if ($script:CanStayAwake) { try { [void][P42Native.Power]::SetThreadExecutionState([uint32]2147483649) } catch {} } }
function Allow-Sleep { if ($script:CanStayAwake) { try { [void][P42Native.Power]::SetThreadExecutionState([uint32]2147483648) } catch {} } }

# A click inside a console window (QuickEdit) freezes the script until a key is pressed - turn it off.
function Disable-QuickEdit {
  try {
    Add-Type -Namespace P42Native -Name Con -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("kernel32.dll")] public static extern System.IntPtr GetStdHandle(int nStdHandle);
[System.Runtime.InteropServices.DllImport("kernel32.dll")] public static extern bool GetConsoleMode(System.IntPtr hConsoleHandle, out uint lpMode);
[System.Runtime.InteropServices.DllImport("kernel32.dll")] public static extern bool SetConsoleMode(System.IntPtr hConsoleHandle, uint dwMode);
'@ -ErrorAction Stop
    $h = [P42Native.Con]::GetStdHandle(-10)
    $mode = [uint32]0
    if ([P42Native.Con]::GetConsoleMode($h, [ref]$mode)) {
      $new = [uint32](([int64]$mode -bor 128) -band 4294967231)
      [void][P42Native.Con]::SetConsoleMode($h, $new)
    }
  } catch {}
}

function Install-Autostart {
  if ($NoAutostart) { return }
  try {
    $startup = [Environment]::GetFolderPath('Startup')
    if (-not $startup) { return }
    $lnk = Join-Path $startup 'Kho Bau Auto Runner.lnk'
    $ws = New-Object -ComObject WScript.Shell
    $s = $ws.CreateShortcut($lnk)
    $s.TargetPath = (Join-Path $OcDir 'CHAY_TU_DONG.bat')
    $s.WorkingDirectory = $OcDir
    $s.WindowStyle = 7
    $s.Description = 'Kho Bau Tri Thuc - tu chay hang doi task OpenCode'
    $s.Save()
    Log ('Tu khoi dong cung Windows: ' + $lnk)
  } catch { Log ('Khong cai duoc tu khoi dong (bo qua): ' + $_.Exception.Message) }
}

function Acquire-Lock {
  if (Test-Path $LockFile) {
    $old = ''
    try { $old = ((Get-Content -Path $LockFile -ErrorAction Stop | Select-Object -First 1) + '').Trim() } catch {}
    if (($old -match '^\d+$') -and ([int]$old -ne $PID)) {
      $op = Get-Process -Id ([int]$old) -ErrorAction SilentlyContinue
      if ($op -and $op.ProcessName -like 'powershell*') {
        $age = 9999
        if (Test-Path $BeatFile) { $age = ((Get-Date) - (Get-Item $BeatFile).LastWriteTime).TotalMinutes }
        elseif (Test-Path $StatusMd) { $age = ((Get-Date) - (Get-Item $StatusMd).LastWriteTime).TotalMinutes }
        if ($age -lt 10) { return $false }
        # Stale: only kill it if it really is this runner (Windows reuses PIDs).
        $cmd = ''
        try { $cmd = [string](Get-CimInstance Win32_Process -Filter ('ProcessId=' + $old) -ErrorAction Stop).CommandLine } catch {}
        if ($cmd -like '*run-all.ps1*') {
          try { Stop-Process -Id ([int]$old) -Force -ErrorAction Stop; Log ('Da dung runner cu bi treo (PID ' + $old + ')') } catch {}
          Start-Sleep -Seconds 2
        }
      }
    }
  }
  Set-Content -Path $LockFile -Value $PID -Encoding Ascii
  return $true
}

# ---------------------------------------------------------------- OpenCode + git helpers

function Find-OpenCode {
  $c = Get-Command 'opencode.exe' -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($c) { return $c.Source }
  $c = Get-Command 'opencode.cmd' -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($c) { return $c.Source }
  $cands = @(
    (Join-Path $env:APPDATA 'npm\opencode.cmd'),
    (Join-Path $env:USERPROFILE '.opencode\bin\opencode.exe'),
    (Join-Path $env:USERPROFILE 'scoop\shims\opencode.exe'),
    (Join-Path $env:USERPROFILE '.bun\bin\opencode.exe'),
    (Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links\opencode.exe'),
    'C:\ProgramData\chocolatey\bin\opencode.exe'
  )
  foreach ($p in $cands) { if ($p -and (Test-Path $p)) { return $p } }
  return $null
}

function Detect-Capabilities {
  # Newer OpenCode: "run --auto" + "question" permission. Older: neither, so fall back to
  # explicit allow rules that every version understands.
  $script:AutoFlag = ''
  try {
    $ver = (& $script:OC --version 2>&1 | Out-String).Trim()
    Log ('OpenCode version: ' + $ver)
    $help = (& $script:OC run --help 2>&1 | Out-String)
    if ($help -match '--auto') { $script:AutoFlag = ' --auto' }
  } catch {}
  $deny = '"git push*":"deny","git checkout*":"deny","git switch*":"deny","git merge*":"deny","git rebase*":"deny","git reset --hard*":"deny","git clean*":"deny","git stash*":"deny","git branch -D*":"deny","git worktree*":"deny","gh *":"deny","npm publish*":"deny","rm -rf /*":"deny","rm -rf ~*":"deny"'
  if ($script:AutoFlag) {
    $env:OPENCODE_CONFIG_CONTENT = '{"permission":{"question":"deny","bash":{"*":"allow",' + $deny + '}}}'
    Log 'Che do: opencode run --auto'
  } else {
    $env:OPENCODE_CONFIG_CONTENT = '{"permission":{"edit":"allow","webfetch":"allow","doom_loop":"allow","external_directory":"allow","bash":{"*":"allow",' + $deny + '}}}'
    Log 'Che do: OpenCode cu (khong co --auto) - dung quyen allow trong config'
  }
}

function Detect-Model {
  if ($Model) { return $Model }
  $f = Join-Path $StateDir 'model.txt'
  if (Test-Path $f) {
    $m = (Get-Content -Path $f -ErrorAction SilentlyContinue | Select-Object -First 1)
    if ($m -and $m.Trim()) { return $m.Trim() }
  }
  try {
    $json = (& $script:OC session list --format json -n 5 2>$null | Out-String)
    $sids = [regex]::Matches($json, '"id"\s*:\s*"(ses_[A-Za-z0-9]+)"')
    foreach ($s in $sids) {
      $exp = (& $script:OC export $s.Groups[1].Value 2>$null | Out-String)
      $pv = [regex]::Matches($exp, '"providerID"\s*:\s*"([^"]+)"')
      $md = [regex]::Matches($exp, '"modelID"\s*:\s*"([^"]+)"')
      if ($pv.Count -gt 0 -and $md.Count -gt 0) {
        $m = $pv[$pv.Count - 1].Groups[1].Value + '/' + $md[$md.Count - 1].Groups[1].Value
        Set-Content -Path $f -Value $m -Encoding Ascii
        return $m
      }
    }
  } catch {}
  return ''
}

function Git-Out([string[]]$GitArgs) {
  $o = & git @GitArgs 2>$null
  return (($o | Out-String).Trim())
}

function Cur-Branch { return (Git-Out @('rev-parse', '--abbrev-ref', 'HEAD')) }

function Ahead([string]$B) {
  $n = Git-Out @('rev-list', '--count', ('main..' + $B))
  if ($n -match '^\d+$') { return [int]$n }
  return 0
}

function Branch-Exists([string]$B) {
  & git rev-parse --verify --quiet ('refs/heads/' + $B) 2>$null | Out-Null
  return ($LASTEXITCODE -eq 0)
}

function Commit-All([string]$Msg) {
  $st = Git-Out @('status', '--porcelain')
  if ($st) {
    & git add -A 2>$null | Out-Null
    & git commit -q -m $Msg 2>$null | Out-Null
    Log ('git commit: ' + $Msg)
  }
}

function Ensure-Branch([string]$B) {
  $cur = Cur-Branch
  if ($cur -eq $B) { return $true }
  Commit-All ('chore: auto-runner snapshot on ' + $cur)
  if (Branch-Exists $B) { & git checkout -q $B 2>$null | Out-Null }
  else { & git checkout -q -b $B main 2>$null | Out-Null }
  return ((Cur-Branch) -eq $B)
}

function Track-OwnPids([datetime]$Since) {
  try {
    Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -like 'opencode*' } | ForEach-Object {
      $st = $null
      try { $st = $_.StartTime } catch {}
      if ($st -and ($st -ge $Since) -and ($script:OwnPids -notcontains $_.Id)) { $script:OwnPids += $_.Id }
    }
  } catch {}
}

function Run-Cmd([string]$CmdLine, [string]$LogFile, [int]$TimeoutMin) {
  try { [System.IO.File]::AppendAllText($LogFile, ('===== ' + $CmdLine + '  [' + (Get-Date -Format s) + '] =====' + "`r`n")) } catch {}
  $argLine = '/d /s /c "' + $CmdLine + ' >> "' + $LogFile + '" 2>&1"'
  try {
    $p = Start-Process -FilePath $env:ComSpec -ArgumentList $argLine -WorkingDirectory $Root -NoNewWindow -PassThru -RedirectStandardInput $EmptyIn
  } catch {
    Log ('Loi chay lenh: ' + $CmdLine + ' - ' + $_.Exception.Message)
    return -1
  }
  $null = $p.Handle
  $deadline = (Get-Date).AddMinutes($TimeoutMin)
  while (-not $p.WaitForExit(30000)) {
    Stay-Awake
    Heartbeat ('dang chay: ' + $CmdLine)
    if ((Get-Date) -gt $deadline) {
      & taskkill.exe /PID $p.Id /T /F 2>$null | Out-Null
      Log ('Het gio: ' + $CmdLine)
      return 124
    }
  }
  $p.WaitForExit()
  return $p.ExitCode
}

function Run-OpenCode([string]$Prompt, [string]$Title, [string]$LogBase, [int]$TimeoutMin) {
  $argLine = 'run' + $script:AutoFlag
  if ($script:ModelId) { $argLine += ' -m ' + $script:ModelId }
  $argLine += ' --title "' + $Title + '" "' + $Prompt + '"'
  $out = $LogBase + '.out.log'
  $err = $LogBase + '.err.log'
  try { [System.IO.File]::WriteAllText(($LogBase + '.prompt.txt'), $Prompt) } catch {}
  Log ('OpenCode bat dau: ' + $Title + ' (gioi han ' + $TimeoutMin + ' phut)')
  $since = (Get-Date).AddSeconds(-5)
  try {
    $p = Start-Process -FilePath $script:OC -ArgumentList $argLine -WorkingDirectory $Root -NoNewWindow -PassThru -RedirectStandardOutput $out -RedirectStandardError $err -RedirectStandardInput $EmptyIn
  } catch {
    Log ('Khong chay duoc OpenCode: ' + $_.Exception.Message)
    return -1
  }
  $null = $p.Handle
  $deadline = (Get-Date).AddMinutes($TimeoutMin)
  $first = $true
  while (-not $p.WaitForExit(60000)) {
    Stay-Awake
    if ($first) { Track-OwnPids $since; $first = $false }
    Heartbeat $Title
    if ((Get-Date) -gt $deadline) {
      Log ('Qua ' + $TimeoutMin + ' phut - dung OpenCode.')
      & taskkill.exe /PID $p.Id /T /F 2>$null | Out-Null
      return 124
    }
  }
  $p.WaitForExit()
  Track-OwnPids $since
  Log ('OpenCode ket thuc: ' + $Title + ' - exit ' + $p.ExitCode)
  return $p.ExitCode
}

# Newest change in the project made by anyone (the runner's own bookkeeping files are ignored).
function Newest-Change {
  $newest = [datetime]::MinValue
  foreach ($sub in @('src', 'tests', 'qa', 'public', 'docs', '.ai')) {
    $p = Join-Path $Root $sub
    if (-not (Test-Path $p)) { continue }
    $f = Get-ChildItem -Path $p -Recurse -File -ErrorAction SilentlyContinue |
      Where-Object { ($_.FullName -notlike '*docs?opencode*') -or ($_.FullName -like '*docs?opencode?reports*') } |
      Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($f -and $f.LastWriteTime -gt $newest) { $newest = $f.LastWriteTime }
  }
  foreach ($rel in @('index.html', 'package.json', '.git\HEAD', '.git\logs\HEAD')) {
    $p = Join-Path $Root $rel
    if (Test-Path $p) {
      $w = (Get-Item $p).LastWriteTime
      if ($w -gt $newest) { $newest = $w }
    }
  }
  return $newest
}

# Never work in parallel with a person: if another OpenCode is open and the project changed
# (not by this runner) less than $QuietMin minutes ago, wait.
function Wait-UserSession {
  if ($NoWait) { return }
  while ($true) {
    $ext = @(Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -like 'opencode*' -and ($script:OwnPids -notcontains $_.Id) })
    if ($ext.Count -eq 0) { return }
    $newest = Newest-Change
    if ($newest -le $script:LastOwnActivity.AddMinutes(2)) { return }
    $q = ((Get-Date) - $newest).TotalMinutes
    if ($q -ge $QuietMin) { return }
    $script:Phase = 'CHO PHIEN OPENCODE CUA BAN RANH'
    Heartbeat ('cho phien OpenCode khac ranh: repo yen ' + [int]$q + '/' + $QuietMin + ' phut')
    Start-Sleep -Seconds 60
    if (Test-Path $StopFile) { return }
  }
}

function Load-Queue {
  $list = @()
  $files = @(Get-ChildItem -Path $QueueDir -Filter '*.md' -File -ErrorAction SilentlyContinue | Sort-Object Name)
  foreach ($f in $files) {
    if ($f.Name -match '^\d+_([A-Za-z0-9]+)_') {
      $list += [pscustomobject]@{ Id = $Matches[1]; File = $f.Name; Path = $f.FullName; Blocked = $false }
    }
  }
  $script:Tasks = $list
}

function Next-Task {
  foreach ($t in $script:Tasks) {
    if (Test-Path (Join-Path $StateDir ($t.Id + '.done'))) { continue }
    $bf = Join-Path $StateDir ($t.Id + '.blocked')
    $rf = Join-Path $StateDir ($t.Id + '.retry')
    if (Test-Path $bf) {
      $retry = (Test-Path $rf)
      if (-not $retry) { $retry = ((Get-Item $t.Path).LastWriteTime -gt (Get-Item $bf).LastWriteTime) }
      if ($retry) {
        Remove-Item -Path $bf -Force -ErrorAction SilentlyContinue
        Remove-Item -Path $rf -Force -ErrorAction SilentlyContinue
        Log ($t.Id + ': thu lai')
        return $t
      }
      return [pscustomobject]@{ Id = $t.Id; File = $t.File; Path = $t.Path; Blocked = $true }
    }
    return $t
  }
  return $null
}

function Prompt-Implement([string]$Id, [string]$File, [string]$B, [bool]$Continue) {
  $p = 'You are running UNATTENDED inside the Kho Bau auto-runner on Windows: nobody will answer questions, so decide by yourself and write your decisions in the report. '
  $p += '1) Read docs/opencode/00_RULES.md, docs/opencode/README.md and the task file docs/opencode/queue/' + $File + ' (task ' + $Id + '). If the task file names an original spec (docs/opencode/Txx_*.md), read it too - the task file wins where they differ. '
  $p += '2) Fully implement task ' + $Id + ' - real source code and content changes, not just a plan. Some of the work may already exist from an earlier session: check git log and the code first, do not duplicate it, finish what is missing. '
  if ($Continue) { $p += 'An earlier run of this task was interrupted and part of it is already committed on this branch - check git diff main first. ' }
  $p += '3) Git: you are already on branch ' + $B + '. Do not create, switch, merge, rebase, stash or push branches; just commit your work on this branch. '
  $p += '4) Before finishing, npm run typecheck, npm test and npm run build must all pass; fix every failure. '
  $p += '5) Write docs/opencode/reports/' + $Id + '_REPORT.md as the rules require and commit everything. '
  $p += '6) If part of the task is impossible, do the closest safe alternative and explain it in the report instead of stopping. '
  $p += 'Never edit docs/opencode/queue, docs/opencode/state, docs/opencode/logs or docs/opencode/TRANG_THAI.md.'
  return $p
}

function Prompt-Fix([string]$Id, [string]$File, [string]$B, [string]$Failed) {
  $p = 'You are running UNATTENDED inside the Kho Bau auto-runner on Windows: nobody will answer questions. '
  $p += 'Task ' + $Id + ' (docs/opencode/queue/' + $File + ') was implemented on the current branch ' + $B + ', but the automatic check failed for: ' + $Failed + '. '
  $p += 'Read docs/opencode/logs/' + $Id + '_FAIL.txt first - it contains the end of the failing output. '
  $p += 'Fix the root causes in the code or content. Do not delete, skip or weaken existing tests just to make them pass (docs/opencode/00_RULES.md lists the only allowed test changes), and never add code that resets saved progress. '
  $p += 'Stay on branch ' + $B + ': do not create, switch, merge, stash or push branches. '
  $p += 'Re-run npm run typecheck, npm test and npm run build until all three pass, commit the fixes, and add a short section named Auto-fix to docs/opencode/reports/' + $Id + '_REPORT.md (create the report if it is missing).'
  return $p
}

function Verify-Task([string]$Id, [int]$Round) {
  $steps = @(
    @{ Name = 'typecheck'; Cmd = 'npm run typecheck'; Min = 20 },
    @{ Name = 'test';      Cmd = 'npm test';          Min = 45 },
    @{ Name = 'build';     Cmd = 'npm run build';     Min = 20 }
  )
  [string[]]$failed = @()
  [string[]]$summary = @()
  foreach ($s in $steps) {
    Heartbeat ('kiem tra ' + $s.Name)
    $lf = Join-Path $LogDir ($Id + '_verify' + $Round + '_' + $s.Name + '.log')
    if (Test-Path $lf) { Remove-Item -Path $lf -Force -ErrorAction SilentlyContinue }
    $code = Run-Cmd $s.Cmd $lf $s.Min
    Log ('  ' + $s.Cmd + ' -> exit ' + $code)
    if ($code -ne 0) {
      $failed += $s.Name
      $summary += ('===== ' + $s.Cmd + ' (exit ' + $code + ') - last 150 lines =====')
      $summary += @(Get-Content -Path $lf -Tail 150 -Encoding UTF8 -ErrorAction SilentlyContinue)
      $summary += ''
    }
  }
  if ($failed.Count -gt 0) {
    try { Set-Content -Path (Join-Path $LogDir ($Id + '_FAIL.txt')) -Value $summary -Encoding UTF8 } catch {}
  }
  return ,$failed
}

function Merge-Task([string]$B, [string]$Id) {
  Commit-All ('chore(' + $Id + '): luu truoc khi merge (auto-runner)')
  & git checkout -q main 2>$null | Out-Null
  if ((Cur-Branch) -ne 'main') { return $false }
  & git merge-base --is-ancestor $B main 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { return $true }
  $lf = Join-Path $LogDir ($Id + '_merge.log')
  $code = Run-Cmd ('git merge --no-ff --no-edit ' + $B) $lf 5
  if ($code -ne 0) {
    Run-Cmd 'git merge --abort' $lf 2 | Out-Null
    & git checkout -q $B 2>$null | Out-Null
    return $false
  }
  return $true
}

function Process-Task($T) {
  $id = $T.Id
  $file = $T.File
  $b = 'p42/' + $id
  $script:Current = $id
  $script:TaskStart = Get-Date
  $report = Join-Path $RepDir ($id + '_REPORT.md')
  Set-Result $id 'dang chay'
  if (-not (Ensure-Branch $b)) { Set-Result $id 'LOI: khong tao/chuyen duoc sang nhanh git'; return $false }

  # 1) implement (resume-aware: a task counts as implemented once its report exists)
  $attempt = 0
  while ((-not (Test-Path $report)) -and $attempt -lt 3) {
    $attempt++
    $cont = ((Ahead $b) -gt 0)
    Set-Result $id ('OpenCode dang lam (lan ' + $attempt + ')')
    [void](Run-OpenCode (Prompt-Implement $id $file $b $cont) ('Auto ' + $id + ' lan ' + $attempt) (Join-Path $LogDir ($id + '_run' + $attempt)) $TaskTimeoutMin)
    if ((Cur-Branch) -ne $b) { Log ('Canh bao: dang o nhanh ' + (Cur-Branch) + ', chuyen ve ' + $b); [void](Ensure-Branch $b) }
    Commit-All ('chore(' + $id + '): luu thay doi con lai (auto-runner)')
    if ((-not (Test-Path $report)) -and ((Ahead $b) -eq 0) -and $attempt -ge 2) { break }
  }
  Commit-All ('chore(' + $id + '): luu thay doi con lai (auto-runner)')
  if ((-not (Test-Path $report)) -and ((Ahead $b) -eq 0)) {
    Set-Result $id ('LOI: OpenCode khong tao ra thay doi nao - xem logs/' + $id + '_run*.err.log')
    return $false
  }

  # 2) verify + automatic fix rounds
  $fails = Verify-Task $id 0
  $fix = 0
  while ($fails.Count -gt 0 -and $fix -lt $MaxFixAttempts) {
    $fix++
    Set-Result $id ('dang tu sua loi lan ' + $fix + ': ' + ($fails -join ', '))
    [void](Run-OpenCode (Prompt-Fix $id $file $b ($fails -join ', ')) ('Auto ' + $id + ' sua loi ' + $fix) (Join-Path $LogDir ($id + '_fix' + $fix)) $FixTimeoutMin)
    if ((Cur-Branch) -ne $b) { [void](Ensure-Branch $b) }
    Commit-All ('fix(' + $id + '): auto-runner fix round ' + $fix)
    $fails = Verify-Task $id $fix
  }
  if ($fails.Count -gt 0) {
    Set-Result $id ('LOI: van hong ' + ($fails -join ', ') + ' sau ' + $MaxFixAttempts + ' lan tu sua - xem logs/' + $id + '_FAIL.txt')
    return $false
  }

  # 3) merge into local main
  if (-not (Merge-Task $b $id)) {
    Set-Result $id ('LOI: merge vao main that bai - xem logs/' + $id + '_merge.log')
    return $false
  }
  $mins = [int]((Get-Date) - $script:TaskStart).TotalMinutes
  Set-Content -Path (Join-Path $StateDir ($id + '.done')) -Value (Get-Date -Format s) -Encoding Ascii
  $extra = ''
  if (-not (Test-Path $report)) { $extra = ', THIEU bao cao' }
  Set-Result $id ('XONG - typecheck/test/build OK, da merge vao main (' + $mins + ' phut' + $extra + ')')
  return $true
}

# ---------------------------------------------------------------- main

Disable-QuickEdit
if (-not (Acquire-Lock)) {
  Write-Host 'Auto Runner dang chay o mot cua so khac - khong mo them. Xem docs\opencode\TRANG_THAI.md'
  Start-Sleep -Seconds 5
  exit 0
}
Remove-Item -Path $StopFile -Force -ErrorAction SilentlyContinue

# Clean environment: nothing inherited from git hooks, children marked as runner-owned.
Get-ChildItem Env: | Where-Object { $_.Name -like 'GIT_*' } | ForEach-Object { Remove-Item -Path ('Env:' + $_.Name) -ErrorAction SilentlyContinue }
$env:P42_RUNNER = '1'
$env:OPENCODE_DISABLE_AUTOUPDATE = '1'

$failedHard = $false
try {
  Log '===== Kho Bau Auto Runner v2 khoi dong ====='
  Install-Autostart
  Load-Queue
  Write-Status
  $script:OC = Find-OpenCode
  if (-not $script:OC) {
    $script:Phase = 'LOI: khong tim thay lenh opencode tren may nay'
    $failedHard = $true
    Log $script:Phase
  }
  else {
    Log ('OpenCode: ' + $script:OC)
    Detect-Capabilities
    # one-time cleanup of audit leftovers (the archive was committed by mistake in T01)
    & git ls-files --error-unmatch '.audit_src.tgz' 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { & git rm -q --cached '.audit_src.tgz' 2>$null | Out-Null; Log 'Da bo .audit_src.tgz khoi git' }
    foreach ($junk in @('.audit_src.tgz', 'docs\opencode\state\kb_now.tgz', 'docs\opencode\state\run-all.v2.ps1')) {
      Remove-Item -Path (Join-Path $Root $junk) -Force -ErrorAction SilentlyContinue
    }
    while ($true) {
      if (Test-Path $StopFile) { $script:Phase = 'DA DUNG THEO YEU CAU'; break }
      Load-Queue
      $t = Next-Task
      if (-not $t) {
        $script:Phase = 'XONG HET HANG DOI - DANG CHO VIEC MOI'
        $script:Current = '-'
        $script:Note = ''
        Allow-Sleep
        Write-Status
        if ($Once) { break }
        Start-Sleep -Seconds $IdlePollSec
        continue
      }
      if ($t.Blocked) {
        $script:Phase = ('TAM DUNG: ' + $t.Id + ' bi loi - sua file task hoac tao state/' + $t.Id + '.retry de chay lai')
        $script:Current = $t.Id
        $script:Note = ''
        Allow-Sleep
        Write-Status
        if ($Once) { break }
        Start-Sleep -Seconds $IdlePollSec
        continue
      }
      Wait-UserSession
      if (Test-Path $StopFile) { continue }
      $script:ModelId = Detect-Model
      $script:Phase = 'DANG CHAY'
      Stay-Awake
      $ok = Process-Task $t
      if (-not $ok) { Set-Content -Path (Join-Path $StateDir ($t.Id + '.blocked')) -Value (Get-Date -Format s) -Encoding Ascii }
      $script:LastOwnActivity = Get-Date
      $script:Note = ''
      Allow-Sleep
    }
  }
}
catch {
  Log ('Loi khong mong doi: ' + $_.Exception.Message)
  $failedHard = $true
  $script:Phase = 'LOI KHONG MONG DOI - xem docs/opencode/logs/runner.log'
}
finally {
  $script:Note = ''
  Write-Status
  Allow-Sleep
  Remove-Item -Path $LockFile -Force -ErrorAction SilentlyContinue
  Log ('===== Ket thuc: ' + $script:Phase + ' =====')
}

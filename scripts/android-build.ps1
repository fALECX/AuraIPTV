$ErrorActionPreference = 'Stop'

$workspace = Split-Path -Parent $PSScriptRoot
$sdkCandidates = @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    (Join-Path $env:LOCALAPPDATA 'Android\Sdk')
) | Where-Object { $_ -and (Test-Path (Join-Path $_ 'platforms\android-36')) }

$javaCandidates = @(
    $env:JAVA_HOME
)
$portableJdks = Get-ChildItem (Join-Path $env:LOCALAPPDATA 'AuraIPTV\devtools\jdk21') -Directory -ErrorAction SilentlyContinue
$javaCandidates += $portableJdks.FullName
$javaCandidates += 'C:\Program Files\Android\Android Studio\jbr'
$javaCandidates += 'C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.0.1\jbr'

$sdkRoot = $sdkCandidates | Select-Object -First 1
$javaHome = $javaCandidates | Where-Object { $_ -and (Test-Path (Join-Path $_ 'bin\jlink.exe')) } | Select-Object -First 1

if (-not $sdkRoot) {
    throw 'Android SDK Platform 36 was not found. Install it with Android Studio or sdkmanager.'
}
if (-not $javaHome) {
    throw 'A full JDK 21 with jlink was not found. Set JAVA_HOME to a JDK 21 installation.'
}

$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:JAVA_HOME = $javaHome
$env:Path = "$(Join-Path $javaHome 'bin');$(Join-Path $sdkRoot 'platform-tools');$env:Path"

Push-Location (Join-Path $workspace 'android')
try {
    & .\gradlew.bat :app:testDebugUnitTest :app:lintDebug :app:assembleDebugAndroidTest assembleDebug --no-daemon
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}

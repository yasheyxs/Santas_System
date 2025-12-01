[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$PrinterName,

    [Parameter(Mandatory = $true, Position = 1)]
    [string]$FilePath
)

# Verificar si el archivo existe
if (-not (Test-Path -Path $FilePath -PathType Leaf)) {
    Write-Error "El archivo no existe: $FilePath"
    exit 1
}

# Resolver la ruta absoluta del archivo
$resolvedPath = (Resolve-Path -Path $FilePath).Path

# Preparar los argumentos para el comando print
$cmdArgs = @(
    '/c',
    'print',
    "/D:$PrinterName",
    "$resolvedPath"
)

# Iniciar el proceso de impresión usando cmd.exe
$process = Start-Process -FilePath 'cmd.exe' -ArgumentList $cmdArgs -NoNewWindow -Wait -PassThru

# Comprobar el código de salida del proceso
if ($process.ExitCode -ne 0) {
    Write-Error "La impresión falló con código de salida $($process.ExitCode)"
}

exit $process.ExitCode

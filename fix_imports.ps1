$files = Get-ChildItem -Path "src\app" -Recurse -Include "*.tsx", "*.ts"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace '(\.\./)+src/', '@/'
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated $($file.Name)"
    }
}

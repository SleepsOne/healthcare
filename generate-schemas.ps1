# generate-schemas.ps1

# danh sách services theo docker-compose
$services = @(
  'user-service',
  'patient-service',
  'appointment-service',
  'doctor-service',
  'prescription-service',
  'pharmacy-service'
)

# 1. Khởi động các container
Write-Host "🛠  Bật tất cả service..."
docker-compose up -d | Out-Null
Start-Sleep -Seconds 5

# 2. Tạo thư mục docs nếu chưa có
$docsDir = ".\docs"
if (-not (Test-Path $docsDir)) {
    Write-Host "→ Tạo thư mục $docsDir" -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $docsDir | Out-Null
}

# 3. Sinh schema cho từng service
foreach ($svc in $services) {
    $short = $svc -replace '-service',''  # ví dụ: user
    $schemaFile = "$short.yml"
    $outPath = Join-Path $docsDir $schemaFile

    Write-Host "→ Sinh schema cho $svc..." -ForegroundColor Cyan

    # Chạy trong container, pipe stdout về host file
    docker-compose exec -T $svc sh -c "python manage.py spectacular --format openapi" |
      Out-File -FilePath $outPath -Encoding utf8

    if (Test-Path $outPath) {
        Write-Host "  → Lưu thành docs\$schemaFile" -ForegroundColor Green
    } else {
        Write-Host "  [!] Không tạo được $outPath" -ForegroundColor Yellow
    }
}

# 4. Bundling tất cả schema vào một file duy nhất
Write-Host "→ Bundling tất cả vào docs/all-services.yaml..." -ForegroundColor Cyan
# Cài đặt nếu chưa có: npm install -g @apidevtools/swagger-cli

# Lấy danh sách tất cả .yml trừ all-services.yaml
$inputFiles = Get-ChildItem -Path $docsDir -Filter "*.yml" |
    Where-Object { $_.Name -ne 'all-services.yaml' } |
    ForEach-Object { $_.FullName }

# Chuẩn bị và gọi swagger-cli bundle
$args = @('bundle') + $inputFiles + @('-o', (Join-Path $docsDir 'all-services.yaml'), '--type', 'yaml')
& swagger-cli @args | Write-Host

# Kiểm tra kết quả
$bundlePath = Join-Path $docsDir 'all-services.yaml'
if (Test-Path $bundlePath) {
    Write-Host "✅ Tạo thành công $bundlePath" -ForegroundColor Green
} else {
    Write-Host "❌ Bundling thất bại." -ForegroundColor Red
}

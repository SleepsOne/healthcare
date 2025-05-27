#!/usr/bin/env bash
set -euo pipefail

# Danh sách service key giống tên docker-compose:
services=(user patient appointment doctor notification prescription pharmacy)

# Đảm bảo có thư mục docs/
mkdir -p docs

for svc in "${services[@]}"; do
  echo "→ Generating schema for ${svc}-service"
  # Chạy lệnh spectacular, xuất YAML vào /app/docs
  docker-compose exec -T "${svc}-service" \
    python manage.py spectacular \
      --format yaml \
      --file /app/docs/openapi.yml
  # Copy từ container ra host (nếu không mount)
  # docker cp "${svc}-service":/app/docs/openapi.yml ./docs/${svc}.yml
  mv docs/${svc}/openapi.yml docs/${svc}.yml
done

echo "✅ All schemas generated in docs/*.yml"

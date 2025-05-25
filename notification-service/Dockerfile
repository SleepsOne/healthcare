FROM python:3.9-slim
WORKDIR /app

RUN apt-get update \
    && apt-get install -y netcat-openbsd gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port nếu bạn có API (ví dụ 8004)
EXPOSE 8004

ENTRYPOINT ["/app/entrypoint.sh"]

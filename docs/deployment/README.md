# Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Scaling & Load Balancing](#scaling--load-balancing)
5. [Environment Variables](#environment-variables)

## Prerequisites

- Node.js 18+ and npm 9+
- Python 3.9+
- Docker 20.10+
- Redis 6.2+
- WebGPU-compatible browser/device

## Local Development

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/hyperfocus-gift-engine.git
cd hyperfocus-gift-engine

# Set up Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Start WebSocket server
python src/backend/websocket_server.py
```

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

## Production Deployment

### Docker Deployment

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose logs -f
```

### Cloud Providers

#### AWS (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init

# Create and deploy environment
eb create production
```

#### Google Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy hyperfocus-gift-engine \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Scaling & Load Balancing

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
services:
  websocket:
    image: hyperfocus/websocket-server:latest
    deploy:
      replicas: 4
      resources:
        limits:
          cpus: '1'
          memory: 2G
```

### Load Balancer Configuration

```nginx
# nginx.conf
upstream websocket {
    server websocket1:8000;
    server websocket2:8000;
    
    # Enable sticky sessions
    ip_hash;
}

server {
    listen 80;
    
    location /ws {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `8000` | Port for WebSocket server |
| `REDIS_URL` | Yes | - | Redis connection string |
| `NODE_ENV` | No | `development` | Runtime environment |
| `TIKTOK_API_KEY` | Yes | - | TikTok API credentials |
| `SENTRY_DSN` | No | - | Sentry DSN for error tracking |

## Monitoring

### Prometheus Metrics

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'hyperfocus_metrics'
    static_configs:
      - targets: ['websocket:9090']
```

### Logging

```bash
# View logs with log levels
docker-compose logs -f --tail=100 websocket | grep -E 'ERROR|WARN|INFO'
```

## Backup & Recovery

### Database Backup

```bash
# Create daily backup
0 3 * * * pg_dump -U postgres hyperfocus > /backups/hyperfocus_$(date +%Y%m%d).sql
```

### Disaster Recovery

1. Restore latest database backup
2. Deploy latest container images
3. Verify service health
4. Monitor for any issues

## Security

### SSL Configuration

```nginx
# nginx-ssl.conf
server {
    listen 443 ssl http2;
    server_name api.hyperfocus.gg;
    
    ssl_certificate /etc/letsencrypt/live/api.hyperfocus.gg/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.hyperfocus.gg/privkey.pem;
    
    # SSL configuration...
}
```

### Rate Limiting

```python
# FastAPI middleware
from fastapi import FastAPI, Request
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["hyperfocus.gg", "api.hyperfocus.gg"]
)
```

## Maintenance

### Version Upgrades

1. Check for breaking changes in release notes
2. Test in staging environment
3. Schedule maintenance window
4. Deploy updates
5. Monitor for issues

### Performance Tuning

- Enable WebSocket compression
- Optimize database queries
- Implement caching strategies
- Monitor and adjust resource allocations

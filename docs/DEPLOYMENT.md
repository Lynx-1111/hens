# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Git
- Linux server (Ubuntu 20.04+)

## Steps

### 1. Clone Repository
```bash
git clone https://github.com/Lynx-1111/hens.git
cd hens
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env dengan production values
```

### 3. Build Images
```bash
docker-compose build
```

### 4. Deploy
```bash
docker-compose up -d
```

### 5. Verify
```bash
curl http://localhost:5000/api/health
```

## Production Checklist
- [ ] Change JWT_SECRET
- [ ] Setup MongoDB backups
- [ ] Enable SSL/TLS
- [ ] Setup monitoring
- [ ] Configure firewall
- [ ] Setup CI/CD pipeline

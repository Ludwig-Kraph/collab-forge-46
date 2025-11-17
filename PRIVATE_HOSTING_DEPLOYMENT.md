# M-Leja Private Hosting Deployment Guide

This guide provides detailed instructions for deploying M-Leja on your own private hosting infrastructure while maintaining connection to the existing Supabase backend.

## Prerequisites

- Node.js 18+ and npm installed
- Git installed
- Access to your Supabase project dashboard
- Web server (Nginx, Apache, or similar)
- SSL certificate for HTTPS (recommended: Let's Encrypt)
- Domain name or server IP address

## Table of Contents

1. [Server Requirements](#server-requirements)
2. [Clone and Setup](#clone-and-setup)
3. [Environment Configuration](#environment-configuration)
4. [Build Application](#build-application)
5. [Web Server Configuration](#web-server-configuration)
6. [SSL Certificate Setup](#ssl-certificate-setup)
7. [Deployment](#deployment)
8. [Post-Deployment](#post-deployment)
9. [Troubleshooting](#troubleshooting)

---

## 1. Server Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 2GB
- **Storage**: 10GB SSD
- **OS**: Ubuntu 20.04 LTS or later (recommended)

### Recommended Requirements
- **CPU**: 4 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 22.04 LTS

---

## 2. Clone and Setup

### Step 1: Connect to Your Server
```bash
ssh user@your-server-ip
```

### Step 2: Install Node.js
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Clone the Repository
```bash
# Navigate to your web directory
cd /var/www

# Clone from GitHub (replace with your repository URL)
sudo git clone https://github.com/your-username/m-leja.git
cd m-leja

# Set proper permissions
sudo chown -R $USER:$USER /var/www/m-leja
```

---

## 3. Environment Configuration

### Step 1: Verify Supabase Connection Details

Your application is pre-configured to connect to the existing Supabase project:

- **Project ID**: `cfuolhkzxsxfovalswhp`
- **Supabase URL**: `https://cfuolhkzxsxfovalswhp.supabase.co`
- **Anon Key**: Already configured in the codebase

These values are hardcoded in:
- `src/integrations/supabase/client.ts`
- `.env` file

### Step 2: Verify Configuration Files

Check that these files contain correct Supabase credentials:

**`.env` file:**
```bash
VITE_SUPABASE_PROJECT_ID="cfuolhkzxsxfovalswhp"
VITE_SUPABASE_URL="https://cfuolhkzxsxfovalswhp.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdW9saGt6eHN4Zm92YWxzd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ5MDUsImV4cCI6MjA3NzgxMDkwNX0.d8LjLPuVyHW8JkvQX17zcpQDQ0VhpbHXXExGI3jGmMo"
```

**`src/integrations/supabase/client.ts`:**
```typescript
const SUPABASE_URL = "https://cfuolhkzxsxfovalswhp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdW9saGt6eHN4Zm92YWxzd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ5MDUsImV4cCI6MjA3NzgxMDkwNX0.d8LjLPuVyHW8JkvQX17zcpQDQ0VhpbHXXExGI3jGmMo";
```

> **Note**: These credentials are public-facing and safe to expose. Service role keys are only used in Supabase Edge Functions.

---

## 4. Build Application

### Step 1: Install Dependencies
```bash
cd /var/www/m-leja
npm install
```

### Step 2: Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Step 3: Verify Build
```bash
ls -la dist/
# You should see index.html, assets/, and other static files
```

---

## 5. Web Server Configuration

### Option A: Nginx (Recommended)

#### Step 1: Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

#### Step 2: Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/m-leja
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    root /var/www/m-leja/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle API requests (if needed)
    location /api/ {
        proxy_pass https://cfuolhkzxsxfovalswhp.supabase.co/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 3: Enable Configuration
```bash
sudo ln -s /etc/nginx/sites-available/m-leja /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option B: Apache

#### Step 1: Install Apache
```bash
sudo apt update
sudo apt install apache2
```

#### Step 2: Enable Required Modules
```bash
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate
```

#### Step 3: Create Apache Configuration
```bash
sudo nano /etc/apache2/sites-available/m-leja.conf
```

Add the following:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com
    DocumentRoot /var/www/m-leja/dist

    <Directory /var/www/m-leja/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    ErrorLog ${APACHE_LOG_DIR}/m-leja-error.log
    CustomLog ${APACHE_LOG_DIR}/m-leja-access.log combined
</VirtualHost>
```

#### Step 4: Enable Site
```bash
sudo a2ensite m-leja
sudo systemctl restart apache2
```

---

## 6. SSL Certificate Setup

### Using Let's Encrypt (Free SSL)

#### Step 1: Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx  # For Nginx
# OR
sudo apt install certbot python3-certbot-apache  # For Apache
```

#### Step 2: Obtain Certificate
```bash
# For Nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# For Apache
sudo certbot --apache -d your-domain.com -d www.your-domain.com
```

#### Step 3: Auto-Renewal Setup
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up auto-renewal via systemd timer
sudo systemctl status certbot.timer
```

---

## 7. Deployment

### Initial Deployment
```bash
cd /var/www/m-leja
npm install
npm run build
sudo systemctl restart nginx  # or apache2
```

### Update Deployment Script

Create a deployment script for easy updates:

```bash
sudo nano /usr/local/bin/deploy-m-leja
```

Add:

```bash
#!/bin/bash
set -e

echo "🚀 Starting M-Leja deployment..."

cd /var/www/m-leja

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "♻️  Restarting web server..."
sudo systemctl restart nginx

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://your-domain.com"
```

Make it executable:
```bash
sudo chmod +x /usr/local/bin/deploy-m-leja
```

Usage:
```bash
sudo deploy-m-leja
```

---

## 8. Post-Deployment

### Step 1: Test Application
Visit your domain: `https://your-domain.com`

### Step 2: Verify Supabase Connection

Run the connectivity check:
```bash
# From the project root
npm run check-supabase
```

Or use the web-based checker at: `https://your-domain.com/check-connection`

### Step 3: Configure Firewall
```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'  # For Nginx
# OR
sudo ufw allow 'Apache Full'  # For Apache

sudo ufw enable
sudo ufw status
```

### Step 4: Set Up Monitoring

#### Basic Server Monitoring
```bash
# Install htop for server monitoring
sudo apt install htop

# Check resource usage
htop
```

#### Application Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Apache logs
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log
```

### Step 5: Set Up Automated Backups

Create backup script:
```bash
sudo nano /usr/local/bin/backup-m-leja
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/backups/m-leja"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/m-leja-$DATE.tar.gz /var/www/m-leja

# Keep only last 7 backups
ls -t $BACKUP_DIR/*.tar.gz | tail -n +8 | xargs rm -f

echo "Backup created: m-leja-$DATE.tar.gz"
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/backup-m-leja

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-m-leja
```

---

## 9. Troubleshooting

### Application Won't Start

**Check build output:**
```bash
cd /var/www/m-leja
npm run build
```

**Check file permissions:**
```bash
sudo chown -R www-data:www-data /var/www/m-leja/dist
sudo chmod -R 755 /var/www/m-leja/dist
```

### Supabase Connection Issues

**Test connection:**
```bash
curl https://cfuolhkzxsxfovalswhp.supabase.co/rest/v1/
```

**Check browser console** for CORS or network errors

**Verify API keys** in `src/integrations/supabase/client.ts`

### SSL Certificate Issues

**Check certificate status:**
```bash
sudo certbot certificates
```

**Force renewal:**
```bash
sudo certbot renew --force-renewal
```

### Performance Issues

**Enable Nginx caching:**
```nginx
# Add to nginx config
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
```

**Monitor server resources:**
```bash
htop
df -h
free -m
```

### 502 Bad Gateway

**Check web server status:**
```bash
sudo systemctl status nginx
# or
sudo systemctl status apache2
```

**Check error logs:**
```bash
sudo tail -100 /var/log/nginx/error.log
```

---

## Security Best Practices

1. **Keep System Updated**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

2. **Use Firewall**
   ```bash
   sudo ufw enable
   sudo ufw status
   ```

3. **Regular Backups**
   - Automated daily backups
   - Test restoration process

4. **Monitor Logs**
   - Review access and error logs regularly
   - Set up log rotation

5. **Secure SSH**
   ```bash
   # Disable root login
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   sudo systemctl restart sshd
   ```

---

## Support and Maintenance

### Update Checklist
- [ ] Backup current deployment
- [ ] Pull latest changes
- [ ] Install dependencies
- [ ] Run build
- [ ] Test on staging (if available)
- [ ] Deploy to production
- [ ] Verify functionality
- [ ] Monitor logs for errors

### Emergency Rollback
```bash
cd /var/www/m-leja
git log --oneline  # Find previous commit
git checkout <commit-hash>
npm install
npm run build
sudo systemctl restart nginx
```

---

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)

---

**Last Updated**: November 2024
**Version**: 1.0.0

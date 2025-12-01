# M-Leja Self-Hosting Guide

Complete guide for deploying M-Leja on your own infrastructure with production-level configuration.

## Copyright & Licensing Notice

**© 2024 Timothy Ng'ang'a. All Rights Reserved.**

This software is proprietary. Unauthorized forking, cloning, or use of this code without proper licensing will incur a **USD $1,000,000 damage fee**.

For licensing inquiries, contact: [Nassir Group](https://nassirgroup.com)

---

## Table of Contents

1. [Platform Requirements](#platform-requirements)
2. [Supported Web Hosting Control Panels](#supported-web-hosting-control-panels)
3. [Supabase Setup (Cloud or Self-Hosted)](#supabase-setup)
4. [Installation Steps](#installation-steps)
5. [Production Configuration](#production-configuration)
6. [Web Server Configuration](#web-server-configuration)
7. [SSL/TLS Setup](#ssltls-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Platform Requirements

### Minimum Requirements
- **CPU**: 2 vCPU cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04 LTS or higher, CentOS 8+, Debian 11+
- **Node.js**: v18 or higher
- **npm**: v9 or higher

### Recommended Production Requirements
- **CPU**: 4 vCPU cores
- **RAM**: 8GB
- **Storage**: 50GB SSD with RAID 1
- **OS**: Ubuntu 22.04 LTS
- **Network**: 100Mbps+ bandwidth

---

## Supported Web Hosting Control Panels

M-Leja works with the following control panels for easy management:

### 1. **cPanel/WHM**
- **Node.js Selector**: Built-in Node.js version management
- **SSL Management**: AutoSSL with Let's Encrypt
- **Installation**: Use Application Manager or manual deployment
- **Recommended Version**: cPanel 110+

**Setup via cPanel:**
```bash
# In cPanel Terminal
cd public_html
git clone https://github.com/your-repo/m-leja.git
cd m-leja
npm install
npm run build
```

### 2. **Plesk**
- **Node.js Support**: Native Node.js hosting
- **Git Integration**: Automatic deployment from Git
- **SSL**: Let's Encrypt integration
- **Recommended Version**: Plesk Obsidian 18.0.50+

**Setup via Plesk:**
1. Go to Websites & Domains → Node.js
2. Enable Node.js (v18+)
3. Set application root to `m-leja`
4. Set application startup file to custom deployment script

### 3. **DirectAdmin**
- **Node.js**: Install via CustomBuild
- **SSL**: Let's Encrypt plugin
- **Deployment**: Manual or script-based

### 4. **Virtualmin/Webmin**
- **Node.js**: System package installation
- **Proxy**: Configure Apache/Nginx reverse proxy
- **SSL**: Certbot integration

### 5. **CyberPanel (OpenLiteSpeed)**
- **Performance**: Excellent performance with LiteSpeed
- **Node.js**: Via Node.js Selector
- **SSL**: Automatic SSL via Certbot

**Setup via CyberPanel:**
```bash
# Install Node.js via CyberPanel
# Then deploy via CLI
cd /home/username/public_html
git clone https://github.com/your-repo/m-leja.git
cd m-leja
npm install
npm run build
```

### 6. **ISPConfig**
- **Node.js**: Manual installation required
- **Reverse Proxy**: Configure Nginx/Apache
- **SSL**: Let's Encrypt integration

### Required Control Panel Features
- **Node.js v18+**: Essential for running M-Leja
- **Reverse Proxy**: Nginx or Apache with proxy modules
- **SSL Management**: Let's Encrypt or commercial SSL
- **Git Integration**: For easy updates and deployment
- **Process Manager**: PM2 or systemd for Node.js processes
- **Firewall Management**: Allow ports 80, 443, and application port

### 7. **Any WHM/WHMCS Platform**

M-Leja is compatible with ANY web hosting platform running WHM/WHMCS. The key requirement is Node.js v18+ support.

**Universal WHM Installation Steps:**
1. Access your hosting control panel (cPanel/Plesk/DirectAdmin/etc.)
2. Enable Node.js v18 or higher (via Node.js selector or package manager)
3. Upload M-Leja files to your web directory
4. Configure reverse proxy (Apache/Nginx) to route traffic to Node.js app
5. Set up SSL certificate (Let's Encrypt recommended)
6. Configure environment variables for Supabase and MPESA
7. Start application using PM2 or control panel's process manager

**For Shared Hosting Without Shell Access:**
```bash
# Build locally first
npm install
npm run build

# Upload only the 'dist' folder contents to your hosting
# Configure web server to serve static files from 'dist'
# Ensure .htaccess or nginx.conf is properly configured for SPA routing
```

**For VPS/Dedicated Servers:**
Follow the complete installation guide below with full server access.

---

## Supabase Setup

### Option 1: Supabase Cloud (Recommended for Beginners)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your Project URL and anon/public key

2. **Database Setup**
   ```bash
   # Clone repository
   git clone https://github.com/your-repo/m-leja.git
   cd m-leja
   
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your project
   supabase login
   supabase link --project-ref your-project-ref
   
   # Push migrations
   supabase db push
   ```

3. **Configure Authentication**
   - Enable Email/Phone authentication
   - Configure email templates
   - Set up redirect URLs

### Option 2: Self-Hosted Supabase (Advanced)

1. **Server Requirements**
   - **CPU**: 4 cores minimum
   - **RAM**: 8GB minimum (16GB recommended)
   - **Storage**: 100GB SSD
   - **Docker**: Latest version
   - **Docker Compose**: v2.0+

2. **Install Supabase**
   ```bash
   # Clone Supabase
   git clone --depth 1 https://github.com/supabase/supabase
   cd supabase/docker
   
   # Copy environment template
   cp .env.example .env
   
   # Edit configuration
   nano .env
   ```

3. **Configure Environment Variables**
   ```env
   # .env file
   POSTGRES_PASSWORD=your-super-secret-password
   JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters
   ANON_KEY=your-anon-key
   SERVICE_ROLE_KEY=your-service-role-key
   SITE_URL=https://yourdomain.com
   ```

4. **Start Supabase**
   ```bash
   docker compose up -d
   
   # Check status
   docker compose ps
   ```

5. **Access Supabase Studio**
   - URL: `http://your-server:3000`
   - Default user: Check logs for credentials

6. **Configure Reverse Proxy**
   ```nginx
   # Nginx configuration for Supabase
   server {
       listen 80;
       server_name supabase.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Connecting M-Leja to Self-Hosted Supabase

1. **In-App Configuration (Easy)**
   - Log in to M-Leja
   - Go to Settings → Supabase Connection
   - Toggle "Use Self-Hosted Supabase"
   - Enter your Supabase URL and Anon Key
   - Click "Test Connection" then "Save"

2. **Code Configuration (Permanent)**
   
   Edit `src/integrations/supabase/client.ts`:
   ```typescript
   const DEFAULT_SUPABASE_URL = "https://your-self-hosted-supabase.com";
   const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "your-anon-key";
   ```

---

## Installation Steps

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install build essentials
sudo apt install -y build-essential git nginx certbot python3-certbot-nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

### 2. Application Installation

```bash
# Create application directory
sudo mkdir -p /var/www/m-leja
sudo chown -R $USER:$USER /var/www/m-leja

# Clone repository
cd /var/www/m-leja
git clone https://github.com/your-repo/m-leja.git .

# Install dependencies
npm install

# Build for production
npm run build
```

### 3. Configure Application

Create `.env` file:
```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set Up Process Manager

```bash
# Start with PM2
pm2 start npm --name "m-leja" -- start

# Set PM2 to start on boot
pm2 startup
pm2 save

# Monitor application
pm2 status
pm2 logs m-leja
```

---

## Production Configuration

### Environment Variables

Create `/var/www/m-leja/.env`:
```env
# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Supabase (Cloud or Self-Hosted)
SUPABASE_URL=https://your-supabase-url.com
SUPABASE_ANON_KEY=your-anon-key

# MPESA Configuration
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_PASSKEY=your-mpesa-passkey
MPESA_SHORTCODE=your-shortcode
MPESA_ENVIRONMENT=production

# Security
SESSION_SECRET=your-random-secret-key-minimum-32-chars
JWT_SECRET=your-jwt-secret-minimum-32-chars
```

### PM2 Ecosystem File

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'm-leja',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/m-leja',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

Start with ecosystem file:
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Web Server Configuration

### Nginx (Recommended)

Create `/etc/nginx/sites-available/m-leja`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be added by Certbot)
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Logging
    access_log /var/log/nginx/m-leja-access.log;
    error_log /var/log/nginx/m-leja-error.log;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/m-leja /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Apache (Alternative)

Create `/etc/apache2/sites-available/m-leja.conf`:
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # Redirect to HTTPS
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Proxy Configuration
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # WebSocket Support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://localhost:3000/$1 [P,L]
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/m-leja-error.log
    CustomLog ${APACHE_LOG_DIR}/m-leja-access.log combined
</VirtualHost>
```

Enable site:
```bash
sudo a2enmod proxy proxy_http rewrite ssl headers
sudo a2ensite m-leja
sudo systemctl reload apache2
```

---

## SSL/TLS Setup

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test renewal
sudo certbot renew --dry-run

# Auto-renewal is set up automatically
```

### Commercial SSL

If using commercial SSL:
```bash
# Copy certificates
sudo cp yourdomain.com.crt /etc/ssl/certs/
sudo cp yourdomain.com.key /etc/ssl/private/
sudo cp ca-bundle.crt /etc/ssl/certs/

# Update Nginx configuration
# ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
# ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
```

---

## Monitoring & Maintenance

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs m-leja

# Restart application
pm2 restart m-leja

# Update application
cd /var/www/m-leja
git pull
npm install
npm run build
pm2 restart m-leja
```

### System Monitoring

Install monitoring tools:
```bash
# htop for CPU/RAM monitoring
sudo apt install htop

# netstat for network monitoring
sudo apt install net-tools

# Check disk usage
df -h
```

### Backup Strategy

Create backup script `/usr/local/bin/backup-m-leja.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/m-leja"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/m-leja-files-$DATE.tar.gz /var/www/m-leja

# Backup PM2 config
pm2 save

# Keep only last 7 days of backups
find $BACKUP_DIR -name "m-leja-files-*.tar.gz" -mtime +7 -delete
```

Make executable and schedule:
```bash
chmod +x /usr/local/bin/backup-m-leja.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-m-leja.sh
```

### Security Hardening

```bash
# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Fail2ban for SSH protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs m-leja --lines 100

# Check port availability
sudo netstat -tlnp | grep :3000

# Verify environment variables
pm2 env 0
```

### Supabase connection issues
```bash
# Test connectivity
curl -I https://your-supabase-url.com

# Check DNS resolution
nslookup your-supabase-url.com

# Verify credentials in .env file
```

### SSL certificate issues
```bash
# Test SSL configuration
sudo nginx -t

# Renew certificate manually
sudo certbot renew

# Check certificate expiry
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Support & Licensing

For production deployments, enterprise support, or licensing inquiries:

**Contact**: [Nassir Group](https://nassirgroup.com)
**Developer**: Timothy Ng'ang'a
**License**: Proprietary - Unauthorized use prohibited

---

## Updates & Maintenance

To update M-Leja:
```bash
cd /var/www/m-leja
git pull
npm install
npm run build
pm2 restart m-leja
```

For zero-downtime updates, use PM2 reload:
```bash
pm2 reload m-leja
```

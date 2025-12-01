# M-Leja Installation Guide for WHM/WHMCS Platforms

**Universal Installation Guide for ALL Web Hosting Control Panels**

M-Leja is compatible with **ANY** web hosting platform. This guide covers installation on all major hosting control panels.

---

## Supported Platforms

✅ **All WHM-Based Platforms**
- cPanel/WHM
- WHMCS
- Plesk
- DirectAdmin
- Virtualmin/Webmin
- CyberPanel (OpenLiteSpeed)
- ISPConfig
- Hosting24
- InterWorx
- Ajenti
- VestaCP
- Sentora

✅ **Shared Hosting Providers**
- GoDaddy
- Bluehost
- Hostinger
- SiteGround
- HostGator
- DreamHost
- A2 Hosting
- InMotion
- NameCheap
- 1&1 IONOS

✅ **Any Platform With:**
- File Manager OR FTP access
- Optional: Node.js support (v18+) for advanced features

---

## Quick Installation (3 Steps)

### For 95% of Hosting Platforms (Static Build)

**Step 1: Build Application Locally**
```bash
# On your local computer
git clone https://github.com/your-repo/m-leja.git
cd m-leja
npm install
npm run build
```

**Step 2: Upload to Hosting**
- Compress the `dist/` folder to `m-leja.zip`
- Log in to your hosting control panel
- Navigate to File Manager
- Go to `public_html` or `www` directory
- Upload `m-leja.zip`
- Extract the zip file
- Move all files from `dist/` folder to the root directory

**Step 3: Verify Installation**
- Visit your domain: `https://yourdomain.com`
- M-Leja should load successfully
- Login with existing account or create new account

**That's it! ✅**

---

## Platform-Specific Instructions

### cPanel/WHM

**Via File Manager:**
1. Log in to cPanel
2. Open "File Manager"
3. Navigate to `public_html`
4. Click "Upload" and upload `dist.zip`
5. Right-click `dist.zip` → "Extract"
6. Move contents of `dist/` to `public_html` root
7. Verify `.htaccess` file is present

**Via FTP:**
1. Connect via FTP (FileZilla, WinSCP)
2. Navigate to `public_html`
3. Upload all files from local `dist/` folder
4. Ensure `.htaccess` is uploaded

**Using cPanel Terminal (Advanced):**
```bash
cd ~/public_html
git clone https://github.com/your-repo/m-leja.git
cd m-leja
npm install
npm run build
# Move build files to parent directory
mv dist/* ../
cd ..
rm -rf m-leja
```

---

### Plesk

**Via Plesk File Manager:**
1. Log in to Plesk
2. Go to "Websites & Domains" → Your Domain
3. Click "File Manager"
4. Navigate to `httpdocs` or `public_html`
5. Upload and extract `dist.zip`
6. Ensure all files are in root of `httpdocs`

**Via Plesk Git Integration:**
1. Go to "Git" in Plesk
2. Add repository: `https://github.com/your-repo/m-leja.git`
3. Enable deployment
4. Add deployment script:
```bash
npm install
npm run build
mv dist/* ./
```

---

### DirectAdmin

**Via File Manager:**
1. Log in to DirectAdmin
2. Click "File Manager"
3. Navigate to `public_html`
4. Upload `dist.zip`
5. Click "Extract"
6. Move files from `dist/` to root

**Via FTP:**
Same as cPanel FTP instructions above

---

### Virtualmin/Webmin

**Via File Manager:**
1. Log in to Virtualmin
2. Select your virtual server
3. Click "Edit Files"
4. Navigate to `public_html`
5. Upload and extract files

**Via Command Line:**
```bash
cd /home/username/public_html
wget https://link-to-dist.zip
unzip dist.zip
mv dist/* ./
rm -rf dist dist.zip
```

---

### CyberPanel (OpenLiteSpeed)

**Via CyberPanel File Manager:**
1. Log in to CyberPanel
2. Go to "File Manager"
3. Select your website
4. Navigate to `public_html`
5. Upload files from `dist/`

**Performance Note:** CyberPanel with OpenLiteSpeed provides excellent performance for M-Leja

---

### Shared Hosting (GoDaddy, Bluehost, etc.)

**All shared hosting providers follow similar steps:**

1. **Access Control Panel**
   - Log in to your hosting account
   - Find "File Manager" or "Website File Manager"

2. **Navigate to Root Directory**
   - Usually named: `public_html`, `www`, `httpdocs`, or `html`

3. **Upload Files**
   - Upload `dist.zip` (compressed dist folder)
   - Extract zip file
   - Move all files from `dist/` to root

4. **Verify .htaccess**
   - Ensure `.htaccess` file is present
   - If hidden files aren't showing, enable "Show Hidden Files" in File Manager settings

---

## Subdirectory Installation

To install M-Leja in a subdirectory (e.g., `yourdomain.com/mleja/`):

1. Create subdirectory: `public_html/mleja/`
2. Upload all files from `dist/` to `mleja/` folder
3. Access via: `https://yourdomain.com/mleja/`

**Note:** Ensure `.htaccess` is present in the `mleja/` directory for proper routing

---

## Subdomain Installation

To install on a subdomain (e.g., `app.yourdomain.com`):

1. **Create Subdomain in Control Panel**
   - cPanel: "Subdomains" section
   - Plesk: "Subdomains" under Websites & Domains
   
2. **Note Document Root**
   - Usually: `/public_html/subdomains/app/` or similar

3. **Upload Files**
   - Upload dist files to subdomain's document root
   - Ensure `.htaccess` is present

4. **Access Subdomain**
   - Visit: `https://app.yourdomain.com`

---

## SSL Certificate Setup

**Free SSL (Let's Encrypt):**

Most modern control panels include Let's Encrypt SSL:

**cPanel:**
1. Go to "SSL/TLS Status"
2. Select your domain
3. Click "Run AutoSSL"

**Plesk:**
1. Go to "SSL/TLS Certificates"
2. Click "Install" on Let's Encrypt
3. Select domain
4. Click "Get it free"

**Other Panels:**
- Look for "SSL" or "Let's Encrypt" section
- Follow one-click installation wizard

---

## Troubleshooting

### Issue: Blank page or 404 errors on refresh

**Cause:** `.htaccess` not properly configured

**Fix:**
1. Create/edit `.htaccess` in root directory:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

2. Ensure mod_rewrite is enabled (contact hosting if not)

### Issue: Files not showing after upload

**Cause:** Files may be in wrong directory

**Fix:**
- Ensure files are in document root (`public_html`, `httpdocs`, `www`)
- Check hidden files are visible in File Manager
- Verify `index.html` is in the root

### Issue: App loads but can't login

**Cause:** Mobile phone number format issues

**Fix:**
- Use format: `254712345678` OR `+254712345678` OR `0712345678`
- App now auto-normalizes all formats
- Clear browser cache and try again

---

## Advanced: Node.js Deployment (Optional)

If your hosting supports Node.js applications:

**Requirements:**
- Node.js v18+ support
- Shell/SSH access
- Process manager (PM2 or built-in)

**Installation:**
```bash
cd ~/public_html
git clone https://github.com/your-repo/m-leja.git
cd m-leja
npm install
npm run build

# Option 1: Serve static build via web server
mv dist/* ../

# Option 2: Run as Node.js app
npm install -g pm2
pm2 start npm --name "m-leja" -- start
pm2 save
pm2 startup
```

**Reverse Proxy Configuration:**
Configure your web server to proxy to Node.js app (usually port 3000)

---

## Performance Optimization

After installation, optimize performance:

1. **Enable Gzip Compression**
   - Most control panels have this in "Optimize Website" or "Performance" section

2. **Browser Caching**
   - Already configured in `.htaccess` file

3. **CDN (Optional)**
   - Consider Cloudflare for additional performance and security

---

## Security Best Practices

1. **Always use HTTPS** (SSL certificate)
2. **Keep hosting updated** (PHP, Apache/Nginx versions)
3. **Regular backups** (use control panel backup features)
4. **Strong passwords** for control panel and database
5. **Monitor for unauthorized access**

---

## Support & Resources

- **Documentation:** See `DEPLOYMENT_GUIDE.md` for detailed instructions
- **Self-Hosting:** See `SELF_HOSTING_GUIDE.md` for VPS/dedicated server setup
- **Performance:** See `PERFORMANCE_OPTIMIZATION.md`
- **Security:** See `SECURITY_AUDIT.md`

---

## Installation Verification Checklist

After installation, verify:

- [ ] Website loads at your domain
- [ ] Can navigate between pages (no 404 errors)
- [ ] Login page is accessible
- [ ] Can create new account
- [ ] Can login with existing account
- [ ] HTTPS/SSL is active (padlock icon in browser)
- [ ] No console errors (press F12 → Console)
- [ ] Mobile responsive design works

---

**Installation Status:** ✅ Compatible with ALL hosting platforms

**Last Updated:** 2024-12-01

**Estimated Installation Time:** 5-10 minutes

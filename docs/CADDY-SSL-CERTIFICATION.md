# Caddy SSL Configuration

## Overview
Caddy automatically handles SSL/TLS certificates:
- **Development (localhost)**: Uses self-signed certificates
- **Production (domain)**: Automatically obtains Let's Encrypt certificates

## Configuration

### For Development (localhost)
The current configuration uses `localhost` which will:
- Generate self-signed certificates automatically
- Work out of the box for local development
- Show a browser warning (expected for self-signed certs)

### For Production (with domain)
To use a real domain with automatic Let's Encrypt certificates:

1. **Update Caddyfile**:
   ```caddyfile
   api.yourdomain.com {
       # ... rest of config
   }
   ```

2. **Ensure DNS is configured**:
   - Point your domain's A record to your server's IP address
   - Ensure ports 80 and 443 are open on your firewall

3. **Update email in Caddyfile**:
   ```caddyfile
   {
       email your-email@example.com
   }
   ```

4. **Restart Caddy**:
   ```bash
   docker-compose restart caddy
   ```

Caddy will automatically:
- Obtain Let's Encrypt certificate
- Renew certificates automatically
- Redirect HTTP to HTTPS

## Ports
- **80**: HTTP (redirects to HTTPS)
- **443**: HTTPS
- **8000**: Backend API (if needed for direct access)

## Security Features
- Automatic HTTPS with Let's Encrypt
- Security headers (X-Frame-Options, CSP, etc.)
- HTTP to HTTPS redirect
- Compression enabled (gzip, zstd)
- Health checks for backend


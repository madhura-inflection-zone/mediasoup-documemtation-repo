# Cross-Network Media Streaming Setup Guide

This guide will help you set up your mediasoup application to work across different networks and devices.

## Prerequisites

1. **Router Access**: You need access to your router's admin panel
2. **Public IP**: A static or dynamic public IP address
3. **Domain Name** (optional): For easier access

## Method 1: Port Forwarding (Recommended)

### Step 1: Find Your Public IP
```bash
# On Windows
curl ifconfig.me
# or visit: https://whatismyipaddress.com/
```

### Step 2: Configure Router Port Forwarding
Access your router admin panel (usually http://192.168.1.1 or http://192.168.0.1)

Forward these ports to your server machine:
- **Port 3016**: Web server (HTTP/HTTPS)
- **Ports 10000-10100**: WebRTC media streams

### Step 3: Set Environment Variables
Create a `.env` file in your project root:

```env
# Your public IP address (from Step 1)
PUBLIC_IP=YOUR_PUBLIC_IP_HERE

# Your local network IP (optional, auto-detected if not set)
LOCAL_IP=192.168.1.6

# Server port (default: 3016)
PORT=3016

# WebRTC port range (default: 10000-10100)
RTC_MIN_PORT=10000
RTC_MAX_PORT=10100

# Logging level (debug, warn, error)
LOG_LEVEL=debug

# Bitrate settings
MAX_INCOMING_BITRATE=1500000
INITIAL_OUTGOING_BITRATE=1000000
```

### Step 4: Start the Server
```bash
npm start
```

### Step 5: Access from Different Networks
- **Local Network**: `http://192.168.1.6:3016`
- **External Network**: `http://YOUR_PUBLIC_IP:3016`

## Method 2: Using Tunneling Services

### Option A: LocalTunnel (Better than ngrok for WebRTC)
```bash
# Install LocalTunnel globally
npm install -g localtunnel

# Start your server
npm start

# In another terminal, create tunnel
lt --port 3016 --subdomain your-app-name
```

### Option B: Cloudflare Tunnel
```bash
# Install cloudflared
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create mediasoup-tunnel

# Configure tunnel
cloudflared tunnel route dns mediasoup-tunnel your-domain.com

# Start tunnel
cloudflared tunnel run mediasoup-tunnel
```

## Method 3: VPS/Cloud Deployment

### Deploy to a Cloud Provider
1. **DigitalOcean/AWS/GCP**: Deploy your server to a cloud instance
2. **Heroku/Railway**: Use platform-as-a-service
3. **Docker**: Containerize and deploy

### Example Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3016
EXPOSE 10000-10100
CMD ["npm", "start"]
```

## Testing Cross-Network Connectivity

### 1. Create Test Script
```javascript
// test-connectivity.js
const https = require('https');

const testConnection = (url) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      console.log(`✅ ${url} - Status: ${res.statusCode}`);
      resolve(res.statusCode);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${url} - Error: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${url} - Timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

// Test your server
const serverUrl = process.env.SERVER_URL || 'https://your-public-ip:3016';
testConnection(serverUrl);
```

### 2. Test from Different Devices
- **Mobile (4G/5G)**: Disconnect from WiFi and test
- **Different Network**: Test from a friend's house or coffee shop
- **Different Browser**: Test on Chrome, Firefox, Safari, Edge

## Troubleshooting

### Common Issues

1. **Black Screen/No Video**
   - Check firewall settings
   - Verify port forwarding
   - Ensure PUBLIC_IP is correct

2. **Connection Timeout**
   - Check if ports are open: `telnet YOUR_PUBLIC_IP 3016`
   - Verify router configuration
   - Check ISP restrictions

3. **STUN Server Issues**
   - Add multiple STUN servers
   - Check network restrictions

### Debug Commands

```bash
# Check if ports are open
netstat -an | findstr :3016
netstat -an | findstr :10000

# Test port forwarding
telnet YOUR_PUBLIC_IP 3016

# Check firewall
netsh advfirewall firewall show rule name=all | findstr mediasoup
```

### Enhanced Logging
Set `LOG_LEVEL=debug` in your `.env` file to see detailed connection logs.

## Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **Authentication**: Add user authentication
3. **Rate Limiting**: Implement rate limiting
4. **Firewall**: Configure proper firewall rules

## Performance Optimization

1. **Bandwidth**: Adjust bitrate settings based on network
2. **Codecs**: Use H.264 for better compatibility
3. **Simulcast**: Enable for adaptive quality
4. **Load Balancing**: Use multiple mediasoup workers

## Next Steps

1. Set up your environment variables
2. Configure port forwarding on your router
3. Test connectivity from external networks
4. Deploy to production when ready

For additional help, check the mediasoup documentation: https://mediasoup.org/documentation/ 
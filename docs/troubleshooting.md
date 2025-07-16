# Troubleshooting

## Common Issues and Solutions

This guide covers the most common issues you may encounter when using the MediaSoup Video Conferencing Service and provides step-by-step solutions.

## Installation Issues

### Node.js Version Problems

**Problem**: MediaSoup installation fails with Node.js version errors.

**Symptoms**:
```
npm ERR! mediasoup@3.14.1 install: `node-gyp rebuild`
npm ERR! Exit status 1
```

**Solutions**:

1. **Check Node.js Version**
   ```bash
   node --version
   # Should be v16 or higher
   ```

2. **Update Node.js**
   ```bash
   # Using nvm (recommended)
   nvm install 18
   nvm use 18
   
   # Or download from nodejs.org
   ```

3. **Clear npm Cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

### MediaSoup Native Module Issues

**Problem**: MediaSoup fails to compile native modules.

**Symptoms**:
```
gyp ERR! build error
gyp ERR! stack Error: `make` failed with exit code: 2
```

**Solutions**:

1. **Install Build Tools (Linux)**
   ```bash
   sudo apt-get update
   sudo apt-get install -y build-essential python3
   ```

2. **Install Build Tools (macOS)**
   ```bash
   xcode-select --install
   ```

3. **Install Build Tools (Windows)**
   ```bash
   npm install -g windows-build-tools
   # Or use WSL (recommended)
   ```

4. **Rebuild MediaSoup**
   ```bash
   npm rebuild mediasoup
   ```

### SSL Certificate Issues

**Problem**: SSL certificate errors preventing HTTPS access.

**Symptoms**:
```
Error: ENOENT: no such file or directory, open '../ssl/cert.pem'
```

**Solutions**:

1. **Generate SSL Certificates**
   ```bash
   mkdir -p ssl
   openssl req -x509 -newkey rsa:4096 \
     -keyout ssl/key.pem \
     -out ssl/cert.pem \
     -days 365 \
     -nodes \
     -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
   ```

2. **Check Certificate Paths**
   ```typescript
   // Verify paths in src/config.ts
   sslCrt: '../ssl/cert.pem',
   sslKey: '../ssl/key.pem'
   ```

3. **Verify Certificate Validity**
   ```bash
   openssl x509 -in ssl/cert.pem -text -noout
   ```

## Runtime Issues

### Port Already in Use

**Problem**: Service fails to start because port is occupied.

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::3016
```

**Solutions**:

1. **Check Port Usage**
   ```bash
   # Linux/macOS
   lsof -i :3016
   
   # Windows
   netstat -ano | findstr :3016
   ```

2. **Kill Conflicting Process**
   ```bash
   # Linux/macOS
   sudo kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

3. **Change Port**
   ```typescript
   // In src/config.ts
   listenPort: 3017  // Use different port
   ```

### WebRTC Port Range Issues

**Problem**: WebRTC connections fail due to port range conflicts.

**Symptoms**:
```
mediasoup:worker error: bind() failed: EADDRINUSE
```

**Solutions**:

1. **Check WebRTC Port Range**
   ```bash
   # Check if ports are in use
   sudo netstat -tulpn | grep :10000
   sudo netstat -tulpn | grep :10100
   ```

2. **Configure Different Port Range**
   ```typescript
   // In src/config.ts
   worker: {
     rtcMinPort: 20000,
     rtcMaxPort: 20100
   }
   ```

3. **Update Firewall Rules**
   ```bash
   sudo ufw allow 20000:20100/udp
   ```

### Memory Issues

**Problem**: Service crashes due to memory exhaustion.

**Symptoms**:
```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
```

**Solutions**:

1. **Increase Node.js Memory Limit**
   ```bash
   # Start with more memory
   node --max-old-space-size=4096 dist/app.js
   ```

2. **Monitor Memory Usage**
   ```bash
   # Check memory usage
   free -h
   top -p $(pgrep node)
   ```

3. **Optimize Configuration**
   ```typescript
   // Reduce worker count
   numWorkers: 2,  // Instead of CPU core count
   
   // Reduce bandwidth limits
   maxIncomingBitrate: 1000000,  // 1 Mbps instead of 1.5 Mbps
   ```

## Network Issues

### Firewall Configuration

**Problem**: WebRTC connections blocked by firewall.

**Symptoms**:
```
ICE connection failed
Transport connection failed
```

**Solutions**:

1. **Configure Firewall (Linux)**
   ```bash
   sudo ufw enable
   sudo ufw allow 3016/tcp
   sudo ufw allow 10000:10100/udp
   sudo ufw status
   ```

2. **Configure Firewall (Windows)**
   ```powershell
   # Allow inbound connections
   New-NetFirewallRule -DisplayName "MediaSoup Web" -Direction Inbound -Protocol TCP -LocalPort 3016 -Action Allow
   New-NetFirewallRule -DisplayName "MediaSoup RTC" -Direction Inbound -Protocol UDP -LocalPort 10000-10100 -Action Allow
   ```

3. **Check Router Configuration**
   - Forward ports 3016 (TCP) and 10000-10100 (UDP)
   - Enable UPnP if available
   - Configure DMZ if necessary

### NAT Traversal Issues

**Problem**: Clients behind NAT cannot establish WebRTC connections.

**Symptoms**:
```
ICE connection failed: no valid candidates
```

**Solutions**:

1. **Configure STUN/TURN Servers**
   ```typescript
   // Add to WebRTC transport configuration
   webRtcTransport: {
     iceServers: [
       {
         urls: 'stun:stun.l.google.com:19302'
       },
       {
         urls: 'turn:your-turn-server.com:3478',
         username: 'username',
         credential: 'password'
       }
     ]
   }
   ```

2. **Check Announced IP**
   ```typescript
   // Ensure announced IP is your public IP
   listenIps: [{
     ip: '0.0.0.0',
     announcedIp: '203.0.113.1'  // Your public IP
   }]
   ```

3. **Use Public STUN Servers**
   ```typescript
   iceServers: [
     { urls: 'stun:stun.l.google.com:19302' },
     { urls: 'stun:stun1.l.google.com:19302' },
     { urls: 'stun:stun2.l.google.com:19302' }
   ]
   ```

## Browser Issues

### Browser Compatibility

**Problem**: Service doesn't work in certain browsers.

**Symptoms**:
```
Browser not supported
WebRTC not available
```

**Solutions**:

1. **Check Browser Support**
   - Chrome/Chromium: 60+
   - Firefox: 55+
   - Safari: 11+
   - Edge: 79+

2. **Enable WebRTC**
   ```javascript
   // Check WebRTC support
   if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
     alert('WebRTC not supported in this browser');
   }
   ```

3. **Check Browser Console**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

### Camera/Microphone Permissions

**Problem**: Browser blocks access to camera/microphone.

**Symptoms**:
```
NotAllowedError: Permission denied
```

**Solutions**:

1. **Grant Permissions**
   - Click the camera/microphone icon in browser address bar
   - Select "Allow" for camera and microphone access

2. **Check Site Settings**
   - Chrome: Settings > Privacy and security > Site Settings > Camera/Microphone
   - Firefox: about:preferences#privacy > Permissions

3. **Use HTTPS**
   - Camera/microphone access requires HTTPS
   - Ensure SSL certificates are properly configured

### Media Device Issues

**Problem**: Camera or microphone not working.

**Symptoms**:
```
No video/audio stream
Device not found
```

**Solutions**:

1. **Check Device Availability**
   ```javascript
   // List available devices
   navigator.mediaDevices.enumerateDevices()
     .then(devices => {
       devices.forEach(device => {
         console.log(device.kind, device.label);
       });
     });
   ```

2. **Test Device Access**
   ```javascript
   // Test camera access
   navigator.mediaDevices.getUserMedia({ video: true })
     .then(stream => {
       console.log('Camera working');
       stream.getTracks().forEach(track => track.stop());
     })
     .catch(err => {
       console.error('Camera error:', err);
     });
   ```

3. **Check Device Drivers**
   - Update camera/microphone drivers
   - Test devices in other applications
   - Restart browser/computer

## MediaSoup-Specific Issues

### Worker Failures

**Problem**: MediaSoup workers crash or fail to start.

**Symptoms**:
```
mediasoup worker died, exiting in 2 seconds...
```

**Solutions**:

1. **Check Worker Logs**
   ```bash
   # Enable debug logging
   export DEBUG=mediasoup:*
   npm start
   ```

2. **Reduce Worker Count**
   ```typescript
   // Use fewer workers
   numWorkers: 1,  // Start with single worker
   ```

3. **Check System Resources**
   ```bash
   # Monitor CPU and memory
   htop
   free -h
   ```

### Transport Connection Issues

**Problem**: WebRTC transports fail to connect.

**Symptoms**:
```
Transport connection failed
DTLS handshake failed
```

**Solutions**:

1. **Check Transport Configuration**
   ```typescript
   webRtcTransport: {
     listenIps: [{
       ip: '0.0.0.0',
       announcedIp: '203.0.113.1'  // Correct public IP
     }],
     enableUdp: true,
     enableTcp: true,
     preferUdp: true
   }
   ```

2. **Enable Debug Logging**
   ```typescript
   worker: {
     logLevel: 'debug',
     logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
   }
   ```

3. **Check Network Connectivity**
   ```bash
   # Test port accessibility
   telnet your-server.com 3016
   ```

### Codec Issues

**Problem**: Audio/video codecs not working.

**Symptoms**:
```
Codec not supported
Cannot consume media
```

**Solutions**:

1. **Check Codec Configuration**
   ```typescript
   mediaCodecs: [
     {
       kind: 'audio',
       mimeType: 'audio/opus',
       clockRate: 48000,
       channels: 2
     },
     {
       kind: 'video',
       mimeType: 'video/VP8',
       clockRate: 90000
     }
   ]
   ```

2. **Verify Browser Support**
   ```javascript
   // Check codec support
   RTCRtpSender.getCapabilities('video').then(capabilities => {
     console.log('Supported video codecs:', capabilities.codecs);
   });
   ```

3. **Use Fallback Codecs**
   ```typescript
   mediaCodecs: [
     // Primary codec
     {
       kind: 'video',
       mimeType: 'video/VP8',
       clockRate: 90000
     },
     // Fallback codec
     {
       kind: 'video',
       mimeType: 'video/H264',
       clockRate: 90000,
       parameters: {
         'packetization-mode': 1,
         'profile-level-id': '42e01f'
       }
     }
   ]
   ```

## Performance Issues

### High CPU Usage

**Problem**: Service consumes excessive CPU resources.

**Symptoms**:
```
High CPU usage in top/htop
Slow performance
```

**Solutions**:

1. **Optimize Worker Configuration**
   ```typescript
   // Use appropriate worker count
   numWorkers: Math.max(1, Math.floor(require('os').cpus().length / 2)),
   
   // Reduce logging in production
   worker: {
     logLevel: 'warn',
     logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
   }
   ```

2. **Monitor Resource Usage**
   ```bash
   # Monitor CPU usage
   top -p $(pgrep node)
   
   # Monitor memory usage
   pm2 monit  # If using PM2
   ```

3. **Optimize Codec Settings**
   ```typescript
   // Use efficient codec settings
   parameters: {
     'x-google-start-bitrate': 500,  // Lower start bitrate
     'x-google-max-bitrate': 2000    // Reasonable max bitrate
   }
   ```

### High Memory Usage

**Problem**: Service consumes excessive memory.

**Symptoms**:
```
High memory usage
Memory leaks
```

**Solutions**:

1. **Implement Resource Cleanup**
   ```typescript
   // Clean up unused resources
   class Room {
     cleanup(): void {
       this.peers.forEach(peer => {
         peer.close();
       });
       this.peers.clear();
       this.router.close();
     }
   }
   ```

2. **Monitor Memory Usage**
   ```bash
   # Check memory usage
   free -h
   
   # Monitor Node.js memory
   node --inspect src/app.js
   ```

3. **Set Memory Limits**
   ```bash
   # Limit Node.js memory
   node --max-old-space-size=2048 dist/app.js
   ```

### Bandwidth Issues

**Problem**: High bandwidth consumption or poor quality.

**Symptoms**:
```
Poor video quality
High bandwidth usage
```

**Solutions**:

1. **Optimize Bandwidth Settings**
   ```typescript
   webRtcTransport: {
     maxIncomingBitrate: 1000000,      // 1 Mbps
     initialAvailableOutgoingBitrate: 800000  // 800 Kbps
   }
   ```

2. **Implement Adaptive Quality**
   ```typescript
   // Use simulcast for adaptive quality
   if (consumer.type === 'simulcast') {
     await consumer.setPreferredLayers({
       spatialLayer: 1,  // Lower quality
       temporalLayer: 1
     });
   }
   ```

3. **Monitor Bandwidth Usage**
   ```bash
   # Monitor network usage
   iftop -i eth0
   
   # Check bandwidth per connection
   nethogs
   ```

## Debugging Tools

### Logging

#### Enable Debug Logging

```typescript
// Enable MediaSoup debug logging
worker: {
  logLevel: 'debug',
  logTags: [
    'info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp',
    'rtx', 'bwe', 'score', 'simulcast', 'svc'
  ]
}
```

#### Custom Logging

```typescript
// Add custom logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use in application
logger.info('Room created', { roomId: 'test-room' });
logger.error('Transport failed', { error: err.message });
```

### Network Debugging

#### TCP Dump

```bash
# Monitor WebRTC traffic
sudo tcpdump -i any udp portrange 10000-10100 -w webrtc.pcap

# Monitor signaling traffic
sudo tcpdump -i any port 3016 -w signaling.pcap

# Analyze with Wireshark
wireshark webrtc.pcap
```

#### Network Connectivity Tests

```bash
# Test port accessibility
telnet your-server.com 3016

# Test UDP ports
nc -u your-server.com 10000

# Check routing
traceroute your-server.com
```

### Browser Debugging

#### WebRTC Debugging

```javascript
// Enable WebRTC debugging
localStorage.setItem('debug', 'mediasoup:*');

// Check WebRTC stats
pc.getStats().then(stats => {
  stats.forEach(report => {
    console.log(report.type, report);
  });
});
```

#### Media Device Debugging

```javascript
// List available devices
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    devices.forEach(device => {
      console.log(`${device.kind}: ${device.label} (${device.deviceId})`);
    });
  });

// Test media access
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    console.log('Media access granted');
    stream.getTracks().forEach(track => {
      console.log(`${track.kind} track:`, track.getSettings());
    });
  })
  .catch(err => {
    console.error('Media access error:', err);
  });
```

## Getting Help

### Self-Diagnosis Checklist

- [ ] Node.js version is 16 or higher
- [ ] SSL certificates are properly configured
- [ ] Required ports are open and accessible
- [ ] Firewall allows WebRTC traffic
- [ ] Browser supports WebRTC
- [ ] Camera/microphone permissions granted
- [ ] Network connectivity is stable
- [ ] System resources are adequate

### Debug Information Collection

When reporting issues, collect the following information:

1. **System Information**
   ```bash
   # OS and version
   uname -a
   
   # Node.js version
   node --version
   
   # npm version
   npm --version
   ```

2. **Application Logs**
   ```bash
   # Application logs
   tail -f logs/app.log
   
   # Error logs
   tail -f logs/error.log
   ```

3. **Network Information**
   ```bash
   # Network interfaces
   ip addr show
   
   # Firewall status
   sudo ufw status
   ```

4. **Browser Information**
   - Browser name and version
   - Console errors
   - Network tab information
   - WebRTC stats

### Support Channels

1. **Documentation**: Check this troubleshooting guide
2. **GitHub Issues**: Report bugs and feature requests
3. **Community Forums**: Seek help from the community
4. **Professional Support**: Contact for enterprise support

### Common Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `EADDRINUSE` | Port already in use | Kill conflicting process or change port |
| `ENOENT: no such file` | Missing SSL certificates | Generate SSL certificates |
| `Permission denied` | Camera/microphone access denied | Grant browser permissions |
| `ICE connection failed` | Network connectivity issues | Check firewall and NAT configuration |
| `Codec not supported` | Unsupported media codec | Use supported codec or update browser |
| `Worker died` | MediaSoup worker crash | Check system resources and logs | 
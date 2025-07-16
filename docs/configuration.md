# Configuration

## Overview

The MediaSoup Video Conferencing Service uses a comprehensive configuration system that allows customization of all aspects of the service, from server settings to media processing parameters.

## Configuration Structure

The configuration is defined in `src/config.ts` and follows a hierarchical structure:

```typescript
interface Config {
  listenIp: string;
  listenPort: number;
  sslCrt: string;
  sslKey: string;
  mediasoup: MediasoupConfig;
}
```

## Server Configuration

### Basic Server Settings

```typescript
const config: Config = {
  listenIp: '0.0.0.0',        // Listen on all interfaces
  listenPort: 3016,           // HTTPS port
  sslCrt: '../ssl/cert.pem',  // SSL certificate path
  sslKey: '../ssl/key.pem'    // SSL private key path
};
```

### SSL/TLS Configuration

#### Certificate Setup

1. **Generate Self-Signed Certificates (Development)**
   ```bash
   # Create SSL directory
   mkdir -p ssl
   
   # Generate self-signed certificate
   openssl req -x509 -newkey rsa:4096 \
     -keyout ssl/key.pem \
     -out ssl/cert.pem \
     -days 365 \
     -nodes \
     -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
   ```

2. **Production Certificates**
   - Use certificates from a trusted Certificate Authority
   - Ensure proper certificate chain
   - Configure certificate renewal

#### Certificate Configuration

```typescript
// Development
sslCrt: '../ssl/cert.pem',
sslKey: '../ssl/key.pem'

// Production (example)
sslCrt: '/etc/ssl/certs/your-domain.crt',
sslKey: '/etc/ssl/private/your-domain.key'
```

## MediaSoup Configuration

### Worker Configuration

```typescript
mediasoup: {
  // Number of workers (recommended: CPU cores)
  numWorkers: Object.keys(os.cpus()).length,
  
  worker: {
    // RTC port range
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    
    // Logging configuration
    logLevel: 'warn',  // 'debug', 'warn', 'error'
    logTags: [
      'info',    // General information
      'ice',     // ICE connectivity
      'dtls',    // DTLS handshake
      'rtp',     // RTP packets
      'srtp',    // SRTP encryption
      'rtcp'     // RTCP control packets
    ]
  }
}
```

#### Worker Optimization

```typescript
// Optimal worker count based on system
const numWorkers = Math.max(1, Object.keys(os.cpus()).length);

// Custom port range
worker: {
  rtcMinPort: 20000,
  rtcMaxPort: 20100,
  
  // Enhanced logging for debugging
  logLevel: 'debug',
  logTags: [
    'info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp',
    'rtx', 'bwe', 'score', 'simulcast', 'svc'
  ]
}
```

### Router Configuration

```typescript
router: {
  mediaCodecs: [
    // Audio codec configuration
    {
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2
    },
    
    // Video codec configuration
    {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000
      }
    }
  ]
}
```

#### Advanced Codec Configuration

```typescript
router: {
  mediaCodecs: [
    // Opus audio with custom parameters
    {
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
      parameters: {
        minptime: 10,
        useinbandfec: 1
      }
    },
    
    // VP8 video with simulcast support
    {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000,
        'x-google-min-bitrate': 500,
        'x-google-max-bitrate': 3000
      }
    },
    
    // H.264 video (if supported)
    {
      kind: 'video',
      mimeType: 'video/H264',
      clockRate: 90000,
      parameters: {
        'packetization-mode': 1,
        'profile-level-id': '42e01f',
        'level-asymmetry-allowed': 1
      }
    }
  ]
}
```

### WebRTC Transport Configuration

```typescript
webRtcTransport: {
  // Network interface configuration
  listenIps: [
    {
      ip: '0.0.0.0',           // Listen on all interfaces
      announcedIp: '192.168.1.6'  // Public IP address
    }
  ],
  
  // Bandwidth limits
  maxIncomingBitrate: 1500000,      // 1.5 Mbps incoming
  initialAvailableOutgoingBitrate: 1000000  // 1 Mbps outgoing
}
```

#### Advanced Transport Configuration

```typescript
webRtcTransport: {
  // Multiple network interfaces
  listenIps: [
    {
      ip: '0.0.0.0',
      announcedIp: '203.0.113.1'  // Primary public IP
    },
    {
      ip: '0.0.0.0',
      announcedIp: '203.0.113.2'  // Secondary public IP
    }
  ],
  
  // Enhanced bandwidth management
  maxIncomingBitrate: 2000000,      // 2 Mbps incoming
  initialAvailableOutgoingBitrate: 1500000,  // 1.5 Mbps outgoing
  
  // Transport options
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
  
  // ICE configuration
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

## Environment-Based Configuration

### Environment Variables

```typescript
// Load configuration from environment variables
const config: Config = {
  listenIp: process.env.LISTEN_IP || '0.0.0.0',
  listenPort: parseInt(process.env.LISTEN_PORT || '3016'),
  sslCrt: process.env.SSL_CERT_PATH || '../ssl/cert.pem',
  sslKey: process.env.SSL_KEY_PATH || '../ssl/key.pem',
  mediasoup: {
    numWorkers: parseInt(process.env.MEDIASOUP_WORKERS || Object.keys(os.cpus()).length.toString()),
    worker: {
      rtcMinPort: parseInt(process.env.RTC_MIN_PORT || '10000'),
      rtcMaxPort: parseInt(process.env.RTC_MAX_PORT || '10100'),
      logLevel: process.env.LOG_LEVEL || 'warn',
      logTags: process.env.LOG_TAGS ? process.env.LOG_TAGS.split(',') : ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
    },
    webRtcTransport: {
      listenIps: [{
        ip: '0.0.0.0',
        announcedIp: process.env.ANNOUNCED_IP || '192.168.1.6'
      }],
      maxIncomingBitrate: parseInt(process.env.MAX_INCOMING_BITRATE || '1500000'),
      initialAvailableOutgoingBitrate: parseInt(process.env.INITIAL_OUTGOING_BITRATE || '1000000')
    }
  }
};
```

### Configuration Files

#### Development Configuration (`config.dev.ts`)

```typescript
export const devConfig: Partial<Config> = {
  listenPort: 3016,
  mediasoup: {
    worker: {
      logLevel: 'debug',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp', 'rtx', 'bwe']
    }
  }
};
```

#### Production Configuration (`config.prod.ts`)

```typescript
export const prodConfig: Partial<Config> = {
  listenPort: 443,
  mediasoup: {
    worker: {
      logLevel: 'warn',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
    },
    webRtcTransport: {
      maxIncomingBitrate: 2000000,
      initialAvailableOutgoingBitrate: 1500000
    }
  }
};
```

## Network Configuration

### Firewall Settings

#### Required Ports

```bash
# Web interface (HTTPS)
sudo ufw allow 3016/tcp

# WebRTC media (UDP)
sudo ufw allow 10000:10100/udp

# STUN/TURN servers (if using external)
sudo ufw allow 3478/udp
sudo ufw allow 3478/tcp
```

#### Docker Configuration

```dockerfile
# Expose required ports
EXPOSE 3016
EXPOSE 10000-10100/udp
```

### Network Interface Configuration

#### Single Interface

```typescript
webRtcTransport: {
  listenIps: [{
    ip: '0.0.0.0',
    announcedIp: '203.0.113.1'  // Your public IP
  }]
}
```

#### Multiple Interfaces

```typescript
webRtcTransport: {
  listenIps: [
    {
      ip: '0.0.0.0',
      announcedIp: '203.0.113.1'  // Primary IP
    },
    {
      ip: '0.0.0.0',
      announcedIp: '203.0.113.2'  // Secondary IP
    }
  ]
}
```

## Performance Configuration

### Bandwidth Management

```typescript
webRtcTransport: {
  // Per-transport bandwidth limits
  maxIncomingBitrate: 1500000,      // 1.5 Mbps per participant
  initialAvailableOutgoingBitrate: 1000000,  // 1 Mbps per participant
  
  // Global bandwidth limits (if implemented)
  maxSctpMessageSize: 262144,       // 256 KB
  numSctpStreams: { OS: 1024, MIS: 1024 }
}
```

### Quality Configuration

```typescript
router: {
  mediaCodecs: [
    // High-quality audio
    {
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2,
      parameters: {
        minptime: 10,
        useinbandfec: 1,
        maxaveragebitrate: 128000  // 128 kbps
      }
    },
    
    // Adaptive video quality
    {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000,
        'x-google-min-bitrate': 500,
        'x-google-max-bitrate': 3000,
        'x-google-max-quantizer': 56,
        'x-google-min-quantizer': 2
      }
    }
  ]
}
```

## Security Configuration

### SSL/TLS Security

```typescript
// Strong SSL configuration
const httpsOptions = {
  key: fs.readFileSync(config.sslKey),
  cert: fs.readFileSync(config.sslCrt),
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  ciphers: 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256',
  honorCipherOrder: true
};
```

### Access Control

```typescript
// Room access control (example implementation)
const roomAccessControl = {
  maxParticipants: 50,
  requireAuthentication: true,
  allowedDomains: ['example.com', 'trusted-domain.com'],
  rateLimit: {
    connectionsPerMinute: 10,
    eventsPerMinute: 100
  }
};
```

## Monitoring Configuration

### Logging Configuration

```typescript
worker: {
  logLevel: 'warn',  // Production: 'warn', Development: 'debug'
  logTags: [
    'info',    // General information
    'ice',     // ICE connectivity
    'dtls',    // DTLS handshake
    'rtp',     // RTP packets
    'srtp',    // SRTP encryption
    'rtcp'     // RTCP control packets
  ]
}
```

### Metrics Configuration

```typescript
// Metrics collection (example)
const metricsConfig = {
  enabled: true,
  interval: 30000,  // 30 seconds
  metrics: [
    'worker.resourceUsage',
    'router.transportCount',
    'room.participantCount',
    'bandwidth.incoming',
    'bandwidth.outgoing'
  ]
};
```

## Configuration Validation

### Schema Validation

```typescript
// Configuration validation function
function validateConfig(config: Config): boolean {
  // Validate required fields
  if (!config.listenIp || !config.listenPort) {
    throw new Error('Missing required server configuration');
  }
  
  // Validate SSL certificates
  if (!fs.existsSync(config.sslCrt) || !fs.existsSync(config.sslKey)) {
    throw new Error('SSL certificates not found');
  }
  
  // Validate MediaSoup configuration
  if (config.mediasoup.numWorkers < 1) {
    throw new Error('Invalid number of workers');
  }
  
  // Validate port ranges
  if (config.mediasoup.worker.rtcMinPort >= config.mediasoup.worker.rtcMaxPort) {
    throw new Error('Invalid RTC port range');
  }
  
  return true;
}
```

### Runtime Configuration Updates

```typescript
// Dynamic configuration updates
class ConfigurationManager {
  private config: Config;
  
  updateConfig(updates: Partial<Config>): void {
    this.config = { ...this.config, ...updates };
    this.validateConfig(this.config);
    this.applyConfig(this.config);
  }
  
  private applyConfig(config: Config): void {
    // Apply configuration changes at runtime
    // Note: Some changes may require service restart
  }
}
```

## Configuration Examples

### Development Environment

```typescript
const devConfig: Config = {
  listenIp: '0.0.0.0',
  listenPort: 3016,
  sslCrt: '../ssl/cert.pem',
  sslKey: '../ssl/key.pem',
  mediasoup: {
    numWorkers: 2,
    worker: {
      rtcMinPort: 10000,
      rtcMaxPort: 10100,
      logLevel: 'debug',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp', 'rtx', 'bwe']
    },
    router: {
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
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000
          }
        }
      ]
    },
    webRtcTransport: {
      listenIps: [{
        ip: '0.0.0.0',
        announcedIp: '192.168.1.6'
      }],
      maxIncomingBitrate: 1500000,
      initialAvailableOutgoingBitrate: 1000000
    }
  }
};
```

### Production Environment

```typescript
const prodConfig: Config = {
  listenIp: '0.0.0.0',
  listenPort: 443,
  sslCrt: '/etc/ssl/certs/production.crt',
  sslKey: '/etc/ssl/private/production.key',
  mediasoup: {
    numWorkers: 8,
    worker: {
      rtcMinPort: 20000,
      rtcMaxPort: 20100,
      logLevel: 'warn',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
    },
    router: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
          parameters: {
            minptime: 10,
            useinbandfec: 1
          }
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000,
            'x-google-min-bitrate': 500,
            'x-google-max-bitrate': 3000
          }
        }
      ]
    },
    webRtcTransport: {
      listenIps: [{
        ip: '0.0.0.0',
        announcedIp: '203.0.113.1'
      }],
      maxIncomingBitrate: 2000000,
      initialAvailableOutgoingBitrate: 1500000
    }
  }
};
```

## Best Practices

### Configuration Management

1. **Environment Separation**: Use different configurations for development, staging, and production
2. **Security**: Never commit sensitive configuration to version control
3. **Validation**: Always validate configuration before applying
4. **Documentation**: Document all configuration options and their effects
5. **Monitoring**: Monitor configuration changes and their impact

### Performance Optimization

1. **Worker Count**: Set worker count to CPU core count
2. **Port Ranges**: Use non-overlapping port ranges for multiple instances
3. **Bandwidth Limits**: Set appropriate bandwidth limits based on your infrastructure
4. **Codec Selection**: Choose efficient codecs for your use case

### Security Hardening

1. **SSL/TLS**: Use strong SSL/TLS configuration
2. **Network Security**: Configure firewalls properly
3. **Access Control**: Implement proper access control mechanisms
4. **Monitoring**: Monitor for security-related events 
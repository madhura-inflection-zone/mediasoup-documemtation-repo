# MediaSoup Video Conferencing Service

> A comprehensive guide to the MediaSoup video conferencing service

## Introduction

The MediaSoup Video Conferencing Service is a real-time communication platform built with Node.js, TypeScript, and MediaSoup. It enables multi-party video/audio/screen conferencing with WebRTC technology, providing a scalable and efficient solution for video communication.

### Key Features

- **Multi-party Video Conferencing**: Support for multiple participants in a single room
- **Audio/Video Streaming**: Real-time audio and video communication
- **Screen Sharing**: Ability to share screen content with other participants
- **WebRTC Technology**: Modern web standards for peer-to-peer communication
- **Scalable Architecture**: Built with MediaSoup for enterprise-grade scalability
- **TypeScript Support**: Full type safety and better development experience

### Technology Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Real-time Communication**: Socket.IO, MediaSoup
- **Frontend**: HTML5, CSS3, JavaScript (TypeScript)
- **Media Processing**: WebRTC, MediaSoup Client
- **SSL/TLS**: HTTPolyglot for secure connections

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- SSL certificates (for HTTPS)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd mediasoup-documemtation-repo
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure SSL Certificates**
   - Place your SSL certificates in the `ssl/` directory
   - Update the certificate paths in `src/config.ts`

4. **Build the Project**
   ```bash
   npm run build
   ```

5. **Start the Service**
   ```bash
   npm start
   ```

6. **Access the Application**
   - Open your browser and navigate to `https://localhost:3016`
   - Enter a room ID and your name to join a conference

## Architecture Overview

The service follows a modular architecture with the following key components:

- **Room Management**: Handles video conference rooms and participants
- **Peer Management**: Manages individual user connections and media streams
- **Transport Layer**: WebRTC transport management for media streaming
- **Media Processing**: Audio/video encoding, decoding, and streaming
- **Socket Communication**: Real-time event handling and room coordination

## API Reference

### Socket.IO Events

#### Client to Server Events

| Event | Description | Parameters |
|-------|-------------|------------|
| `createRoom` | Create a new video conference room | `{ room_id: string }` |
| `join` | Join an existing room | `{ room_id: string, name: string }` |
| `getProducers` | Get list of active media producers | None |
| `getRouterRtpCapabilities` | Get router RTP capabilities | None |
| `createWebRtcTransport` | Create WebRTC transport | None |
| `connectTransport` | Connect transport with DTLS parameters | `{ transport_id: string, dtlsParameters: any }` |
| `produce` | Start producing media stream | `{ kind: 'audio'\|'video', rtpParameters: any, producerTransportId: string }` |
| `consume` | Start consuming media stream | `{ consumerTransportId: string, producerId: string, rtpCapabilities: any }` |
| `resume` | Resume a paused consumer | None |
| `getMyRoomInfo` | Get current room information | None |
| `producerClosed` | Notify when producer is closed | `{ producer_id: string }` |
| `exitRoom` | Leave the current room | None |

#### Server to Client Events

| Event | Description | Data |
|-------|-------------|------|
| `newProducers` | New media producers available | `Array<{ producer_id: string, producer_socket_id: string }>` |
| `consumerClosed` | Consumer has been closed | `{ consumer_id: string }` |

## Configuration

The service configuration is managed through `src/config.ts`:

### Server Configuration
```typescript
{
  listenIp: '0.0.0.0',
  listenPort: 3016,
  sslCrt: '../ssl/cert.pem',
  sslKey: '../ssl/key.pem'
}
```

### MediaSoup Configuration
```typescript
{
  numWorkers: Object.keys(os.cpus()).length,
  worker: {
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    logLevel: 'warn',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
  },
  router: {
    mediaCodecs: [
      // Audio codec configuration
      // Video codec configuration
    ]
  },
  webRtcTransport: {
    listenIps: [{ ip: '0.0.0.0', announcedIp: '192.168.1.6' }],
    maxIncomingBitrate: 1500000,
    initialAvailableOutgoingBitrate: 1000000
  }
}
```

## Deployment

### Production Deployment

1. **Update Configuration**
   - Set `announcedIp` to your public IP address
   - Configure SSL certificates
   - Adjust port settings as needed

2. **Firewall Configuration**
   - Open port 3016 for web access
   - Open UDP ports 10000-10100 for RTC connections

3. **Docker Deployment**
   ```bash
   npm run docker-build
   npm run docker-run
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3016` |
| `SSL_KEY_PATH` | SSL private key path | `../ssl/key.pem` |
| `SSL_CERT_PATH` | SSL certificate path | `../ssl/cert.pem` |

## Development

### Development Commands

```bash
# Development mode with hot reload
npm run dev

# Build the project
npm run build

# Start production server
npm start

# Run with nodemon
npm run mon

# Lint and format code
npm run lint

# Compile MediaSoup client
npm run compile-mediasoup-client
```

### Project Structure

```
├── src/
│   ├── app.ts              # Main application entry point
│   ├── config.ts           # Configuration management
│   ├── Room.ts             # Room management class
│   ├── Peer.ts             # Peer management class
│   └── types/              # TypeScript type definitions
├── public/
│   ├── index.html          # Main HTML page
│   ├── RoomClient.ts       # Client-side room management
│   ├── style.css           # Application styles
│   └── modules/            # External libraries
├── ssl/                    # SSL certificates
└── package.json            # Project dependencies
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   - Ensure SSL certificates are properly configured
   - Check file paths in `config.ts`

2. **MediaSoup Installation Issues**
   - On Windows, consider using WSL
   - Ensure Node.js version compatibility

3. **WebRTC Connection Issues**
   - Check firewall settings
   - Verify announced IP configuration
   - Ensure STUN/TURN servers are accessible

4. **Browser Compatibility**
   - Use modern browsers with WebRTC support
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting log level to 'debug' in the MediaSoup worker configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to format code
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review MediaSoup documentation
- Open an issue in the repository 
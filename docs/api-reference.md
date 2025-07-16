# API Reference

## Overview

The MediaSoup Video Conferencing Service provides a comprehensive API for real-time video communication. The API is built on Socket.IO for real-time bidirectional communication and follows WebRTC standards for media streaming.

## Socket.IO Events

### Client to Server Events

#### Room Management

##### `createRoom`
Creates a new video conference room.

**Parameters:**
```typescript
{
  room_id: string
}
```

**Response:**
- `string`: Room ID if successful
- `'already exists'`: If room already exists

**Example:**
```javascript
socket.emit('createRoom', { room_id: 'my-room-123' }, (response) => {
  if (response === 'my-room-123') {
    console.log('Room created successfully');
  } else {
    console.log('Room already exists');
  }
});
```

##### `join`
Joins an existing video conference room.

**Parameters:**
```typescript
{
  room_id: string,
  name: string
}
```

**Response:**
```typescript
{
  id: string,
  peers: string // JSON string of peer information
}
```

**Error Response:**
```typescript
{
  error: string
}
```

**Example:**
```javascript
socket.emit('join', { 
  room_id: 'my-room-123', 
  name: 'John Doe' 
}, (response) => {
  if (response.error) {
    console.error('Join error:', response.error);
  } else {
    console.log('Joined room:', response);
  }
});
```

##### `exitRoom`
Leaves the current room and cleans up resources.

**Parameters:** None

**Response:**
- `'success'`: If successful
- `{ error: string }`: If error occurs

**Example:**
```javascript
socket.emit('exitRoom', {}, (response) => {
  if (response === 'success') {
    console.log('Successfully left room');
  } else {
    console.error('Error leaving room:', response.error);
  }
});
```

#### Transport Management

##### `createWebRtcTransport`
Creates a new WebRTC transport for media streaming.

**Parameters:** None

**Response:**
```typescript
{
  id: string,
  iceParameters: {
    usernameFragment: string,
    password: string,
    iceLite: boolean
  },
  iceCandidates: Array<{
    foundation: string,
    priority: number,
    ip: string,
    port: number,
    type: string,
    tcpType?: string
  }>,
  dtlsParameters: {
    role: string,
    fingerprints: Array<{
      algorithm: string,
      value: string
    }>
  }
}
```

**Error Response:**
```typescript
{
  error: string
}
```

**Example:**
```javascript
socket.emit('createWebRtcTransport', {}, (response) => {
  if (response.error) {
    console.error('Transport creation error:', response.error);
  } else {
    console.log('Transport created:', response);
    // Use response to create transport on client side
  }
});
```

##### `connectTransport`
Connects a transport with DTLS parameters.

**Parameters:**
```typescript
{
  transport_id: string,
  dtlsParameters: {
    role: string,
    fingerprints: Array<{
      algorithm: string,
      value: string
    }>
  }
}
```

**Response:**
- `'success'`: If successful
- `{ error: string }`: If error occurs

**Example:**
```javascript
socket.emit('connectTransport', {
  transport_id: 'transport-123',
  dtlsParameters: {
    role: 'client',
    fingerprints: [{
      algorithm: 'sha-256',
      value: 'fingerprint-value'
    }]
  }
}, (response) => {
  if (response === 'success') {
    console.log('Transport connected');
  } else {
    console.error('Transport connection error:', response.error);
  }
});
```

#### Media Production

##### `produce`
Starts producing a media stream (audio/video).

**Parameters:**
```typescript
{
  kind: 'audio' | 'video',
  rtpParameters: {
    codecs: Array<{
      mimeType: string,
      payloadType: number,
      clockRate: number,
      channels?: number,
      parameters?: object
    }>,
    encodings: Array<{
      ssrc: number,
      rtx?: { ssrc: number }
    }>,
    rtcp: {
      cname: string,
      reducedSize: boolean
    }
  },
  producerTransportId: string
}
```

**Response:**
```typescript
{
  producer_id: string
}
```

**Error Response:**
```typescript
{
  error: string
}
```

**Example:**
```javascript
socket.emit('produce', {
  kind: 'video',
  rtpParameters: {
    codecs: [{
      mimeType: 'video/VP8',
      payloadType: 96,
      clockRate: 90000
    }],
    encodings: [{
      ssrc: 12345678
    }],
    rtcp: {
      cname: 'video-producer',
      reducedSize: true
    }
  },
  producerTransportId: 'transport-123'
}, (response) => {
  if (response.producer_id) {
    console.log('Producer created:', response.producer_id);
  } else {
    console.error('Producer error:', response.error);
  }
});
```

##### `producerClosed`
Notifies the server when a producer is closed.

**Parameters:**
```typescript
{
  producer_id: string
}
```

**Response:** None

**Example:**
```javascript
socket.emit('producerClosed', { producer_id: 'producer-123' });
```

#### Media Consumption

##### `consume`
Starts consuming a media stream.

**Parameters:**
```typescript
{
  consumerTransportId: string,
  producerId: string,
  rtpCapabilities: {
    codecs: Array<{
      kind: 'audio' | 'video',
      mimeType: string,
      clockRate: number,
      channels?: number,
      parameters?: object
    }>,
    headerExtensions: Array<{
      kind: 'audio' | 'video',
      uri: string,
      id: number
    }>
  }
}
```

**Response:**
```typescript
{
  producerId: string,
  id: string,
  kind: 'audio' | 'video',
  rtpParameters: {
    codecs: Array<object>,
    encodings: Array<object>,
    rtcp: object
  },
  type: string,
  producerPaused: boolean
}
```

**Error Response:**
```typescript
{
  error: string
}
```

**Example:**
```javascript
socket.emit('consume', {
  consumerTransportId: 'transport-456',
  producerId: 'producer-123',
  rtpCapabilities: {
    codecs: [{
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000
    }],
    headerExtensions: []
  }
}, (response) => {
  if (response.id) {
    console.log('Consumer created:', response);
  } else {
    console.error('Consumer error:', response.error);
  }
});
```

##### `resume`
Resumes a paused consumer.

**Parameters:** None

**Response:** None

**Example:**
```javascript
socket.emit('resume', {}, () => {
  console.log('Consumer resumed');
});
```

#### Information Retrieval

##### `getProducers`
Gets the list of active media producers in the room.

**Parameters:** None

**Response:** None (triggers `newProducers` event)

**Example:**
```javascript
socket.emit('getProducers');
```

##### `getRouterRtpCapabilities`
Gets the router's RTP capabilities for codec negotiation.

**Parameters:** None

**Response:**
```typescript
{
  codecs: Array<{
    kind: 'audio' | 'video',
    mimeType: string,
    clockRate: number,
    channels?: number,
    parameters?: object
  }>,
  headerExtensions: Array<{
    kind: 'audio' | 'video',
    uri: string,
    id: number
  }>
}
```

**Error Response:**
```typescript
{
  error: string
}
```

**Example:**
```javascript
socket.emit('getRouterRtpCapabilities', {}, (response) => {
  if (response.error) {
    console.error('RTP capabilities error:', response.error);
  } else {
    console.log('Router RTP capabilities:', response);
  }
});
```

##### `getMyRoomInfo`
Gets information about the current room.

**Parameters:** None

**Response:**
```typescript
{
  id: string,
  peers: string // JSON string of peer information
}
```

**Error Response:**
```typescript
{
  error: string
}
```

**Example:**
```javascript
socket.emit('getMyRoomInfo', {}, (response) => {
  if (response.error) {
    console.error('Room info error:', response.error);
  } else {
    console.log('Room info:', response);
  }
});
```

### Server to Client Events

#### `newProducers`
Emitted when new media producers become available in the room.

**Data:**
```typescript
Array<{
  producer_id: string,
  producer_socket_id: string
}>
```

**Example:**
```javascript
socket.on('newProducers', (producers) => {
  console.log('New producers available:', producers);
  producers.forEach(producer => {
    // Handle new producer
    consumeProducer(producer.producer_id);
  });
});
```

#### `consumerClosed`
Emitted when a consumer is closed (e.g., when producer is closed).

**Data:**
```typescript
{
  consumer_id: string
}
```

**Example:**
```javascript
socket.on('consumerClosed', (data) => {
  console.log('Consumer closed:', data.consumer_id);
  // Clean up consumer resources
  removeConsumer(data.consumer_id);
});
```

## Client-Side API

### RoomClient Class

The `RoomClient` class provides a high-level interface for managing video conference rooms.

#### Constructor

```typescript
constructor(
  localMediaEl: HTMLElement,
  remoteVideoEl: HTMLElement,
  remoteAudioEl: HTMLElement,
  mediasoupClient: any,
  socket: any,
  room_id: string,
  name: string,
  successCallback: () => void
)
```

#### Methods

##### `produce(type, deviceId?)`
Starts producing a media stream.

**Parameters:**
- `type`: `'audioType' | 'videoType' | 'screenType'`
- `deviceId`: Optional device ID for audio/video

**Example:**
```javascript
// Start video
roomClient.produce(RoomClient.mediaType.video);

// Start audio with specific device
roomClient.produce(RoomClient.mediaType.audio, 'audio-device-id');

// Start screen sharing
roomClient.produce(RoomClient.mediaType.screen);
```

##### `closeProducer(type)`
Closes a media producer.

**Parameters:**
- `type`: `'audioType' | 'videoType' | 'screenType'`

**Example:**
```javascript
roomClient.closeProducer(RoomClient.mediaType.video);
```

##### `exit(offline = false)`
Leaves the room and cleans up resources.

**Parameters:**
- `offline`: Whether the user is going offline

**Example:**
```javascript
roomClient.exit();
```

##### `roomInfo()`
Gets current room information.

**Returns:** Promise with room information

**Example:**
```javascript
const info = await roomClient.roomInfo();
console.log('Room info:', info);
```

##### `copyURL()`
Copies the current room URL to clipboard.

**Example:**
```javascript
roomClient.copyURL();
```

##### `showDevices()`
Shows available audio/video devices.

**Example:**
```javascript
roomClient.showDevices();
```

#### Events

##### `on(event, callback)`
Registers an event listener.

**Events:**
- `'exitRoom'`: When leaving the room
- `'openRoom'`: When entering the room
- `'startVideo'`: When video starts
- `'stopVideo'`: When video stops
- `'startAudio'`: When audio starts
- `'stopAudio'`: When audio stops
- `'startScreen'`: When screen sharing starts
- `'stopScreen'`: When screen sharing stops

**Example:**
```javascript
roomClient.on(RoomClient.EVENTS.startVideo, () => {
  console.log('Video started');
});

roomClient.on(RoomClient.EVENTS.exitRoom, () => {
  console.log('Left the room');
});
```

## Error Handling

### Common Error Types

#### Network Errors
- **Connection lost**: Socket.IO connection issues
- **Transport failed**: WebRTC transport connection problems
- **ICE failure**: Network connectivity issues

#### Media Errors
- **Device access denied**: Camera/microphone permissions
- **Codec not supported**: Unsupported media codecs
- **Producer/Consumer errors**: Media stream issues

#### Room Errors
- **Room not found**: Invalid room ID
- **Room full**: Maximum participants reached
- **Permission denied**: Access control issues

### Error Handling Best Practices

```javascript
// Handle socket connection errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Implement reconnection logic
});

// Handle transport errors
transport.on('connectionstatechange', (state) => {
  switch (state) {
    case 'connecting':
      console.log('Transport connecting...');
      break;
    case 'connected':
      console.log('Transport connected');
      break;
    case 'failed':
      console.error('Transport failed');
      // Implement retry logic
      break;
    case 'closed':
      console.log('Transport closed');
      break;
  }
});

// Handle media errors
producer.on('transportclose', () => {
  console.error('Producer transport closed');
  // Clean up producer
});

consumer.on('transportclose', () => {
  console.error('Consumer transport closed');
  // Clean up consumer
});
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Connection rate**: Maximum 10 connections per minute per IP
- **Event rate**: Maximum 100 events per minute per socket
- **Room creation**: Maximum 5 rooms per minute per IP

## Security Considerations

### Authentication
- Implement user authentication before allowing room access
- Validate room permissions
- Use secure WebSocket connections (WSS)

### Input Validation
- Validate all input parameters
- Sanitize room IDs and user names
- Implement proper error handling

### Transport Security
- All media streams are encrypted with DTLS-SRTP
- Use proper SSL/TLS certificates
- Implement certificate pinning if needed

## Performance Considerations

### Bandwidth Management
- Monitor bandwidth usage
- Implement adaptive bitrate
- Use appropriate codec settings

### Resource Management
- Clean up unused transports and producers
- Monitor memory usage
- Implement proper error recovery

### Scalability
- Use multiple MediaSoup workers
- Implement load balancing
- Monitor system resources 
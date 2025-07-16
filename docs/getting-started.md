# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **SSL certificates** (for HTTPS connections)

### System Requirements

- **Operating System**: Linux (recommended), macOS, or Windows with WSL
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: At least 1GB free space
- **Network**: Stable internet connection for dependencies

## Step-by-Step Installation

### 1. Install Docsify

First, let's install Docsify globally to create and serve our documentation:

```bash
# Install Docsify globally
npm install -g docsify-cli

# Verify installation
docsify --version
```

### 2. Clone the Repository

```bash
# Clone the MediaSoup video conferencing repository
git clone <repository-url>
cd mediasoup-documemtation-repo

# Verify the repository structure
ls -la
```

### 3. Install Project Dependencies

```bash
# Install all required dependencies
npm install

# Verify installation
npm list --depth=0
```

### 4. SSL Certificate Setup

The service requires SSL certificates for HTTPS connections:

```bash
# Create SSL directory if it doesn't exist
mkdir -p ssl

# Generate self-signed certificates (for development)
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes

# For production, use proper SSL certificates from a certificate authority
```

### 5. Configuration Setup

Update the configuration file `src/config.ts`:

```typescript
// Update the announced IP address to your server's public IP
const config: Config = {
  listenIp: '0.0.0.0',
  listenPort: 3016,
  sslCrt: '../ssl/cert.pem',
  sslKey: '../ssl/key.pem',
  mediasoup: {
    // ... other config
    webRtcTransport: {
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: 'YOUR_PUBLIC_IP_ADDRESS' // Update this
        }
      ],
      // ... other transport config
    }
  }
};
```

### 6. Build the Project

```bash
# Build the TypeScript code
npm run build

# Compile the MediaSoup client
npm run compile-mediasoup-client

# Verify build output
ls -la dist/
ls -la public/modules/
```

### 7. Start the Service

```bash
# Start the production server
npm start

# Or start in development mode with hot reload
npm run dev
```

### 8. Access the Application

1. **Open your web browser**
2. **Navigate to**: `https://localhost:3016`
3. **Accept the SSL certificate warning** (for self-signed certificates)
4. **Enter room details**:
   - Room ID: Any unique identifier (e.g., "test-room")
   - User Name: Your display name
5. **Click "Join"** to enter the video conference

## Quick Test

### Single User Test

1. Open the application in your browser
2. Create a room with ID "test-room"
3. Join with your name
4. Enable camera and microphone
5. Verify that local video appears

### Multi-User Test

1. Open the application in two different browser windows/tabs
2. Join the same room ID in both windows
3. Enable camera and microphone in both
4. Verify that remote video appears in each window

## Development Workflow

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# Or use nodemon for automatic restarts
npm run mon
```

### Code Formatting

```bash
# Format code with Prettier
npm run lint
```

### Building for Production

```bash
# Build the entire project
npm run build

# Build frontend separately
npm run build:frontend
```

## Docker Deployment

### Build Docker Image

```bash
# Build the Docker image
npm run docker-build
```

### Run Docker Container

```bash
# Run the container
npm run docker-run

# Start existing container
npm run docker-start

# Stop container
npm run docker-stop
```

## Next Steps

After successful installation:

1. **Read the Architecture Guide** to understand the system design
2. **Review the API Reference** for integration details
3. **Check the Configuration Guide** for customization options
4. **Explore the Deployment Guide** for production setup
5. **Refer to Troubleshooting** if you encounter issues

## Common First-Time Issues

### SSL Certificate Errors

```bash
# If you see SSL errors, regenerate certificates
rm ssl/cert.pem ssl/key.pem
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes
```

### Port Already in Use

```bash
# Check if port 3016 is in use
lsof -i :3016

# Kill the process if needed
kill -9 <PID>
```

### MediaSoup Installation Issues

```bash
# On Windows, consider using WSL
# On Linux, ensure you have build tools
sudo apt-get install build-essential python3
```

## Verification Checklist

- [ ] Node.js v16+ installed
- [ ] Repository cloned successfully
- [ ] Dependencies installed without errors
- [ ] SSL certificates generated/configured
- [ ] Configuration updated with correct IP
- [ ] Project builds successfully
- [ ] Service starts without errors
- [ ] Web interface accessible via HTTPS
- [ ] Camera/microphone permissions granted
- [ ] Local video stream working
- [ ] Room creation/joining functional

## Support

If you encounter issues during installation:

1. Check the [Troubleshooting Guide](troubleshooting.md)
2. Verify all prerequisites are met
3. Review the console logs for error messages
4. Check browser console for client-side errors
5. Ensure firewall settings allow the required ports 
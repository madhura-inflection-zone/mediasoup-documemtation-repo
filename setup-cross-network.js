const https = require('https');
const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Get local IP address
const getLocalIp = () => {
  const ifaces = os.networkInterfaces();
  let localIp = '127.0.0.1';
  
  Object.keys(ifaces).forEach((ifname) => {
    for (const iface of ifaces[ifname]) {
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        continue;
      }
      localIp = iface.address;
      return;
    }
  });
  return localIp;
};

// Get public IP address
const getPublicIp = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.ipify.org',
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data.trim());
      });
    });

    req.on('error', (err) => {
      console.log('❌ Failed to get public IP:', err.message);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout getting public IP'));
    });

    req.end();
  });
};

// Test port connectivity
const testPort = (host, port) => {
  return new Promise((resolve) => {
    const socket = require('net').createConnection(port, host);
    
    socket.setTimeout(3000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
};

// Create .env file
const createEnvFile = (config) => {
  const envContent = `# Cross-Network Media Streaming Configuration
# Generated on ${new Date().toISOString()}

# Network Configuration
PUBLIC_IP=${config.publicIp}
LOCAL_IP=${config.localIp}

# Server Configuration
PORT=3016
RTC_MIN_PORT=10000
RTC_MAX_PORT=10100

# Logging
LOG_LEVEL=debug

# Bitrate Settings
MAX_INCOMING_BITRATE=1500000
INITIAL_OUTGOING_BITRATE=1000000

# STUN Servers (optional)
# STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Created .env file with network configuration');
};

// Main setup function
const setupCrossNetwork = async () => {
  console.log('🌐 Setting up Cross-Network Media Streaming...\n');

  try {
    // Get local IP
    const localIp = getLocalIp();
    console.log(`📱 Local IP: ${localIp}`);

    // Get public IP
    console.log('🌍 Getting public IP...');
    const publicIp = await getPublicIp();
    console.log(`🌍 Public IP: ${publicIp}`);

    // Test local connectivity
    console.log('\n🔍 Testing local connectivity...');
    const localPortOpen = await testPort(localIp, 3016);
    console.log(`📱 Local port 3016: ${localPortOpen ? '✅ Open' : '❌ Closed'}`);

    // Test public connectivity
    console.log('\n🔍 Testing public connectivity...');
    const publicPortOpen = await testPort(publicIp, 3016);
    console.log(`🌍 Public port 3016: ${publicPortOpen ? '✅ Open' : '❌ Closed'}`);

    // Create configuration
    const config = {
      publicIp,
      localIp,
      localPortOpen,
      publicPortOpen
    };

    // Create .env file
    createEnvFile(config);

    // Display setup instructions
    console.log('\n📋 Setup Instructions:');
    console.log('=====================');
    
    if (!publicPortOpen) {
      console.log('\n⚠️  PORT FORWARDING REQUIRED:');
      console.log('1. Access your router admin panel (usually http://192.168.1.1)');
      console.log('2. Find "Port Forwarding" or "Virtual Server" settings');
      console.log('3. Add these rules:');
      console.log(`   - Port 3016 → ${localIp}:3016 (Web Server)`);
      console.log(`   - Ports 10000-10100 → ${localIp}:10000-10100 (WebRTC Media)`);
      console.log('4. Save and restart your router if needed');
    }

    console.log('\n🚀 To start your server:');
    console.log('1. npm start');
    console.log('2. Access locally: http://' + localIp + ':3016');
    console.log('3. Access externally: http://' + publicIp + ':3016');

    console.log('\n📱 Test from different devices:');
    console.log('- Mobile (4G/5G): Disconnect from WiFi and test');
    console.log('- Different network: Test from another location');
    console.log('- Different browser: Chrome, Firefox, Safari, Edge');

    if (!publicPortOpen) {
      console.log('\n💡 Alternative: Use LocalTunnel (no port forwarding needed)');
      console.log('1. npm install -g localtunnel');
      console.log('2. npm start');
      console.log('3. lt --port 3016 --subdomain your-app-name');
    }

    console.log('\n✅ Setup complete! Check CROSS_NETWORK_SETUP.md for detailed instructions.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Manual setup required:');
    console.log('1. Get your public IP from https://whatismyipaddress.com/');
    console.log('2. Create .env file manually');
    console.log('3. Configure port forwarding on your router');
  }
};

// Run setup if called directly
if (require.main === module) {
  setupCrossNetwork();
}

module.exports = { setupCrossNetwork, getLocalIp, getPublicIp, testPort }; 
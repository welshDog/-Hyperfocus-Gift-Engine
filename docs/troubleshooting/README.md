# Troubleshooting Guide

## Table of Contents
1. [Common Issues](#common-issues)
2. [WebSocket Connection Problems](#websocket-connection-problems)
3. [Performance Issues](#performance-issues)
4. [Mobile App Issues](#mobile-app-issues)
5. [Deployment Problems](#deployment-problems)
6. [Debugging Tools](#debugging-tools)
7. [Getting Help](#getting-help)

## Common Issues

### 1. WebSocket Connection Fails
**Symptoms**:
- "Connection failed" or "Disconnected" status
- No real-time updates

**Solutions**:
1. Check if the WebSocket server is running:
   ```bash
   # Check server status
   curl http://localhost:8000/health
   ```
2. Verify network connectivity:
   ```bash
   # Test WebSocket connection
   wscat -c ws://localhost:8000/ws
   ```
3. Check for CORS issues in browser console
4. Verify WebSocket URL in client configuration

### 2. Gift Effects Not Displaying
**Symptoms**:
- Gifts are received but no visual effects
- Console shows WebGL/WebGPU errors

**Solutions**:
1. Check browser compatibility:
   - Open `chrome://gpu` in Chrome
   - Look for "WebGL" and "WebGPU" in the feature status

2. Verify WebGPU support:
   ```javascript
   // In browser console
   if (!navigator.gpu) {
     console.error("WebGPU not supported");
   }
   ```

3. Check for error messages in browser console

## Performance Issues

### 1. High CPU/Memory Usage
**Symptoms**:
- Laggy animations
- Browser becomes unresponsive

**Optimizations**:
1. Reduce particle count in settings
2. Enable "Low Power Mode" in app settings
3. Close other browser tabs
4. Update graphics drivers

### 2. Mobile Performance
**Symptoms**:
- App crashes on mobile
- Overheating issues

**Solutions**:
1. Enable "Battery Saver" mode in app settings
2. Lower graphics quality:
   ```javascript
   // In MobileHyperfocusEngine.js
   const settings = {
     maxParticles: 1000, // Reduce from default 5000
     quality: 'medium',  // Try 'low' for older devices
   };
   ```
3. Update to latest app version

## Mobile App Issues

### 1. App Crashes on Launch
**Troubleshooting Steps**:
1. Clear app cache and data
2. Reinstall the app
3. Check for OS updates
4. Review crash logs:
   ```bash
   # Android
   adb logcat | grep ReactNative
   ```

### 2. Haptic Feedback Not Working
**Solutions**:
1. Check device haptics settings
2. Verify app permissions
3. Test with different vibration patterns

## Deployment Problems

### 1. Docker Container Fails to Start
**Common Issues**:
- Port conflicts
- Volume permissions
- Missing environment variables

**Debugging**:
```bash
# View container logs
docker logs <container_id>

# Inspect container
docker inspect <container_id>

# Check running containers
docker ps -a
```

### 2. SSL Certificate Issues
**Symptoms**:
- Mixed content warnings
- Certificate errors

**Solutions**:
1. Verify certificate chain
2. Check certificate expiration
3. Ensure proper redirects from HTTP to HTTPS

## Debugging Tools

### 1. WebSocket Debugging
```javascript
// Enable debug logging
localStorage.debug = 'socket.io-client:socket';

// Monitor WebSocket frames in Chrome:
// 1. Open DevTools (F12)
// 2. Go to Network tab
// 3. Filter for 'ws'
// 4. Click on WebSocket connection
// 5. View 'Frames' tab
```

### 2. Performance Profiling
```javascript
// Start performance monitoring
const startTime = performance.now();

// Your code here

const endTime = performance.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

### 3. Memory Leak Detection
```javascript
// Check for memory leaks
setInterval(() => {
  console.log('Memory usage:', process.memoryUsage());
}, 10000);
```

## Getting Help

### 1. Collect Debug Information
```bash
# System information
node -v
npm -v
npx envinfo --system --browsers

# App version
cat package.json | grep version
```

### 2. Report an Issue
When reporting issues, please include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Screenshots/videos
4. Console logs
5. Device/browser information

### 3. Community Support
- [GitHub Issues](https://github.com/yourusername/hyperfocus-gift-engine/issues)
- [Discord Community](https://discord.gg/hyperfocus)
- Email: support@hyperfocus.gg

## Known Issues

| Issue | Workaround | Status |
|-------|------------|--------|
| WebGPU not supported on iOS | Fallback to WebGL | Under Review |
| Memory leak on Android | Restart app periodically | Fix in v1.2.0 |
| High CPU usage with many effects | Reduce particle count | Known Limitation |

## Performance Optimization Tips

1. **For Developers**
   - Use Web Workers for heavy computations
   - Implement requestAnimationFrame for animations
   - Optimize 3D models and textures

2. **For Users**
   - Close unused browser tabs
   - Update graphics drivers
   - Use a modern, supported browser

## Emergency Recovery

### Reset App State
```javascript
// In browser console
localStorage.clear();
indexedDB.deleteDatabase('hyperfocus');
```

### Rollback Deployment
```bash
# Revert to previous version
git checkout tags/v1.0.0
docker-compose up -d --force-recreate
```

## Contributing

Found a solution not listed here? Submit a PR!
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This troubleshooting guide is part of the Hyperfocus Gift Engine project.
© 2025 Hyperfocus Team. All rights reserved.

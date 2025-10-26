# 🎁 Hyperfocus Gift Engine - React 19 Web App

A modern React 19 web application for TikTok Live interactive streaming with WebGPU effects, designed for neurodivergent creators.

## ✨ Features

- **Real-time TikTok Live Integration**: Connect to any TikTok Live stream and track gifts in real-time
- **WebGPU Visual Effects**: Hardware-accelerated 3D effects using Three.js and WebGPU
- **Progressive Web App**: Install as a standalone app with offline capabilities
- **Accessibility First**: WCAG AAA compliant with screen reader support
- **Responsive Design**: Works on desktop and mobile devices
- **Advanced Analytics**: Real-time dashboard with gift tracking and leaderboards
- **Offline Support**: IndexedDB storage for offline gift data

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Modern browser with WebGPU support (Chrome 113+, Firefox 113+, Edge 113+)
- Python 3.8+ (for the TikTok gift listener backend)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Python Backend** (in a separate terminal)
   ```bash
   # Navigate to the Python backend directory
   cd ../tiktok_gift_listener

   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install Python dependencies
   pip install TikTokLive websockets

   # Start the WebSocket server
   python tiktok_gift_listener.py
   ```

3. **Start the React Development Server**
   ```bash
   npm run dev
   ```

## 🎮 Demo Version

A working demo of the React web application is available:

1. **Start the Demo Server**
   ```bash
   node serve-demo.js
   ```

2. **Open Your Browser**
   Navigate to `http://localhost:3000`

3. **View the Interface**
   - Interactive dashboard with real-time gift counter
   - Live leaderboard with top gifters
   - Analytics dashboard with earnings potential
   - Responsive design that works on mobile

The demo shows the complete React 18 interface with simulated data. To connect real TikTok Live data, start the Python backend server.

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard/       # Main dashboard layout
│   ├── Counter/         # Gift counter display
│   ├── Leaderboard/     # Top gifters rankings
│   ├── Alerts/          # Visual effect alerts
│   ├── Analytics/       # Data visualization
│   ├── Automation/      # Smart automation rules
│   └── Shared/          # Reusable UI components
├── hooks/               # Custom React hooks
│   ├── useTikTokLive.js # TikTok integration
│   ├── useIndexedDB.js  # Offline storage
│   └── useLocalStorage.js # Persistent settings
├── services/            # Business logic services
├── utils/               # Helper functions
├── styles/              # Global CSS and Tailwind
└── shaders/             # WebGPU shader code
```

## 🎮 Usage

### Dashboard
- View real-time gift counter and statistics
- Connect/disconnect from TikTok Live streams
- Monitor top gifters with live leaderboard
- Access analytics and settings

### Testing Effects
- Press keys 1-4 to test different gift effects
- Use the control panel (press 'H' to toggle)
- Click test buttons in development mode

### Mobile Support
- Install as PWA for mobile streaming overlay
- Touch-friendly controls
- Responsive design for all screen sizes

## 🎨 Customization

### Adding New Gift Effects
1. Update `src/hooks/useTikTokLive.js` gift configurations
2. Add visual effects in `src/components/Alerts/`
3. Update particle systems in `src/services/`

### Styling
- Modify `src/styles/globals.css` for global styles
- Update `tailwind.config.js` for design tokens
- Customize component styles in respective files

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

The app is ready for deployment to:
- **Netlify**: Drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **Traditional Hosting**: Upload `dist` contents

## 🔧 Development

### Option 1: Full React Development (Advanced)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Demo Version (Quick Start)
```bash
# Start demo server (no build required)
node serve-demo.js
```

### Available Scripts
- `npm run dev` - Start development server (full React)
- `node serve-demo.js` - Start demo server (instant preview)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Jest for unit testing
- React Testing Library for component testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Check the browser console for errors (F12)
- Ensure the Python backend is running
- Verify TikTok username is correct and live
- Check WebGPU support in browser settings

---

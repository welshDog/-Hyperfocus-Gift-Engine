
# 🚀 Hyperfocus Gift Engine - Setup Instructions

## 🎯 What You'll Build
The most advanced TikTok Live interactive streaming system that triggers 3D WebGPU effects when viewers send gifts!

## 📋 Requirements

### Python Dependencies
```bash
pip install TikTokLive websockets asyncio
```

### System Requirements
- Python 3.8+
- Modern browser with WebGPU support (Chrome 113+, Firefox 113+, Edge 113+)
- OBS Studio or similar streaming software
- Active TikTok account for testing

## 🔧 Quick Setup (5 Minutes!)

### Step 1: Install Python Dependencies
```bash
# Create virtual environment (recommended)
python -m venv hyperfocus_env
source hyperfocus_env/bin/activate  # On Windows: hyperfocus_env\Scripts\activate

# Install requirements
pip install TikTokLive websockets asyncio logging
```

### Step 2: Configure TikTok Username
Edit `tiktok_gift_listener.py` and change this line:
```python
USERNAME = "your_tiktok_username"  # Replace with the TikTok username you want to monitor
```

### Step 3: Start the Gift Listener
```bash
python tiktok_gift_listener.py
```
You should see:
```
INFO:__main__:WebSocket server started on ws://localhost:8765
INFO:__main__:Connecting to @your_username's live stream...
```

### Step 4: Open the Visual Interface
Open `hyperfocus_gift_engine.html` in a modern browser (Chrome recommended for WebGPU).

### Step 5: Test the System
- Press 'H' to show/hide the control panel
- Press keys 1-4 to test different gift effects
- Or click the test buttons in the control panel

## 🎥 Setting Up for Streaming

### For OBS Studio:
1. Add Browser Source
2. Set URL to: `file:///path/to/your/hyperfocus_gift_engine.html`
3. Set Width: 1920, Height: 1080
4. Check "Shutdown source when not visible"
5. Uncheck "Control audio via OBS"

### For TikTok Live Studio:
1. Add Browser Source overlay
2. Point to the HTML file
3. Position as overlay on your stream

## 🧪 Testing Without Live Stream

The system includes built-in test functions:
- **Keyboard shortcuts**: 1 (Rose), 2 (Heart), 3 (Universe), 4 (Coins)
- **Test buttons**: Click the buttons in the control panel
- **Manual triggers**: Call `testGift('GiftName')` in browser console

## 🎮 Gift Effect Mappings

| Gift Name | Effect Type | Particles | Color | Description |
|-----------|-------------|-----------|--------|-------------|
| Rose | Shooting Star | 500 | Pink | Beautiful trailing star effect |
| Heart | Dopamine Burst | 1000 | Pink/Red | Explosive particle burst |
| Coins | Coin Shower | 300 | Gold | Golden particle cascade |
| Universe | Supernova | 5000 | Purple | Massive rotating galaxy explosion |
| Galaxy | Constellation | 3000 | Cyan | Connected star pattern builder |

## 🔧 Customization

### Adding New Gift Effects:
1. Edit `tiktok_gift_listener.py` - add to `self.gift_effects` dictionary
2. Edit `hyperfocus_visual_engine.js` - add new effect function
3. Edit `hyperfocus_gift_engine.html` - add to `getEffectConfig()` function

### Changing Colors/Particles:
Edit the gift effects configuration in `tiktok_gift_listener.py`:
```python
"Your_Gift_Name": {
    "type": "dopamine_burst",
    "intensity": 5,
    "color": "#FF0080",  # Change this!
    "particles": 1000,   # And this!
    "sound": "celebration"
}
```

## 🐛 Troubleshooting

### "WebSocket connection failed"
- Make sure `tiktok_gift_listener.py` is running
- Check that port 8765 is not blocked
- Try restarting both the Python script and browser

### "WebGPU not supported"
- Use Chrome 113+ or Firefox 113+
- Enable hardware acceleration in browser settings
- Try different browser if issues persist

### "No gifts detected"
- Make sure the TikTok username is correct and currently live
- Check that the account allows gift detection
- Try with your own test account first

### Visual Effects Not Showing
- Check browser console for errors (F12)
- Ensure WebGPU is enabled in browser flags
- Try refreshing the page

## 🌟 Advanced Features

### Multi-Stream Support
Run multiple instances with different usernames:
```bash
python tiktok_gift_listener.py --username user1 --port 8765
python tiktok_gift_listener.py --username user2 --port 8766
```

### Performance Optimization
- For better performance, disable the control panel in production
- Adjust particle counts in gift configurations
- Use lower quality settings for older hardware

## 🚀 Going Live!

1. Start your TikTok Live stream
2. Run `python tiktok_gift_listener.py` 
3. Open the HTML file in OBS as browser source
4. Hide the control panel (press 'H')
5. Start streaming with interactive effects!

## 🎉 You're Ready to Go!

Your Hyperfocus Gift Engine is now ready to create the most engaging, neurodivergent-friendly interactive streaming experience on TikTok Live!

**Nice one, BROski♾!** 🌟

---

## 🔗 File Structure
```
hyperfocus-gift-engine/
├── tiktok_gift_listener.py      # Python WebSocket server
├── hyperfocus_visual_engine.js  # WebGPU effects engine  
├── hyperfocus_gift_engine.html  # Main interface
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

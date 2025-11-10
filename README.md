# VoiceEval Frontend

A sleek, futuristic product dashboard for VoiceEval – an AI-based evaluation and call simulation tool for Voice AI agents.

## Features

- **Modern Dark UI**: Sleek, futuristic design with dark theme
- **Dashboard Loading Animation**: Smooth animated dashboard preview on load
- **API Key Connection**: Secure VAPI API key input with glowing effects
- **Smooth Animations**: Subtle animations and transitions throughout
- **Responsive Design**: Works seamlessly across all device sizes

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Animations**: CSS keyframe animations for smooth effects

## Project Structure

```
voiceeval-frontend/
├── src/
│   ├── components/
│   │   ├── DashboardLoader.jsx    # Dashboard loading animation
│   │   └── ConnectionForm.jsx     # API key input form
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML entry point
├── package.json                   # Dependencies
├── vite.config.js                # Vite configuration
└── tailwind.config.js            # Tailwind configuration
```

## Features in Detail

### Dashboard Loading Animation
- Animated grid preview of dashboard components
- Progress bar with smooth transitions
- Fade-in animations for visual elements

### Connection Form
- Focused input field with glowing border effects
- Real-time visual feedback
- Connection status indicators
- Guest mode option

## Customization

The color scheme and animations can be customized in `tailwind.config.js`. The main colors are:
- `dark-bg`: Background color (#0a0a0a)
- `dark-panel`: Panel background (#1a1a1a)
- `dark-input`: Input field background (#2a2a2a)
- `accent-green`: Accent color (#00ff88)


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
├── public/
│   └── assets/                    # Static assets for build (icons, SVGs)
├── src/
│   ├── api/                       # API integration services
│   │   ├── clients/               # HTTP clients (Axios)
│   │   └── services/              # Domain-specific services
│   ├── components/
│   │   ├── common/                # Reusable UI components
│   │   ├── features/              # Feature-specific components
│   │   └── layout/                # Layout components
│   ├── config/                    # Configuration files
│   ├── data/                      # Static JSON and datasets
│   ├── hooks/                     # Custom React hooks
│   ├── pages/                     # Page components
│   │   ├── Connection/            # Connection & Auth pages
│   │   ├── Dashboard/             # Main dashboard
│   │   ├── Evaluation/            # Evaluation metrics
│   │   └── Workspace/             # Workspace view
│   ├── styles/                    # Global styles (Tailwind CSS)
│   ├── utils/                     # Utility functions
│   ├── App.jsx                    # Main application component
│   └── main.jsx                   # Entry point
├── index.html
├── package.json
├── eslint.config.js
├── postcss.config.js
├── vite.config.js
└── tailwind.config.js
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


# VoiceEval Documentation UI

Comprehensive documentation interface for the VoiceEval platform.

## Structure

```
docs/
├── DocsPage.jsx              # Main documentation page with navigation
├── index.jsx                 # Export file
├── sections/                 # Individual documentation sections
│   ├── VAPIIntegration.jsx
│   ├── ElevenLabsIntegration.jsx
│   └── CartesiaIntegration.jsx
└── README.md                 # This file
```

## Features

### Navigation
- **Left Sidebar**: Hierarchical navigation with sections:
  - Get Started (Introduction, Quick Start, Architecture)
  - Key Concepts (Agents, Test Suites, Evaluation)
  - Platform Integrations (VAPI, ElevenLabs, Cartesia, LiveKit)
  - API Reference (Extraction, Generation, Simulation, Evaluation)

- **Right Sidebar**: "On This Page" navigation for quick section jumping

- **Search**: Global search functionality (Ctrl+K)

### Sections Implemented

#### 1. Introduction
- Overview of VoiceEval platform
- Problem statement and solution
- Key features
- 4-engine pipeline visualization

#### 2. Quick Start
- 5-step getting started guide
- Code examples
- Visual step-by-step instructions

#### 3. Architecture
- Pipeline overview with 4 engines
- Technology stack
- Component descriptions

#### 4. VAPI Integration
- Prerequisites and setup guide
- API key and Assistant ID retrieval
- Connection instructions
- API integration examples
- Troubleshooting guide
- Best practices

#### 5. ElevenLabs Integration
- Webhook configuration
- Agent extraction with workflows
- Call audio downloading
- Observability integration
- Python code examples
- Testing features

#### 6. Cartesia Line Integration
- CLI installation and setup
- Agent creation (templates, AI-generated, from scratch)
- Deployment guide
- Architecture explanation
- Developer tools and commands
- Testing capabilities

## Design System

### Colors
- **Background**: `#0A0A0F` (dark)
- **Borders**: `gray-800/50` (subtle)
- **Primary**: Purple (`purple-600`)
- **Platform Colors**:
  - VAPI: Blue (`blue-600`)
  - ElevenLabs: Orange (`orange-600`)
  - Cartesia: Cyan (`cyan-600`)
  - LiveKit: Green (`green-600`)

### Components

#### SetupStep
Step-by-step guide component with numbered circles.

```jsx
<SetupStep
  number="1"
  title="Step Title"
  description="Step description"
>
  {/* Content */}
</SetupStep>
```

#### CodeBlock
Syntax-highlighted code blocks with copy functionality.

```jsx
<CodeBlock language="bash">
  {`code here`}
</CodeBlock>
```

#### FeatureCard
Highlight key features with icons.

```jsx
<FeatureCard
  icon={<Icon />}
  title="Feature Title"
  description="Feature description"
/>
```

#### TroubleshootingItem
Common issues and solutions.

```jsx
<TroubleshootingItem
  issue="Problem description"
  solution="Solution steps"
/>
```

## Usage

### Adding to App Router

```jsx
import DocsPage from './pages/docs';

// In your router
<Route path="/docs" element={<DocsPage />} />
```

### Adding New Sections

1. Create a new section component in `sections/`:

```jsx
// sections/NewSection.jsx
const NewSection = () => (
  <div className="prose prose-invert max-w-none">
    <h1 className="text-4xl font-bold mb-4">Section Title</h1>
    {/* Content */}
  </div>
);

export default NewSection;
```

2. Import in `DocsPage.jsx`:

```jsx
import NewSection from "./sections/NewSection";
```

3. Add to navigation array:

```jsx
{
  title: "Category",
  items: [
    { id: "new-section", label: "New Section", icon: Icon }
  ]
}
```

4. Add to renderContent switch:

```jsx
case "new-section":
  return <NewSection />;
```

## Styling Guidelines

- Use Tailwind CSS utility classes
- Follow dark theme color scheme
- Maintain consistent spacing (mb-4, mb-8, mb-12)
- Use prose classes for text content
- Add hover states for interactive elements
- Include responsive design (md: breakpoints)

## Best Practices

1. **Consistency**: Use the same component patterns across sections
2. **Accessibility**: Include proper ARIA labels and keyboard navigation
3. **Code Examples**: Always include working, copy-paste ready code
4. **Visual Hierarchy**: Use proper heading levels (h1 → h2 → h3)
5. **External Links**: Open in new tabs with `target="_blank" rel="noopener noreferrer"`
6. **Error Handling**: Include troubleshooting sections
7. **Next Steps**: Guide users to related documentation

## Future Enhancements

- [ ] Add search functionality implementation
- [ ] Add code syntax highlighting library
- [ ] Implement copy-to-clipboard for code blocks
- [ ] Add dark/light theme toggle
- [ ] Create interactive API playground
- [ ] Add video tutorials
- [ ] Implement version selector
- [ ] Add feedback mechanism
- [ ] Create printable PDF export
- [ ] Add multi-language support

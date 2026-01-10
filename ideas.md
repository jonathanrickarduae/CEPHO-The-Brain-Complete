# Design Direction: "Superhuman Neon"

## Core Philosophy
**"Speed, Intelligence, and Pulse."**
We are blending the high-performance, keyboard-centric, minimalist luxury of **Superhuman** with a vibrant, living **Cyberpunk/Neon** identity. The app should feel like a futuristic command center for the mind.

## Visual Identity

### 1. The "Neon Brain" (Central Motif)
- **Concept**: A living, breathing digital organism.
- **Default Color**: AI Pink (#FF10F0).
- **Behavior**:
  - **Idle**: Gentle "breathing" pulse (scale & opacity).
  - **Thinking/Processing**: Rapid, erratic electrical signals.
  - **Mood Reflection**: Changes color based on the user's daily mood score (e.g., Green for high mood, Blue for calm, Red for stress).
- **Style**: Glassmorphism + Neon Glow. Not a static icon, but a WebGL/CSS animated component.

### 2. Color Palette (Dark Mode Native)
- **Background**: Deepest Void Black (#050505) - *Not* pure black, but rich and deep.
- **Surface**: Dark Charcoal (#121212) with subtle transparency.
- **Primary Accent**: AI Pink (#FF10F0).
- **Secondary Accents (Neon Palette)**:
  - Cyan (#00F0FF) - Intelligence/Data
  - Electric Purple (#BD00FF) - Creative
  - Acid Green (#39FF14) - Growth/Success
  - Safety Orange (#FF5F00) - Alerts/Action
- **Text**: Pure White (#FFFFFF) for headings, Light Grey (#A0A0A0) for body.

### 3. Typography
- **Headings**: *Rajdhani* (Bold, Uppercase, Wide Tracking) - Technical, futuristic.
- **Body**: *Inter* or *Space Grotesk* - Clean, legible, high-speed reading.

### 4. Layout & Interaction (The "Superhuman" Feel)
- **Keyboard First**: Every action has a shortcut (Cmd+K command palette is central).
- **Speed**: Instant transitions (0ms delay where possible, or snappy 150ms curves).
- **Density**: High information density but with perfect hierarchy. No wasted whitespace, but no clutter.
- **Lists & Tables**: Clean lines, subtle hover states, mono-spaced numbers.

## Key Modules

### 1. The Brain (Home)
- **Visual**: The Neon Brain takes center stage, floating in a void.
- **Function**: The "Search/Ask" bar is the primary input.
- **Edge Compute Visualization**: Subtle data streams flowing *into* the brain from the edges of the screen, representing local/edge compute power fueling the AI.

### 2. Wellbeing (Daily Check-in)
- **Interaction**: A modal or overlay on login.
- **Input**: 1-10 Slider (Neon styled).
- **Feedback**: The Brain changes color/pulse immediately upon selection.
- **Follow-up**: Chat-style interface for psychology-driven questions.

### 3. Admin Lead Management
- **Style**: Data-heavy, grid-based, high contrast.
- **Features**: "RenewableEnergyLeads" component.
- **Visuals**: Pipeline bars, status pills (neon outlined), realtime counters.

### 4. Pricing/Plans
- **Style**: Minimalist cards, big typography, "Superhuman" luxury.
- **Content**: Tiered plans emphasizing "Edge Compute" and "Collective Intelligence".

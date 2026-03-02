# CEPHO.AI — UX & Design Principles

**Version**: 1.0  
**Status**: Final  
**Owner**: Manus AI

---

## 1. Introduction

This document codifies the official User Experience (UX) and Design Principles for the CEPHO.AI platform. It is derived directly from the design language established in the **Grand Master Plan v11 Live Dashboard** and serves as the single source of truth for all future UI/UX development. The goal is to ensure a consistent, high-quality, and intuitive user experience across the entire platform.

These principles are not suggestions; they are the law. Every new feature, component, and screen must adhere to this specification.

## 2. Core Philosophy: "The Calm Cockpit"

The design philosophy of CEPHO.AI is **"The Calm Cockpit"**. The user is an executive operating at a high level, and the platform is their advanced flight deck. It must be powerful but not overwhelming; information-dense but not cluttered; sophisticated but not complex.

| Principle | Description |
| :--- | :--- |
| **Clarity First** | The user must understand the state of the system and the available actions at a glance. No ambiguity. |
| **Quiet Confidence** | The UI should feel calm, professional, and reliable. It is a tool for serious work, not a social media app. |
| **Effortless Power** | Complex operations should be accessible through simple, intuitive interactions. The user should feel powerful, not burdened. |
| **Intelligent Assistance** | The UI should proactively guide the user, surfacing the right information at the right time. It is a partner, not just a tool. |

## 3. Visual Design Language

The visual language is built on a dark, professional, and focused aesthetic.

### 3.1. Colour Palette

The palette is minimalist and uses colour strategically to convey information.

| Name | Hex | RGB | Usage |
| :--- | :--- | :--- | :--- |
| **Background (`--bg`)** | `#0f1117` | `rgb(15, 17, 23)` | Main app background |
| **Surface (`--surface`)** | `#1a1d27` | `rgb(26, 29, 39)` | Card and component backgrounds |
| **Surface 2 (`--surface2`)** | `#22263a` | `rgb(34, 38, 58)` | Hover states, secondary surfaces |
| **Border (`--border`)** | `#2e3250` | `rgb(46, 50, 80)` | All borders and dividers |
| **Primary Text (`--text`)** | `#e2e8f0` | `rgb(226, 232, 240)` | All primary body and heading text |
| **Muted Text (`--muted`)** | `#8892a4` | `rgb(136, 146, 164)` | Secondary text, placeholders, metadata |
| **Accent (`--accent`)** | `#6c63ff` | `rgb(108, 99, 255)` | Primary interactive elements, links, "In Progress" status |
| **Accent 2 (`--accent2`)** | `#00d4aa` | `rgb(0, 212, 170)` | Secondary accent, highlights |
| **Done (`--done`)** | `#10b981` | `rgb(16, 185, 129)` | "Done" status, success states |
| **Warning (`--warn`)** | `#f59e0b` | `rgb(245, 158, 11)` | "Gap Item" status, warnings |
| **Danger (`--danger`)** | `#ef4444` | `rgb(239, 68, 68)` | Error states, destructive actions |

### 3.2. Typography

Typography is clean, modern, and highly legible.

| Element | Font Family | Font Size | Font Weight | Colour |
| :--- | :--- | :--- | :--- | :--- |
| **Body** | `Inter, system-ui, sans-serif` | `14px` | `400` (Regular) | `--text` |
| **Headings (h1, h2)** | `Inter, system-ui, sans-serif` | `18px` | `600` (Semi-bold) | `--accent` |
| **Card Titles** | `Inter, system-ui, sans-serif` | `16px` | `500` (Medium) | `--text` |
| **Labels / Metadata** | `Inter, system-ui, sans-serif` | `12px` | `400` (Regular) | `--muted` |

### 3.3. Spacing & Layout

Spacing is consistent and generous to promote clarity and reduce cognitive load. The system is built on an **8px grid**. All padding, margins, and component dimensions should be multiples of 8px.

- **Key Spacing Unit**: `1rem` = `16px`
- **Standard Padding**: `16px` (`1rem`)
- **Gaps between elements**: `16px` (`1rem`) or `24px` (`1.5rem`)

### 3.4. Border Radius

Border radius is used to create a soft, modern feel.

| Element | Radius |
| :--- | :--- |
| **Cards / Blocks** | `12px` |
| **Inputs / Buttons** | `8px` |
| **Badges / Tags** | `9999px` (pill-shaped) |

## 4. Component Design

### 4.1. Cards & Panels

- **Background**: `--surface`
- **Border**: `1px solid --border`
- **Padding**: `16px`
- **Box Shadow**: `none`

### 4.2. Buttons

- **Primary**: Background `--accent`, text `--text`, padding `10px 16px`
- **Secondary**: Background `transparent`, border `1px solid --border`, text `--muted`, padding `10px 16px`
- **Hover**: Brighten background by 10% (e.g., `--surface2` for secondary buttons)

### 4.3. Status Indicators

Status is the most important information on the dashboard. It must be instantly recognisable.

| Status | Colour | Interaction |
| :--- | :--- | :--- |
| **Not Started** | `--muted` | Click to cycle to "In Progress" |
| **In Progress** | `--accent` | Click to cycle to "Done" |
| **Done** | `--done` | Click to cycle to "Not Started" |
| **Gap Item** | `--warn` | (Static) Indicates a task added from the gap analysis |

## 5. Interaction & Experience Principles

### 5.1. Feedback

- **Transitions**: All state changes should have a subtle transition (`all 0.2s ease-in-out`).
- **Hover States**: All interactive elements must have a clear hover state.
- **Loading States**: Use skeleton loaders for initial page loads and spinners for in-component actions.

### 5.2. Accessibility (WCAG 2.1 AA)

- **Colour Contrast**: All text must have a minimum contrast ratio of 4.5:1 against its background.
- **Keyboard Navigation**: All interactive elements must be focusable and operable via the keyboard.
- **ARIA Roles**: Use appropriate ARIA attributes to describe roles, states, and properties for screen readers.

### 5.3. Mobile Experience

The platform must be fully responsive and provide a first-class experience on mobile devices. The layout should reflow to a single column, with clear touch targets and no horizontal scrolling.

### 5.4. Emotional Design

The user should feel:

- **In Control**: The system is predictable and responds to their actions.
- **Confident**: The UI is professional, reliable, and error-free.
- **Calm**: The interface is clean, uncluttered, and does not demand unnecessary attention.
- **Empowered**: The tool helps them achieve their goals faster and more effectively.

---

This document is now the **official design system** for CEPHO.AI. It will be added to the repository at `/docs/specs/DESIGN_PRINCIPLES.md` and referenced in the Grand Master Plan v11.

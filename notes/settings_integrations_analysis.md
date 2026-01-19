# Settings Integrations Page Analysis

## Current State
- Shows "Integration Wizard" with cards for various integrations
- Cards show: Google Calendar, Outlook Calendar, Gmail, Notion, Pitch, Gamma, NordVPN, etc.
- Each card has a "Basic", "Standard", or "Advanced" tier label
- Cards are all grey/same color - NO indication of connected vs not connected

## Problem
- Google Calendar IS connected (confirmed on /integrations page)
- But on Settings → Integrations, there's no visual indicator showing it's connected
- User can't tell at a glance what's integrated vs what's not

## Required Fix
- Add visual indicator (green checkmark, "Connected" badge, different card color) for connected integrations
- Should query the integrations.list tRPC endpoint to get connection status
- Apply visual differentiation to connected cards

# Loading & Error Screenshots

Place your captured screenshots here:

## Required Screenshots

### Loading States
- `loading-dashboard.png` - Dashboard with skeleton cards
- `loading-requests.png` - Requests list with skeleton cards
- `loading-users.png` - Users table with skeleton rows
- `loading-request-detail.png` - Individual request skeleton

### Error States
- `error-dashboard.png` - Dashboard error boundary
- `error-requests.png` - Requests error boundary
- `error-users.png` - Users error boundary
- `error-request-detail.png` - Request detail error

### Retry Functionality
- `retry-sequence.gif` - Animated GIF showing error → retry → success
- OR individual frames:
  - `retry-1-error.png` - Error state shown
  - `retry-2-clicking.png` - Cursor on "Try Again" button
  - `retry-3-success.png` - Successfully loaded content

## Screenshot Guidelines

- **Resolution:** At least 1280x720
- **Format:** PNG for screenshots, GIF for animations
- **Browser:** Show URL bar to indicate route
- **Quality:** High quality, no blur
- **Crop:** Remove unnecessary UI elements
- **Annotations:** Optional - add arrows or highlights

## Tools

### Windows
- Snipping Tool (Win + Shift + S)
- ShareX (free, advanced)
- ScreenToGif (for GIFs)

### Mac
- Cmd + Shift + 4 (screenshots)
- Cmd + Shift + 5 (screen recording)
- Kap (for GIFs)

### Linux
- Screenshot utility
- Flameshot (advanced)
- Peek (for GIFs)

## How to Capture

### Loading States
1. Open DevTools (F12)
2. Network tab → "Slow 3G"
3. Navigate to route
4. Quickly capture while skeleton is visible
5. Save with descriptive name

### Error States
1. Network tab → Check "Offline"
2. Refresh page
3. Error boundary appears
4. Capture the full error card
5. Show all buttons and messages

### Retry GIF
1. Start screen recording
2. Show error state
3. Click "Try Again"
4. Show successful load
5. Stop recording
6. Convert to GIF (optimize size)

## Example File Names

Good:
- `loading-dashboard-skeleton.png`
- `error-requests-offline.png`
- `retry-dashboard-sequence.gif`

Bad:
- `screenshot1.png`
- `img.png`
- `temp.gif`

## Current Screenshots

(Add your screenshots here as you capture them)

- [ ] Loading states captured
- [ ] Error states captured
- [ ] Retry sequence captured
- [ ] All files properly named
- [ ] Files added to this directory

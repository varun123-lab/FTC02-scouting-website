# FTC Scouting App - React Web Platform

A mobile-first React web application for scouting FIRST Tech Challenge (FTC) robots during competitions. Built for tablets and smartphones used in the stands and pits.

## 🎯 Features (MVP)

### ✅ Core Functionality
- **Local Storage Authentication** - Per-user data isolation with secure login/registration
- **Comprehensive Scouting Form** - Track autonomous, tele-op, and endgame phases
- **Real-time Score Calculation** - Automatic point calculation based on FTC DECODE 2025-2026 rules
- **Mobile-First Navigation** - Touch-optimized bottom tab bar and responsive design
- **Centralized Dashboard** - View all scouting entries with filtering and sorting
- **Entry Detail Views** - Read-only detailed views of individual scouting reports
- **Dark Mode** - Eye-friendly theme for long competition days
- **Offline-First** - All data stored locally, no internet required

### 📊 Scouting Data Captured (FTC DECODE 2025-2026)
Based on Competition Manual Table 10-2 (Point Values)

#### Autonomous Phase
- **Robot Leave** (3 pts per robot) - Robots leaving starting area
- **Artifacts Classified** (3 pts each) - Artifacts placed in correct classification zone
- **Artifacts Overflow** (1 pt each) - Artifacts placed in overflow area
- **Pattern Match** (2 pts per index) - Matching indexes with MOTIF pattern (0-9)

#### Tele-Op Phase
- **Artifacts Classified** (3 pts each) - Artifacts placed in correct zone
- **Artifacts Overflow** (1 pt each) - Artifacts in overflow
- **Depot Artifacts** (1 pt each) - Artifacts over your depot at end
- **Pattern Match** (2 pts per index) - MOTIF pattern matching
- Cycle tracking for efficiency analysis

#### Endgame / Base Return
- **Base Partial** (5 pts per robot) - Robot partially returned to base
- **Base Full** (10 pts per robot) - Robot fully returned to base
- **Two Robot Bonus** (+10 pts) - Both alliance robots fully returned

#### Additional Metrics
- Performance ratings (Defense, Speed, Driver Skill, Reliability: 1-5 scale)
- Match notes and observations
- Auto path drawing for strategy visualization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open in browser:**
   - Navigate to `http://localhost:3000`
   - For mobile testing on same network: `http://YOUR_IP:3000`

4. **Build for production:**
```bash
npm run build
```

## 📱 Mobile Testing

The app is optimized for mobile devices. To test on your phone/tablet:

1. Ensure your device is on the same WiFi network as your development machine
2. Find your computer's IP address:
   - macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Windows: `ipconfig`
3. Open `http://YOUR_IP:3000` on your mobile device

## 🎨 Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router 6** - Navigation
- **Tailwind CSS** - Styling (mobile-first)
- **Lucide React** - Icon library
- **Local Storage** - Data persistence

## 📖 User Guide

### First Time Setup
1. Register a new account with a username and password
2. Your credentials are stored locally on your device
3. Each scout should create their own account for data isolation

### Scouting a Match
1. Tap the **Scout** button or + icon
2. Fill in team number and match number
3. Select alliance color (Red/Blue)
4. Record autonomous performance using counters
5. Record tele-op performance
6. Record endgame performance
7. Add performance ratings and notes
8. Review the calculated total score
9. Tap **Save Entry**

### Viewing Scouting Data
1. Navigate to **Dashboard** to see all entries
2. Use search to find specific teams or matches
3. Filter by scout or sort by different criteria
4. Tap any entry to view full details

## 🔮 Future Enhancements (Roadmap)

The following features are planned for future releases:

- **Advanced Analytics**
  - Single-team performance averages
  - Current user statistics
  - Cross-team comparisons
  - Historical trend analysis

- **Global Leaderboards**
  - Team rankings by metrics
  - Alliance selection assistance

- **Data Export**
  - CSV export for offline analysis
  - Integration with external tools

- **Enhanced Visualizations**
  - Interactive charts and graphs
  - Performance trends
  - Heat maps

- **Cloud Synchronization** (Optional)
  - Real-time collaboration across devices
  - Team-wide data sharing
  - Backup and restore

- **Auto-Path Drawing**
  - Interactive canvas for drawing robot paths
  - Field overlay for accurate tracking

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BottomNav.tsx   # Mobile navigation
│   └── Layout.tsx      # Page layout wrapper
├── contexts/           # React context providers
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx# Dark mode theme
├── pages/              # Route pages
│   ├── AuthPage.tsx    # Login/Register
│   ├── Dashboard.tsx   # Entry list view
│   ├── ScoutingForm.tsx# Match scouting form
│   ├── EntryDetail.tsx # Entry detail view
│   ├── Analytics.tsx   # Future analytics
│   └── Settings.tsx    # App settings
├── types/              # TypeScript interfaces
├── utils/              # Helper functions
│   ├── storage.ts      # Local storage operations
│   └── scoring.ts      # Score calculations
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 🎯 Scoring Rules (FTC DECODE 2025-2026)

Based on Competition Manual Table 10-2 (Point Values)

### Autonomous Phase
| Action | Points |
|--------|--------|
| Robot Leave (per robot) | 3 pts |
| Artifact Classified | 3 pts each |
| Artifact Overflow | 1 pt each |
| Pattern Match (MOTIF) | 2 pts per index |

**Formula:** `Auto Score = (Leave × 3) + (Classified × 3) + (Overflow × 1) + (Pattern × 2)`

### Tele-Op Phase
| Action | Points |
|--------|--------|
| Artifact Classified | 3 pts each |
| Artifact Overflow | 1 pt each |
| Depot Artifact | 1 pt each |
| Pattern Match (MOTIF) | 2 pts per index |

**Formula:** `Teleop Score = (Classified × 3) + (Overflow × 1) + (Depot × 1) + (Pattern × 2)`

### Endgame / Base Return
| Action | Points |
|--------|--------|
| Robot Partially in Base | 5 pts each |
| Robot Fully in Base | 10 pts each |
| Two Robots Full Bonus | +10 pts |

**Formula:** `Endgame Score = (Full × 10) + (Partial × 5) + (Both Full ? 10 : 0)`

### Total Match Score
**Formula:** `Total = Auto Score + Teleop Score + Endgame Score`

### Additional Scouting Metrics (Non-Point Based)
- Auto path consistency (drawn on interactive canvas)
- Cycle efficiency tracking
- Driver control rating (1-5)
- Defense effectiveness rating (1-5)
- Speed rating (1-5)
- Reliability rating (1-5)

## 🔒 Privacy & Data

- All data is stored locally on your device using browser Local Storage
- No data is transmitted to external servers
- Each user's scouting data is isolated by user ID
- Clearing browser data will delete all scouting entries

## 🤝 Contributing

This is an MVP (Minimum Viable Product). Future contributions welcome for:
- Bug fixes
- UI/UX improvements
- New features from the roadmap
- Performance optimizations

## 📄 License

Built for FTC teams by the robotics community.

## 🆘 Support

For issues or questions:
- Check the in-app Settings > About section
- Review this README
- Contact your team's lead scout or coach

---

**Version:** 1.0.0 MVP  
**Game:** FTC DECODE (2025-2026 Season)  
**Platform:** React Web  
**Last Updated:** December 2025

Happy Scouting! 🤖🏆

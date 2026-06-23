# Task 8: Frontend Planning

The frontend of DevOpsHub is built as a Single Page Application (SPA) using React. It acts as the command center for the entire infrastructure.

---

## 1. UI/UX Inspiration & Aesthetics
- **Theme:** Dark mode by default. Deep blues/grays (e.g., `#0f172a`, `#1e293b`) with neon accents (green for Success, red for Failed).
- **Vibe:** Sleek, technical, and fast. Modeled after Vercel and Railway's dashboards.
- **Micro-interactions:** Skeleton loaders while fetching server stats, fading toasts for notifications, smooth sliding sidebars.

## 2. Component Architecture & Structure
We will use **Vite** with **React (TypeScript)** and **Tailwind CSS**.

### Folder Structure
```text
frontend/
├── src/
│   ├── assets/          # Images, SVGs
│   ├── components/      # Reusable UI elements
│   │   ├── common/      # Button, Input, Modal, Toast
│   │   ├── layout/      # Sidebar, Topbar, AppLayout
│   │   └── charts/      # Recharts wrappers
│   ├── hooks/           # useAuth, useDeployments, useServerStats
│   ├── pages/           # Route components
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Projects/
│   │   ├── Settings/
│   │   └── Deployments/
│   ├── services/        # Axios API clients (api.ts)
│   ├── store/           # Zustand state management
│   ├── utils/           # Date formatters, string helpers
│   ├── App.tsx          # Router setup
│   └── main.tsx         # React root
```

## 3. Core Pages & Layout

### **AppLayout (Shell)**
- **Sidebar (Left):** Navigation links (Dashboard, Projects, Containers, Settings) with active state highlighting.
- **Topbar:** Current user profile, generic search, "New Project" quick action button.
- **Main Content Area:** Renders the active route.

### **Dashboard Page**
- **Cards (Top Row):** Total Projects, Running Containers, Failed Deployments.
- **Charts (Middle Row):** 
  - **CPU Usage:** Line chart (last 1 hour).
  - **RAM Usage:** Donut chart (Used vs Free).
  - *Tech:* Using `Recharts` library.
- **Recent Activity (Bottom Row):** Table showing the last 5 deployment logs.

### **Projects Page**
- **Grid Layout:** Cards for each project showing Name, GitHub icon, Status dot (Green/Red), and a "Deploy" button.
- **New Project Modal:** Form containing GitHub URL, Branch, and Environment Variables.

### **Containers & Logs Page**
- **Containers Table:** Lists ID, Image, Status, Ports.
- **Action Menu:** "..." dropdown to Stop, Restart, or Delete.
- **Terminal Modal:** When "Logs" is clicked, a modal opens using `xterm.js` to stream WebSockets from the backend, simulating a real terminal.

## 4. State Management
- **Local State:** `useState` for modals, form inputs.
- **Global State:** `Zustand` for Authentication (JWT, User Profile) and theme (Dark/Light mode).
- **Server State:** `React Query (TanStack Query)` for fetching projects, polling deployment statuses, and caching.

## 5. Responsive Design & Accessibility
- **Mobile View:** Sidebar collapses into a hamburger menu. Data tables convert to card stacks on small screens.
- **Accessibility (a11y):** All interactive elements will have `aria-labels`. Complete keyboard navigation (Tab-indexing). Focus rings heavily stylized.

# Hub App Development Primer

You are Antigravity. You are about to build a new "Hub App" for this project ecosystem. All Hub Apps must adhere to the core architectural and design standards established by the initial `atl-flight-tracker` application. This ensures a consistent, premium, and seamless user experience across all related applications.

## Technology Stack
- **Frontend Framework:** React 19 utilizing Vite (`@vitejs/plugin-react`).
- **Routing:** `react-router-dom` for client-side navigation.
- **Backend/API:** Node.js Express server providing API endpoints, leveraging `axios` for external requests.
- **Database/Cloud:** Firebase (v12+) and `firebase-admin` for backend tasks like Firestore and Authentication.
- **Styling:** Vanilla CSS using standard global CSS variables and utility classes. **Do not use Tailwind CSS unless explicitly requested.**

## Design System & Aesthetics
The applications must implement a "Premium Dark" aesthetic utilizing glassmorphism, tailored for a mobile-first audience. The primary application container should generally be constrained to a mobile-friendly width (e.g., 500px) and centered.

### Typography
- **Primary Font:** `Inter` (Weights: 300, 400, 500, 600, 700). Imported via Google Fonts.
- **Fallbacks:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

### Color Palette
Define and use these CSS variables at the `:root` level for all styling:

**Backgrounds & Surfaces:**
- `--bg-base`: `#090a0f`
- `--bg-gradient`: `radial-gradient(circle at 50% -20%, #151e32, #090a0f)`
- `--surface-1`: `rgba(255, 255, 255, 0.03)`
- `--surface-2`: `rgba(255, 255, 255, 0.08)`
- `--surface-border`: `rgba(255, 255, 255, 0.05)`
- `--surface-blur`: `blur(16px)`

**Typography Colors:**
- `--text-primary`: `#ffffff`
- `--text-secondary`: `rgba(255, 255, 255, 0.6)`
- `--text-accent`: `#38bdf8` (Soft Blue)

**Status Colors:**
- `--status-on-time` (Success): `#10b981`
- `--status-delayed` (Warning): `#f59e0b`
- `--status-cancelled` (Error): `#ef4444`

### Core CSS Classes & Utilities
When building components, use these standard classes to maintain uniformity:
- **Layout:** `.app-container` (max-width 500px, min-height 100vh, flex-col).
- **Glassmorphism:** `.glass-panel` and `.glass-card`. These rely on `backdrop-filter: var(--surface-blur)` and the surface variables for their background and border.
- **Interactive Elements:**
  - `.btn-primary`: Pill-shaped buttons (`--radius-full`), bold text, with hover/active scale transformations.
  - `.input-field`: Full-width inputs with dark translucent backgrounds, transitioning border colors on focus to `--text-accent`.
- **Typography Utilities:** `.text-xs`, `.text-sm`, `.text-md`, `.text-lg`, `.text-primary`, `.text-secondary`, `.text-accent`.

### Animations & UX
Interactive elements must feel dynamic and responsive:
- **Fade Up:** Use `@keyframes fadeUp` (`transform: translateY(20px)` to `0`, fading opacity from 0 to 1) for components mounting on the screen via the `.animate-fade-up` class.
- **Micro-interactions:** Buttons should scale down slightly (`scale(0.96)`) on click. Glass cards should slightly float up (`translateY(-2px)`) and brighten on hover.
- **Overlays:** Slide-up panels (like chat or filters) should animate smoothly from the bottom using `transform: translateY(100%)` to `transform: translateY(0)`.

## Architecture & Structure
1. **Component Driven:** Break down the UI into logical, reusable components stored within `src/components/`. 
2. **State Management:** Use standard React hooks.
3. **API Separation:** Centralize backend communication logic (e.g., in an `api.js` file) to keep React components clean.
4. **Mobile First UI:** Ensure touch targets are adequately sized and the layout works flawlessly on mobile devices before scaling up to desktop viewing.

## Your Task When Initiating a New Hub App
When given a prompt to create a new Hub App using this primer:
1. Initialize the UI using the exact CSS variables and principles listed above.
2. Build the foundational components (Headers, Cards, Buttons, Inputs) utilizing the established glassmorphism classes.
3. Ensure the design looks highly polished, dynamic, and "premium" from the very first iteration, completely avoiding plain/generic defaults.

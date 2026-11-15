/**
 * Route map = the Phase 4 design boards.
 * `area`: 'public' (no login, no shell), 'auth' (login flow), 'app' (logged-in shell),
 *         'alert' (full-screen alert flow).
 */
export const routes = [
  // 1. Get in
  { id: '1.2', path: '/login', title: 'Log in', area: 'auth' },
  { id: '1.3', path: '/forgot-password', title: 'Forgot password', area: 'auth' },
  { id: '1.4', path: '/signup', title: 'Sign up', area: 'auth' },
  { id: '1.5', path: '/verify', title: 'Verify phone (OTP)', area: 'auth' },
  { id: '1.6', path: '/create-password', title: 'Create password', area: 'auth' },
  // 2. First run
  { id: '2.1', path: '/permissions', title: 'Permissions', area: 'auth' },
  { id: '2.2', path: '/circle', title: 'My circle', area: 'app', tab: 'Circle' },
  { id: '2.3', path: '/circle/new', title: 'Add contact', area: 'app', tab: 'Circle' },
  { id: '2.4', path: '/', title: 'Dashboard', area: 'app', tab: 'Home' },
  // 3. Raising an alert
  { id: '3.1', path: '/alert/countdown', title: 'Cancel window', area: 'alert' },
  { id: '3.2', path: '/alert/:id', title: 'Live alert status', area: 'alert' },
  { id: '3.4', path: '/alert/:id/confirm', title: 'Confirm it is you', area: 'alert' },
  // 4. Safe-Walk
  { id: '4.1', path: '/walk', title: 'Safe-Walk setup', area: 'app', tab: 'Walk' },
  { id: '4.2', path: '/walk/active', title: 'Safe-Walk in progress', area: 'app', tab: 'Walk' },
  { id: '4.3', path: '/walk/grace', title: 'Grace prompt', area: 'alert' },
  { id: '4.4', path: '/walk/done', title: 'Walk ended safely', area: 'app', tab: 'Walk' },
  // 5. History and settings
  { id: '5.1', path: '/history', title: 'History', area: 'app', tab: 'History' },
  { id: '5.2', path: '/history/:id', title: 'Alert details', area: 'app', tab: 'History' },
  { id: '5.3', path: '/settings', title: 'Settings', area: 'app', tab: 'Settings' },
  // 6. What contacts see (public, no login)
  { id: '6.1', path: '/c/:token', title: 'Invite', area: 'public' },
  { id: '6.2', path: '/t/:token', title: 'Live tracking', area: 'public' },
  { id: '6.3', path: '/c/:token/optout', title: 'Opt-out confirmed', area: 'public' },
];

export const tabs = [
  { label: 'Home', to: '/' },
  { label: 'Circle', to: '/circle' },
  { label: 'Walk', to: '/walk' },
  { label: 'History', to: '/history' },
  { label: 'Settings', to: '/settings' },
];
import { NavLink, Outlet } from 'react-router-dom';
import { tabs } from '../routes.js';

const linkClass = ({ isActive }) =>
  `flex min-h-touch items-center justify-center rounded-btn px-3 text-sm font-semibold ${
    isActive ? 'bg-primary text-ink' : 'text-ink-muted hover:text-ink'
  }`;

/** Bottom tab bar on phones, 248 px side menu from md up (per the component sheet). */
export default function AppShell() {
  return (
    <div className="flex h-full flex-col md:flex-row">
      <nav
        aria-label="Main"
        className="order-2 flex justify-around border-t border-line bg-surface p-2 md:order-1 md:w-[248px] md:flex-col md:justify-start md:gap-1 md:border-r md:border-t-0 md:p-4"
      >
        <p className="mb-4 hidden px-3 text-lg font-bold md:block">Help Alarm</p>
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'} className={linkClass}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <main className="order-1 flex-1 overflow-y-auto md:order-2">
        <Outlet />
      </main>
    </div>
  );
} 

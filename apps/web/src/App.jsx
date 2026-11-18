import { Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import Placeholder from './pages/Placeholder.jsx';
import { routes } from './routes.js';

const page = (r) => <Placeholder id={r.id} title={r.title} />;
const byArea = (area) => routes.filter((r) => r.area === area);

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {byArea('app').map((r) => (
          <Route key={r.id} path={r.path} element={page(r)} />
        ))}
      </Route>
      {[...byArea('auth'), ...byArea('alert'), ...byArea('public')].map((r) => (
        <Route key={r.id} path={r.path} element={page(r)} />
      ))}
      <Route path="*" element={<Placeholder id="-" title="Page not found" />} />
    </Routes>
  );
}
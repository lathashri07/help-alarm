import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { routes } from './routes.js';

test('every design board has a unique route', () => {
  const ids = routes.map((r) => r.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('login board renders', () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByText('Log in')).toBeTruthy();
});
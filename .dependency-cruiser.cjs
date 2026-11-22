/**
 * Enforces the Phase 3 module boundaries. CI fails if anyone breaks them.
 * Rule 1: a module may import another module ONLY through its index.js.
 * Rule 2: a module may import only the modules listed in ALLOWED (who may call whom).
 * Rule 3: platform never imports a module.  Rule 4: no circular imports.
 */
const ALLOWED = {
  identity: [],
  notifications: [],
  contacts: [],
  alerts: ['identity'],
  tracking: ['alerts', 'safewalk'],
  safewalk: ['alerts', 'identity', 'notifications'],
  escalation: ['alerts', 'contacts', 'notifications', 'tracking', 'identity'],
  history: ['alerts', 'escalation', 'notifications', 'tracking'],
};
const ALL = Object.keys(ALLOWED);

const callMatrixRules = ALL.map((name) => {
  const forbidden = ALL.filter((m) => m !== name && !ALLOWED[name].includes(m));
  return {
    name: `${name}-may-not-call-${forbidden.length ? 'others' : 'none'}`,
    comment: `${name} may only call: platform${ALLOWED[name].map((m) => ', ' + m).join('')}`,
    severity: 'error',
    from: { path: `^apps/api/src/modules/${name}/` },
    to: { path: forbidden.length ? `^apps/api/src/modules/(${forbidden.join('|')})/` : '^$never$' },
  };
});

module.exports = {
  forbidden: [
    {
      name: 'only-through-index',
      comment: 'Import another module via its index.js only.',
      severity: 'error',
      from: { path: '^apps/api/src/modules/([^/]+)/' },
      to: {
        path: '^apps/api/src/modules/(?!$1/)[^/]+/(?!index\\.js$)',
        pathNot: '/http/routes\\.js$',
      },
    },
    {
      name: 'platform-is-below-modules',
      severity: 'error',
      from: { path: '^apps/api/src/platform/' },
      to: { path: '^apps/api/src/modules/' },
    },
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    ...callMatrixRules,
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.test\\.js$' },
  },
};
export interface ModuleNavItem {
  id: string;
  title: string;
  route: string;
  icon: 'dashboard' | 'script' | 'editorial' | 'language';
  description: string;
}

export const MODULE_NAV_ITEMS: ModuleNavItem[] = [
  {
    id: 'overview',
    title: 'Command Center',
    route: '/',
    icon: 'dashboard',
    description: 'Pipeline KPIs, validation health, and active work queue',
  },
  {
    id: 'script-generator',
    title: 'Script Generator',
    route: '/script-generator',
    icon: 'script',
    description: 'Author input, JoVE-structured draft, and validation report',
  },
  {
    id: 'editorial',
    title: 'Editorial Queue',
    route: '/editorial',
    icon: 'editorial',
    description: 'Incoming manuscript drafts and revision readiness',
  },
  {
    id: 'localization',
    title: 'Localization Review',
    route: '/localization',
    icon: 'language',
    description: 'Translated assets, glossary QA, and template preservation',
  },
];

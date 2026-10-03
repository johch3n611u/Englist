import type { ViewRenderer } from './types';

export type RouteMap = Record<string, ViewRenderer>;

export function createRouter(routes: RouteMap, container: HTMLElement) {
  function navigate(hash: string) {
    const view = hash.replace('#/', '') || 'home';
    const renderer = routes[view] ?? routes['home'];
    container.innerHTML = '';
    renderer(container);
    window.location.hash = hash;
  }

  function handleHashChange() {
    navigate(window.location.hash || '#/home');
  }

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange();

  return {
    navigate(hash: string) { navigate(hash); },
    destroy() { window.removeEventListener('hashchange', handleHashChange); },
  };
}

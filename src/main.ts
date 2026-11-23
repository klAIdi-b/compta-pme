import { mount } from 'svelte';
import App from './ui/App.svelte';
import './ui/theme.css';
import { capturerRetourConnexion } from './io/simulation-session';
import { APERCU } from './io/espace';

// Retour de la connexion de l'enseignant au simulateur en ligne : à lire avant que l'application n'utilise l'adresse.
capturerRetourConnexion();

const target = document.getElementById('app');
if (!target) throw new Error('Élément #app introuvable');

export default mount(App, { target });

// Site de prévisualisation : bandeau visible, pas d'indexation ; pas de mode hors ligne (réservé au site des élèves).
if (APERCU) {
  const meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex';
  document.head.append(meta);
  const bandeau = document.createElement('div');
  bandeau.textContent = 'Prévisualisation · version à valider, non visible des élèves';
  bandeau.setAttribute('role', 'status');
  bandeau.style.cssText =
    'position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:1000;background:#11304d;color:#fff;' +
    'font:600 13px system-ui,sans-serif;padding:6px 14px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);pointer-events:none';
  document.body.append(bandeau);
}

// Fonctionnement hors ligne, uniquement sur le site publié.
if (import.meta.env.PROD && !APERCU && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    /* le site reste utilisable en ligne */
  });
}

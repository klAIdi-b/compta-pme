import { mount } from 'svelte';
import App from './ui/App.svelte';
import './ui/theme.css';
import { capturerRetourConnexion } from './io/simulation-session';

// Retour de la connexion de l'enseignant au simulateur en ligne : à lire avant que l'application n'utilise l'adresse.
capturerRetourConnexion();

const target = document.getElementById('app');
if (!target) throw new Error('Élément #app introuvable');

export default mount(App, { target });

// Fonctionnement hors ligne, uniquement sur le site publié.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    /* le site reste utilisable en ligne */
  });
}

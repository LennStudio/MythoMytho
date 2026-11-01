import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * Production : enregistre le service worker (cache hors ligne).
 * Développement (`expo start`) : AUCUN service worker, et on supprime ceux d'un essai précédent. Un service worker actif
 * en dev sert des pages et des bundles périmés (rechargement à chaud cassé, page figée après une correction).
 */
const SW_SCRIPT =
  process.env.NODE_ENV === 'production'
    ? "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}"
    : "if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})});if(window.caches){caches.keys().then(function(k){k.forEach(function(n){caches.delete(n)})})}}";

/** Shell HTML du rendu web statique : métadonnées PWA et enregistrement du service worker. */
export default function Root({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#10161a" />
        <meta name="description" content="MythoMytho — jeu de mots et de bluff entre amis, hors ligne." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon-apple-touch.png" />
        <ScrollViewStyleReset />
        {/* La police titre Sirelia a des ligatures vides (« ca », « eu »…) : on les désactive, comme l'ancienne version. */}
        <style dangerouslySetInnerHTML={{ __html: '*{font-variant-ligatures:none}' }} />
        <script dangerouslySetInnerHTML={{ __html: SW_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

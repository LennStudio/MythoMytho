import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

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
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

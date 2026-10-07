import React from 'react';
import { createServer } from 'vite';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const origin = 'https://jobfinderai.app';
const server = await createServer({ root, configFile: false, envDir: false, server: { middlewareMode: true }, appType: 'custom' });

try {
  const { default: Landing } = await server.ssrLoadModule('/src/public/Landing.jsx');
  let html = await readFile(path.join(root, 'index.html'), 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error('Expected an empty root in the public HTML shell.');
  if (!html.includes(origin)) throw new Error('Canonical and social metadata must use the production origin.');

  const markup = React.createElement(Landing);
  const { renderToString } = await import('react-dom/server');
  const rendered = renderToString(markup).replace(/ style="(?:outline:none|animation-duration:0s)"/g, '');
  const manifest = JSON.parse(await readFile(path.join(dist, '.vite', 'manifest.json'), 'utf8'));
  const appEntry = manifest['index.html'];
  if (!appEntry?.isEntry || !appEntry.file) throw new Error('Missing built public application entry.');
  const css = new Set();
  const visited = new Set();
  function collect(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const entry = manifest[key];
    if (!entry) throw new Error(`Missing public build entry: ${key}`);
    for (const item of entry.css || []) css.add(item);
    for (const item of entry.imports || []) collect(item);
  }
  collect('index.html');
  html = html.replace('</head>', `${[...css].map(item => `<link rel="stylesheet" href="/${item}" />`).join('\n')}\n</head>`);
  html = html.replace('<script type="module" src="/src/entry.jsx"></script>', `<script type="module" crossorigin src="/${appEntry.file}"></script>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${rendered}</div>`);
  await writeFile(path.join(dist, 'index.html'), html);

  const stylesheet = [...css].find(item => item.endsWith('.css'));
  if (!stylesheet) throw new Error('Expected a self-hosted public stylesheet.');
  await writeFile(path.join(dist, '404.html'), `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#eef3fa"><title>Page not found — JobFinderAI</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/${stylesheet}"></head>
<body><div class="launch-page"><header class="launch-nav"><a class="launch-wordmark" href="/" aria-label="JobFinderAI home">JobFinder<span>AI</span></a><a class="launch-signin" href="mailto:hello@jobfinderai.app">Request access</a></header><main class="launch-404"><p class="launch-section-label">404</p><h1>That page isn’t available here.</h1><p>This is the public JobFinderAI website. The private application isn’t available from this site.</p><p><a class="ui-button ui-button-primary ui-button-md" href="/">Return to the homepage</a></p><p><a class="launch-text-link" href="mailto:hello@jobfinderai.app">hello@jobfinderai.app</a></p></main></div></body></html>\n`);

  await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>\n`);
  await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  await rm(path.join(dist, '.vite'), { recursive: true, force: true });
  console.log(`Rendered standalone public site for ${origin}.`);
} finally {
  await server.close();
}

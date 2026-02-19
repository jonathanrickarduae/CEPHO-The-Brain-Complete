/**
 * Vite Plugin for CSP Nonce Injection
 * Injects nonce placeholders into script tags during build
 */

import type { Plugin } from 'vite';

export function cspNoncePlugin(): Plugin {
  return {
    name: 'vite-plugin-csp-nonce',
    transformIndexHtml(html) {
      // Add nonce placeholder to inline scripts
      html = html.replace(
        /<script(?!\s+(?:src|nonce)=)/g,
        '<script nonce="{{CSP_NONCE}}"'
      );
      
      return html;
    },
  };
}

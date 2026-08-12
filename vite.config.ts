import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// https://vite.dev/config/
function localSocketServer() {
  return {
    name: 'local-socket-server',
    async configureServer(server: any) {
      const { WebSocketServer } = await import('ws');
      const wss = new WebSocketServer({ noServer: true });
      const clientRoles = new Map<any, 'controller' | 'overlay'>();

      const broadcastOverlayCount = () => {
        let count = 0;
        clientRoles.forEach((role) => { if (role === 'overlay') count++; });
        const msg = JSON.stringify({ type: 'client_count', count });
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1 && clientRoles.get(client) === 'controller') {
            client.send(msg);
          }
        });
      };

      server.httpServer.on('upgrade', (request: any, socket: any, head: any) => {
        if (request.url === '/ws-relay') {
          wss.handleUpgrade(request, socket, head, (ws: any) => {
            wss.emit('connection', ws, request);
          });
        }
      });

      wss.on('connection', (ws: any) => {
        clientRoles.set(ws, 'overlay');
        broadcastOverlayCount();

        ws.on('message', (message: any) => {
          try {
            const data = JSON.parse(message.toString());
            if (data.type === 'register') {
              clientRoles.set(ws, data.role === 'controller' ? 'controller' : 'overlay');
              broadcastOverlayCount();
              return;
            }
          } catch (_) { /* not JSON */ }

          wss.clients.forEach((client: any) => {
            if (client !== ws && client.readyState === 1) {
              client.send(message.toString());
            }
          });
        });

        ws.on('close', () => {
          clientRoles.delete(ws);
          broadcastOverlayCount();
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [
    localSocketServer(),
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'express',
                'ws',
                'http',
                'https',
                'net',
                'tty',
                'os',
                'path',
                'fs',
                'stream',
                'events',
                'util',
                'url',
                'zlib',
                'crypto',
                'buffer',
                'querystring',
                'assert',
                'child_process',
              ]
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
      }
    ]),
    renderer(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'build.png'],
      manifest: {
        name: 'StreamBible',
        short_name: 'StreamBible',
        description: 'Multilingual lower-third Bible verse overlays.',
        theme_color: '#0A84FF',
        background_color: '#0E0E11',
        display: 'standalone',
        icons: [
          {
            src: 'build.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'build.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallbackDenylist: [
          /^\/sitemap\.xml$/,
          /^\/sitemap_index\.xml$/,
          /^\/sitemap_fresh\.xml$/,
          /^\/robots\.txt$/,
          /^\/google.*\.html$/
        ]
      }
    })
  ],
})

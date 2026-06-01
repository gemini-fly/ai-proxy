/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import react from '@vitejs/plugin-react';
import { defineConfig, transformWithEsbuild } from 'vite';
import pkg from '@douyinfe/vite-plugin-semi';
import path from 'path';
import { codeInspectorPlugin } from 'code-inspector-plugin';
const { vitePluginSemi } = pkg;
const siteRegion = process.env.VITE_SITE_REGION === 'global' ? 'global' : 'cn';
const siteMeta = {
  cn: {
    title: '闪域',
    description:
      '闪域 - 国内AI模型API代理平台，支持阿里通义、Qwen、豆包、火山方舟等主流模型，一站式管理分发',
  },
  global: {
    title: '闪域',
    description:
      '闪域 - 国内外AI模型API代理平台，支持OpenAI、Claude、Gemini、阿里通义、Qwen、豆包、火山方舟等主流模型，一站式管理分发',
  },
};
const siteContentPath = path.resolve(
  __dirname,
  `./src/config/siteContent.${siteRegion}.jsx`,
);
const siteRegionPath = path.resolve(
  __dirname,
  `./src/config/siteRegion.${siteRegion}.jsx`,
);
const i18nResourcesPath = path.resolve(
  __dirname,
  `./src/i18n/resources.${siteRegion}.js`,
);
const regionalPagesPath = path.resolve(
  __dirname,
  `./src/config/regionalPages.${siteRegion}.jsx`,
);
const consoleRoutesPath = path.resolve(
  __dirname,
  `./src/config/consoleRoutes.${siteRegion}.jsx`,
);
const sidebarConfigPath = path.resolve(
  __dirname,
  `./src/config/sidebarConfig.${siteRegion}.js`,
);
const sidebarDefaultsPath = path.resolve(
  __dirname,
  `./src/config/sidebarDefaults.${siteRegion}.js`,
);

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@siteContent': siteContentPath,
      '@siteRegion': siteRegionPath,
      '@i18nResources': i18nResourcesPath,
      '@regionalPages': regionalPagesPath,
      '@consoleRoutes': consoleRoutesPath,
      '@sidebarConfig': sidebarConfigPath,
      '@sidebarDefaults': sidebarDefaultsPath,
    },
  },
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',
    }),
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!/src\/.*\.js$/.test(id)) {
          return null;
        }

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react(),
    vitePluginSemi({
      cssLayer: true,
    }),
    {
      name: 'site-region-html-meta',
      transformIndexHtml(html) {
        return html
          .replaceAll('%SITE_TITLE%', siteMeta[siteRegion].title)
          .replaceAll('%SITE_DESCRIPTION%', siteMeta[siteRegion].description);
      },
    },
  ],
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.json': 'json',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          'semi-ui': ['@douyinfe/semi-icons', '@douyinfe/semi-ui'],
          tools: ['axios', 'history', 'marked'],
          'react-components': [
            'react-dropzone',
            'react-fireworks',
            'react-telegram-login',
            'react-toastify',
            'react-turnstile',
          ],
          i18n: [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
          ],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5566,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/mj': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/pg': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

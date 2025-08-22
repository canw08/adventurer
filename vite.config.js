import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';
import Layouts from 'vite-plugin-vue-layouts';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from 'unplugin-vue-components/resolvers';
import { viteMockServe } from 'vite-plugin-mock';

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      vue(),

      Pages({
        dirs: 'src/pages',
        extensions: ['vue'],
      }),

      Layouts({
        layoutsDirs: 'src/layouts',
        defaultLayout: 'default',
      }),

      Components({
        resolvers: [PrimeVueResolver()],
      }),

      viteMockServe({
        mockPath: 'mock',
        localEnabled: command === 'serve' && mode !== 'realapi',
        logger: true,
        injectCode: `
          import { setupProdMockServer } from './mock/_createProdMockServer';
          setupProdMockServer();
        `,
      }),
    ],

    // 🔥 本地开发代理：/api 转发到 Django
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000', // Django 本地运行端口
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

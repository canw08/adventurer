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
  };
});

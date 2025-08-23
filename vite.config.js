import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';
import Layouts from 'vite-plugin-vue-layouts';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from 'unplugin-vue-components/resolvers';
import { viteMockServe } from 'vite-plugin-mock';

export default defineConfig(({ command, mode }) => {
  const useMock = command === 'serve' && mode !== 'realapi'; // dev 且不是 realapi 才启用 mock

  return {
    plugins: [
      vue(),

      Pages({ dirs: 'src/pages', extensions: ['vue'] }),

      Layouts({ layoutsDirs: 'src/layouts', defaultLayout: 'default' }),

      Components({ resolvers: [PrimeVueResolver()] }),

      // 只有 useMock 为 true 时才把插件插进去
      useMock &&
        viteMockServe({
          mockPath: 'mock',
          localEnabled: true,           // 既然只在这里注入，直接 true 即可
          prodEnabled: false,           // 生产绝不注入
          logger: true,
          injectCode: `
            import { setupProdMockServer } from './mock/_createProdMockServer';
            setupProdMockServer();
          `,
        }),
    ].filter(Boolean),

    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
          // 把 /api 前缀去掉 -> /users/、/tasks/...
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});

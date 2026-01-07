// vite.config.js
import { defineConfig } from "file:///D:/2%E5%92%B1%E7%9A%84%E5%B7%A5%E7%A8%8B/%E5%86%92%E9%99%A9%E8%80%85%E5%8D%8F%E4%BC%9A/%E5%89%8D%E7%AB%AF/adventurer/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/2%E5%92%B1%E7%9A%84%E5%B7%A5%E7%A8%8B/%E5%86%92%E9%99%A9%E8%80%85%E5%8D%8F%E4%BC%9A/%E5%89%8D%E7%AB%AF/adventurer/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Pages from "file:///D:/2%E5%92%B1%E7%9A%84%E5%B7%A5%E7%A8%8B/%E5%86%92%E9%99%A9%E8%80%85%E5%8D%8F%E4%BC%9A/%E5%89%8D%E7%AB%AF/adventurer/node_modules/vite-plugin-pages/dist/index.js";
import Layouts from "file:///D:/2%E5%92%B1%E7%9A%84%E5%B7%A5%E7%A8%8B/%E5%86%92%E9%99%A9%E8%80%85%E5%8D%8F%E4%BC%9A/%E5%89%8D%E7%AB%AF/adventurer/node_modules/vite-plugin-vue-layouts/dist/index.mjs";
import Components from "file:///D:/2%E5%92%B1%E7%9A%84%E5%B7%A5%E7%A8%8B/%E5%86%92%E9%99%A9%E8%80%85%E5%8D%8F%E4%BC%9A/%E5%89%8D%E7%AB%AF/adventurer/node_modules/unplugin-vue-components/dist/vite.js";
import { PrimeVueResolver } from "file:///D:/2%E5%92%B1%E7%9A%84%E5%B7%A5%E7%A8%8B/%E5%86%92%E9%99%A9%E8%80%85%E5%8D%8F%E4%BC%9A/%E5%89%8D%E7%AB%AF/adventurer/node_modules/unplugin-vue-components/dist/resolvers.js";
import { viteMockServe } from "file:///D:/2%E5%92%B1%E7%9A%84%E5%B7%A5%E7%A8%8B/%E5%86%92%E9%99%A9%E8%80%85%E5%8D%8F%E4%BC%9A/%E5%89%8D%E7%AB%AF/adventurer/node_modules/vite-plugin-mock/dist/index.mjs";
var vite_config_default = defineConfig(({ command, mode }) => {
  const useMock = command === "serve" && mode !== "realapi";
  return {
    plugins: [
      vue(),
      Pages({ dirs: "src/pages", extensions: ["vue"] }),
      Layouts({ layoutsDirs: "src/layouts", defaultLayout: "default" }),
      Components({ resolvers: [PrimeVueResolver()] }),
      // 只有 useMock 为 true 时才把插件插进去
      useMock && viteMockServe({
        mockPath: "mock",
        localEnabled: true,
        // 既然只在这里注入，直接 true 即可
        prodEnabled: false,
        // 生产绝不注入
        logger: true,
        injectCode: `
            import { setupProdMockServer } from './mock/_createProdMockServer';
            setupProdMockServer();
          `
      })
    ].filter(Boolean),
    server: {
      proxy: {
        "/api": {
          target: "http://127.0.0.1:8000",
          changeOrigin: true,
          secure: false,
          // 把 /api 前缀去掉 -> /users/、/tasks/...
          rewrite: (path) => path.replace(/^\/api/, "")
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFwyXHU1NEIxXHU3Njg0XHU1REU1XHU3QTBCXFxcXFx1NTE5Mlx1OTY2OVx1ODAwNVx1NTM0Rlx1NEYxQVxcXFxcdTUyNERcdTdBRUZcXFxcYWR2ZW50dXJlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcMlx1NTRCMVx1NzY4NFx1NURFNVx1N0EwQlxcXFxcdTUxOTJcdTk2NjlcdTgwMDVcdTUzNEZcdTRGMUFcXFxcXHU1MjREXHU3QUVGXFxcXGFkdmVudHVyZXJcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LzIlRTUlOTIlQjElRTclOUElODQlRTUlQjclQTUlRTclQTglOEIvJUU1JTg2JTkyJUU5JTk5JUE5JUU4JTgwJTg1JUU1JThEJThGJUU0JUJDJTlBLyVFNSU4OSU4RCVFNyVBQiVBRi9hZHZlbnR1cmVyL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IFBhZ2VzIGZyb20gJ3ZpdGUtcGx1Z2luLXBhZ2VzJztcclxuaW1wb3J0IExheW91dHMgZnJvbSAndml0ZS1wbHVnaW4tdnVlLWxheW91dHMnO1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJztcclxuaW1wb3J0IHsgUHJpbWVWdWVSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycyc7XHJcbmltcG9ydCB7IHZpdGVNb2NrU2VydmUgfSBmcm9tICd2aXRlLXBsdWdpbi1tb2NrJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kLCBtb2RlIH0pID0+IHtcclxuICBjb25zdCB1c2VNb2NrID0gY29tbWFuZCA9PT0gJ3NlcnZlJyAmJiBtb2RlICE9PSAncmVhbGFwaSc7IC8vIGRldiBcdTRFMTRcdTRFMERcdTY2MkYgcmVhbGFwaSBcdTYyNERcdTU0MkZcdTc1MjggbW9ja1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICB2dWUoKSxcclxuXHJcbiAgICAgIFBhZ2VzKHsgZGlyczogJ3NyYy9wYWdlcycsIGV4dGVuc2lvbnM6IFsndnVlJ10gfSksXHJcblxyXG4gICAgICBMYXlvdXRzKHsgbGF5b3V0c0RpcnM6ICdzcmMvbGF5b3V0cycsIGRlZmF1bHRMYXlvdXQ6ICdkZWZhdWx0JyB9KSxcclxuXHJcbiAgICAgIENvbXBvbmVudHMoeyByZXNvbHZlcnM6IFtQcmltZVZ1ZVJlc29sdmVyKCldIH0pLFxyXG5cclxuICAgICAgLy8gXHU1M0VBXHU2NzA5IHVzZU1vY2sgXHU0RTNBIHRydWUgXHU2NUY2XHU2MjREXHU2MjhBXHU2M0QyXHU0RUY2XHU2M0QyXHU4RkRCXHU1M0JCXHJcbiAgICAgIHVzZU1vY2sgJiZcclxuICAgICAgICB2aXRlTW9ja1NlcnZlKHtcclxuICAgICAgICAgIG1vY2tQYXRoOiAnbW9jaycsXHJcbiAgICAgICAgICBsb2NhbEVuYWJsZWQ6IHRydWUsICAgICAgICAgICAvLyBcdTY1RTJcdTcxMzZcdTUzRUFcdTU3MjhcdThGRDlcdTkxQ0NcdTZDRThcdTUxNjVcdUZGMENcdTc2RjRcdTYzQTUgdHJ1ZSBcdTUzNzNcdTUzRUZcclxuICAgICAgICAgIHByb2RFbmFibGVkOiBmYWxzZSwgICAgICAgICAgIC8vIFx1NzUxRlx1NEVBN1x1N0VERFx1NEUwRFx1NkNFOFx1NTE2NVxyXG4gICAgICAgICAgbG9nZ2VyOiB0cnVlLFxyXG4gICAgICAgICAgaW5qZWN0Q29kZTogYFxyXG4gICAgICAgICAgICBpbXBvcnQgeyBzZXR1cFByb2RNb2NrU2VydmVyIH0gZnJvbSAnLi9tb2NrL19jcmVhdGVQcm9kTW9ja1NlcnZlcic7XHJcbiAgICAgICAgICAgIHNldHVwUHJvZE1vY2tTZXJ2ZXIoKTtcclxuICAgICAgICAgIGAsXHJcbiAgICAgICAgfSksXHJcbiAgICBdLmZpbHRlcihCb29sZWFuKSxcclxuXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL2FwaSc6IHtcclxuICAgICAgICAgIHRhcmdldDogJ2h0dHA6Ly8xMjcuMC4wLjE6ODAwMCcsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgICAgLy8gXHU2MjhBIC9hcGkgXHU1MjREXHU3RjAwXHU1M0JCXHU2Mzg5IC0+IC91c2Vycy9cdTMwMDEvdGFza3MvLi4uXHJcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdXLFNBQVMsb0JBQW9CO0FBQ3JZLE9BQU8sU0FBUztBQUNoQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxhQUFhO0FBQ3BCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsd0JBQXdCO0FBQ2pDLFNBQVMscUJBQXFCO0FBRTlCLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsU0FBUyxLQUFLLE1BQU07QUFDakQsUUFBTSxVQUFVLFlBQVksV0FBVyxTQUFTO0FBRWhELFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLElBQUk7QUFBQSxNQUVKLE1BQU0sRUFBRSxNQUFNLGFBQWEsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQUEsTUFFaEQsUUFBUSxFQUFFLGFBQWEsZUFBZSxlQUFlLFVBQVUsQ0FBQztBQUFBLE1BRWhFLFdBQVcsRUFBRSxXQUFXLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDO0FBQUE7QUFBQSxNQUc5QyxXQUNFLGNBQWM7QUFBQSxRQUNaLFVBQVU7QUFBQSxRQUNWLGNBQWM7QUFBQTtBQUFBLFFBQ2QsYUFBYTtBQUFBO0FBQUEsUUFDYixRQUFRO0FBQUEsUUFDUixZQUFZO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFJZCxDQUFDO0FBQUEsSUFDTCxFQUFFLE9BQU8sT0FBTztBQUFBLElBRWhCLFFBQVE7QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQTtBQUFBLFVBRVIsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFFBQzlDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

// vite.config.ts
import { defineConfig } from "file:///C:/Users/pfff/Tests/.Working/react-vault-manager/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/pfff/Tests/.Working/react-vault-manager/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: process.env.BUILD_DIR || "build/web",
    emptyOutDir: false,
    rollupOptions: {
      external: process.env.BUILD_DIR === "build/mobile" ? ["@tauri-apps/api", "@tauri-apps/plugin-fs", "@tauri-apps/plugin-shell", "@tauri-apps/api/path", "@tauri-apps/plugin-sql"] : ["@tauri-apps/api", "@tauri-apps/plugin-fs", "@tauri-apps/plugin-shell", "@tauri-apps/api/path", "@capacitor/preferences", "@aparajita/capacitor-biometric-auth", "@tauri-apps/plugin-sql"],
      output: {
        manualChunks: void 0
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "otpauth", "react-qr-code"],
    exclude: ["@tauri-apps/api", "@tauri-apps/plugin-fs", "@tauri-apps/plugin-shell", "@tauri-apps/api/path"]
  },
  define: {
    global: "globalThis"
  },
  server: {
    fs: {
      allow: [".."]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxwZmZmXFxcXFRlc3RzXFxcXC5Xb3JraW5nXFxcXHJlYWN0LXZhdWx0LW1hbmFnZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHBmZmZcXFxcVGVzdHNcXFxcLldvcmtpbmdcXFxccmVhY3QtdmF1bHQtbWFuYWdlclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvcGZmZi9UZXN0cy8uV29ya2luZy9yZWFjdC12YXVsdC1tYW5hZ2VyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYmFzZTogJy4vJyxcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBidWlsZDoge1xuICAgIG91dERpcjogcHJvY2Vzcy5lbnYuQlVJTERfRElSIHx8ICdidWlsZC93ZWInLFxuICAgIGVtcHR5T3V0RGlyOiBmYWxzZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogcHJvY2Vzcy5lbnYuQlVJTERfRElSID09PSAnYnVpbGQvbW9iaWxlJ1xuICAgICAgICA/IFsnQHRhdXJpLWFwcHMvYXBpJywgJ0B0YXVyaS1hcHBzL3BsdWdpbi1mcycsICdAdGF1cmktYXBwcy9wbHVnaW4tc2hlbGwnLCAnQHRhdXJpLWFwcHMvYXBpL3BhdGgnLCAnQHRhdXJpLWFwcHMvcGx1Z2luLXNxbCddXG4gICAgICAgIDogWydAdGF1cmktYXBwcy9hcGknLCAnQHRhdXJpLWFwcHMvcGx1Z2luLWZzJywgJ0B0YXVyaS1hcHBzL3BsdWdpbi1zaGVsbCcsICdAdGF1cmktYXBwcy9hcGkvcGF0aCcsICdAY2FwYWNpdG9yL3ByZWZlcmVuY2VzJywgJ0BhcGFyYWppdGEvY2FwYWNpdG9yLWJpb21ldHJpYy1hdXRoJywgJ0B0YXVyaS1hcHBzL3BsdWdpbi1zcWwnXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHVuZGVmaW5lZCxcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ290cGF1dGgnLCAncmVhY3QtcXItY29kZSddLFxuICAgIGV4Y2x1ZGU6IFsnQHRhdXJpLWFwcHMvYXBpJywgJ0B0YXVyaS1hcHBzL3BsdWdpbi1mcycsICdAdGF1cmktYXBwcy9wbHVnaW4tc2hlbGwnLCAnQHRhdXJpLWFwcHMvYXBpL3BhdGgnXVxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgZnM6IHtcbiAgICAgIGFsbG93OiBbJy4uJ11cbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThVLFNBQVMsb0JBQW9CO0FBQzNXLE9BQU8sV0FBVztBQUlsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsT0FBTztBQUFBLElBQ0wsUUFBUSxRQUFRLElBQUksYUFBYTtBQUFBLElBQ2pDLGFBQWE7QUFBQSxJQUNiLGVBQWU7QUFBQSxNQUNiLFVBQVUsUUFBUSxJQUFJLGNBQWMsaUJBQ2hDLENBQUMsbUJBQW1CLHlCQUF5Qiw0QkFBNEIsd0JBQXdCLHdCQUF3QixJQUN6SCxDQUFDLG1CQUFtQix5QkFBeUIsNEJBQTRCLHdCQUF3QiwwQkFBMEIsdUNBQXVDLHdCQUF3QjtBQUFBLE1BQzlMLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxhQUFhLFdBQVcsZUFBZTtBQUFBLElBQzFELFNBQVMsQ0FBQyxtQkFBbUIseUJBQXlCLDRCQUE0QixzQkFBc0I7QUFBQSxFQUMxRztBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLElBQUk7QUFBQSxNQUNGLE9BQU8sQ0FBQyxJQUFJO0FBQUEsSUFDZDtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

/** Vite allowedHosts for fieldmark.local dev (see config/Caddyfile). */
export const LOCAL_DEV_HOSTS = [
  "fieldmark.local",
  "www.fieldmark.local",
  "app.fieldmark.local",
  "api.fieldmark.local",
  "admin.fieldmark.local",
  "localhost",
  "127.0.0.1"
];

export function localDevServerOptions(port) {
  return {
    port,
    strictPort: true,
    host: true,
    allowedHosts: LOCAL_DEV_HOSTS
  };
}

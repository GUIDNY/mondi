import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.mondi.app",
  appName: "Mondi",
  webDir: "out",
  server: {
    url: "https://mondi-phi.vercel.app",
    cleartext: false,
  },
  ios: {
    backgroundColor: "#061209",
    contentInset: "always",
  },
};

export default config;

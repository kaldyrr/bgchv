import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.crm',
  appName: 'CRM',
  webDir: '../web/dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;


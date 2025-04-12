export default {
  expo: {
    name: "last_time",
    slug: "last_time",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "com.lasttime.app",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: "com.lasttime.app",
      supportsTablet: true,
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.lasttime.app"
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "e319fb4b-dc88-4a59-b652-226029051340"
      }
    },
  },
}; 
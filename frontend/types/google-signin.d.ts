declare module '@react-native-google-signin/google-signin' {
  export interface User {
    email: string;
    familyName: string | null;
    givenName: string | null;
    id: string;
    name: string | null;
    photo: string | null;
  }

  export interface SignInResult {
    idToken: string | null;
    accessToken: string | null;
    user: User;
  }

  export interface NativeModuleError extends Error {
    code: number;
  }

  export const statusCodes: {
    SIGN_IN_CANCELLED: number;
    IN_PROGRESS: number;
    PLAY_SERVICES_NOT_AVAILABLE: number;
    SIGN_IN_REQUIRED: number;
  };

  export class GoogleSignin {
    static signIn(): Promise<SignInResult>;
    static signOut(): Promise<void>;
    static hasPlayServices(options?: { showPlayServicesUpdateDialog: boolean }): Promise<void>;
    static configure(options: {
      scopes?: string[];
      webClientId?: string;
      offlineAccess?: boolean;
    }): void;
    static getTokens(): Promise<{
      accessToken: string;
      idToken: string;
    }>;
  }
} 
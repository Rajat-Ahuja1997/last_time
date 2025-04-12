import React, { createContext, useState, useContext, useEffect } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../utils/supabase';

WebBrowser.maybeCompleteAuthSession();

type User = {
  id: string;
  email: string;
  name?: string;
  photo?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [_, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '176005417528-v7ot7b9n38uhapl166k0rmss4qt0gi88.apps.googleusercontent.com',
    webClientId: '176005417528-v7ot7b9n38uhapl166k0rmss4qt0gi88.apps.googleusercontent.com'
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (idToken: string | undefined) => {
    if (!idToken) return;

    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        throw error;
      }

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email ?? '',
          name: data.user.user_metadata?.full_name,
          photo: data.user.user_metadata?.avatar_url
        };

        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const userData: User = {
        id: credential.user,
        email: credential.email || '',
        name: credential.fullName?.givenName || undefined,
      };

      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error signing in with Apple:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithGoogle,
        signInWithApple,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider; 
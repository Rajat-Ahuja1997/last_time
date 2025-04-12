import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import Svg, { Path, G } from 'react-native-svg';

const GoogleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <Path d="M21.8055,10.0415 L21.75,10.0415 L12,10.0415 L12,14.2915 L17.3955,14.2915 C16.83,16.1915 15.06,17.5415 12,17.5415 C8.6865,17.5415 6,14.855 6,11.5415 C6,8.228 8.6865,5.5415 12,5.5415 C13.71,5.5415 15.21,6.2915 16.29,7.4415 L19.14,4.5915 C17.34,2.8915 14.82,1.7915 12,1.7915 C6.477,1.7915 2,6.2685 2,11.7915 C2,17.3145 6.477,21.7915 12,21.7915 C17.523,21.7915 22,17.3145 22,11.7915 C22,11.1915 21.93,10.5915 21.8055,10.0415 Z" fill="#FFC107"/>
      <Path d="M3.15295,7.3455 L6.43845,9.755 C7.32745,7.554 9.48045,5.957 12,5.957 C13.71,5.957 15.21,6.707 16.29,7.857 L19.14,5.007 C17.34,3.307 14.82,2.207 12,2.207 C8.15895,2.207 4.82795,4.3375 3.15295,7.3455 Z" fill="#FF3D00"/>
      <Path d="M12,22 C14.82,22 17.34,20.935 19.14,19.235 L16.29,16.385 C15.21,17.535 13.71,18.285 12,18.285 C9.48045,18.285 7.32745,16.688 6.43845,14.487 L3.15295,16.897 C4.82795,19.905 8.15895,22 12,22 Z" fill="#4CAF50"/>
      <Path d="M21.8055,10.041 L21.75,10.041 L12,10.041 L12,14.291 L17.3955,14.291 C17.13,15.361 16.38,16.261 15.39,16.785 L15.39,16.784 L18.435,19.109 C18.315,19.164 22,17.291 22,11.791 C22,11.191 21.93,10.591 21.8055,10.041 Z" fill="#1976D2"/>
    </G>
  </Svg>
);

const AppleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <Path d="M17.05,12.536 C17.05,9.936 19.15,8.836 19.25,8.786 C17.95,6.686 15.85,6.286 15.05,6.256 C13.25,6.056 11.55,7.256 10.75,7.256 C9.95,7.256 8.45,6.286 6.95,6.316 C4.95,6.346 3.05,7.386 2.05,9.186 C0.05,12.886 1.45,17.986 3.45,21.186 C4.45,22.786 5.65,24.586 7.25,24.536 C8.85,24.486 9.45,23.586 11.25,23.586 C13.05,23.586 13.55,24.536 15.25,24.506 C16.95,24.486 18.05,22.886 19.05,21.276 C20.25,19.576 20.75,17.876 20.75,17.826 C20.65,17.816 17.05,16.636 17.05,12.536 Z M14.45,5.186 C15.25,4.186 15.85,2.886 15.75,1.586 C14.65,1.636 13.35,2.286 12.55,3.286 C11.85,4.186 11.15,5.486 11.25,6.786 C12.45,6.886 13.65,6.186 14.45,5.186 Z" fill="#FFFFFF"/>
    </G>
  </Svg>
);

function LoginScreen() {
  const { signInWithGoogle, signInWithApple } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Last Time</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={signInWithGoogle}
      >
        <GoogleIcon />
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.appleButton]}
        onPress={signInWithApple}
      >
        <AppleIcon />
        <Text style={[styles.buttonText, styles.appleButtonText]}>
          Continue with Apple
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
    maxWidth: 300,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  appleButtonText: {
    color: '#fff',
  },
});

export default LoginScreen; 
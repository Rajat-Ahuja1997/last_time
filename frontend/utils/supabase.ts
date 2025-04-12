import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get the values from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('supabaseUrl', supabaseUrl);
  console.log('supabaseAnonKey', supabaseAnonKey);
  throw new Error('Missing Supabase configuration. Please check your app.config.js');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
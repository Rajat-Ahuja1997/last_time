import { API_BASE_URL } from '@/constants/Api';

// Optional: Define Category interface if needed for display
interface Category {
  id: number;
  name: string;
}

// Renamed interface to match backend model
interface LastTimeActivity {
  id: number; // Changed from string
  user_id: string;
  activity: string; // Renamed from name
  last_date: string; // Renamed from timestamp (keep as string for simplicity)
  created_at: string;
  updated_at: string;
  category: Category | null; // Can be null
}

// Fetch activities from the actual backend
export const fetchActivities = async (): Promise<LastTimeActivity[]> => {
  console.log("Fetching activities from backend...");

  // TODO: Add Authentication token when implemented
  const headers = {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer YOUR_AUTH_TOKEN', // Add this line when auth is ready
  };

  try {
    const response = await fetch(`${API_BASE_URL}/activity/`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      // Log more details for debugging
      const errorBody = await response.text();
      console.error(`Error fetching activities: ${response.status} ${response.statusText}`, errorBody);
      // Handle specific errors like 401/403 when auth is missing
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required. Please sign in.');
      }
      throw new Error(`Failed to fetch activities (Status: ${response.status})`);
    }

    const data: LastTimeActivity[] = await response.json();
    console.log("Received activities:", data);
    return data;
  } catch (error) {
    console.error("Network or parsing error fetching activities:", error);
    // Re-throw the error to be caught by the component
    throw error instanceof Error ? error : new Error('An unknown error occurred');
  }
}; 
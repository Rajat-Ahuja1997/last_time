import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
// import { useAuth } from '@/hooks/useAuth'; // Removed for now
import { fetchActivities } from '@/api/activities';

// Import the updated interface (if defined in the same file or imported separately)
// Assuming LastTimeActivity is now defined in @/api/activities.ts
// You might need to export it from there and import it here
// import { LastTimeActivity } from '@/api/activities';

// If LastTimeActivity is not exported, redefine or use inline type
interface LastTimeActivity {
  id: number;
  user_id: string;
  activity: string;
  last_date: string;
  created_at: string;
  updated_at: string;
  category: { id: number; name: string } | null;
}

export default function ActivitiesScreen() {
  // const { user } = useAuth(); // Removed for now
  const [activities, setActivities] = useState<LastTimeActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // if (user) { // Removed auth check for now
      setIsLoading(true);
      setError(null);
      fetchActivities()
        .then((data: LastTimeActivity[]) => {
          setActivities(data);
          setIsLoading(false);
        })
        .catch((err: any) => {
          console.error("Failed to fetch activities:", err);
          // Display the error message from fetchActivities
          setError(err.message || "Failed to load activities. Please try again.");
          setIsLoading(false);
        });
    // } else {
    //   setActivities([]); // Clear activities if user logs out
    // }
  }, []); // Fetch only once on mount

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Activities</Text>
      {activities.length === 0 && !isLoading ? (
         <Text style={styles.messageText}>No activities found.</Text>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()} // Use number id, convert to string
          renderItem={({ item }) => (
            <View style={styles.activityItem}>
              {/* Display backend fields */}
              <Text style={styles.activityName}>{item.activity}</Text>
              <Text style={styles.activityTimestamp}>{new Date(item.last_date).toLocaleString()}</Text>
              {/* Optionally display category */}
              {item.category && <Text style={styles.categoryText}>Category: {item.category.name}</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
      fontSize: 16,
      color: 'red',
  },
  activityItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    width: '100%', // Ensure items take full width available in container
    alignSelf: 'stretch', // Stretch to fill container width
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
  },
  activityTimestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  categoryText: { // Added style for category
    fontSize: 11,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 2,
  }
}); 
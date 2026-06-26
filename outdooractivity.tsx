import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getDailyActivity } from '../services/api';

export default function OutdoorActivityScreen() {
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState<string>('');
  const [error, setError] = useState('');

  const handleGetActivity = async () => {
    setLoading(true);
    setError('');
    setActivity('');
    try {
      const res = await getDailyActivity();
      const text =
        res.data?.activity ||
        res.data?.result ||
        res.data?.content ||
        'No activity available today.';
      setActivity(text);
    } catch (err: any) {
      console.error('Failed to get daily activity:', err);
      setError("Could not load today's activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌳 Outdoor Adventures</Text>
      <Text style={styles.subtitle}>Get a fun activity to try outside today!</Text>

      <TouchableOpacity
        style={loading ? [styles.button, styles.buttonDisabled] : styles.button}
        onPress={handleGetActivity}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>🏃 Get Today's Activity</Text>
        )}
      </TouchableOpacity>

      {error !== '' ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {activity !== '' ? (
        <View style={styles.activityBox}>
          <Text style={styles.activityLabel}>Today's activity:</Text>
          <Text style={styles.activityText}>{activity}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, backgroundColor: '#F0FFF4', flexGrow: 1 },
  title: { fontSize: 26, fontWeight: '700', color: '#2D5B3A', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#5D7A6A', marginBottom: 24 },
  button: {
    backgroundColor: '#2E9E5B',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorBox: { marginTop: 16, backgroundColor: '#FFE5E5', borderRadius: 12, padding: 14 },
  errorText: { color: '#C0392B', fontSize: 14 },
  activityBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C5E5D6',
  },
  activityLabel: { fontSize: 14, fontWeight: '600', color: '#2D5B3A', marginBottom: 8 },
  activityText: { fontSize: 16, color: '#333', lineHeight: 24 },
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';

const modules = [
  { id: 'chat',     label: '💬 Chat',            color: '#FF6B35' },
  { id: 'stories',  label: '📖 Stories',          color: '#4ECDC4' },
  { id: 'games',    label: '🎮 Games',             color: '#45B7D1' },
  { id: 'voice_chat', label: '🎤 Voice Chat',      color: '#96CEB4' },
  { id: 'creative', label: '🎨 Creative',          color: '#FFEAA7' },
  { id: 'outdoor',  label: '🌳 Outdoor Activity',  color: '#DDA0DD' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem('profile');
      if (raw) setProfile(JSON.parse(raw));
    };
    load();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌟 BrightMind</Text>
        {profile && (
          <Text style={styles.points}>⭐ {profile.points} points</Text>
        )}
      </View>
      <Text style={styles.welcome}>What do you want to do today?</Text>
      <View style={styles.grid}>
        {modules.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.card, { backgroundColor: m.color }]}
            onPress={() => router.push(`/${m.id}` as any)}
          >
            <Text style={styles.cardText}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFF9F0', minHeight: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FF6B35' },
  points: { fontSize: 18, color: '#666' },
  welcome: { fontSize: 20, color: '#444', marginBottom: 20, marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '47%', padding: 25, borderRadius: 16, marginBottom: 15, alignItems: 'center' },
  cardText: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  logout: { marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#999', fontSize: 16 },
});

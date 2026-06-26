import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, Alert,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { login } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await login(username, password);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('role', res.data.role);
      if (res.data.role === 'child') {
      router.replace('/home' as any);
      } else {
        Alert.alert('Info', 'Parent account - child features only');
      }
    } catch (err) {
      Alert.alert('Error', 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌟 BrightMind</Text>
      <Text style={styles.subtitle}>Learn, Play & Grow!</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9F0', padding: 20 },
  title: { fontSize: 40, fontWeight: 'bold', color: '#FF6B35', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 40 },
  input: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  button: { width: '100%', backgroundColor: '#FF6B35', padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
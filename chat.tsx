import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import { sendChat } from '../services/api';

export default function ChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessages(prev => [...prev, { sender: 'child', text: userMsg }]);
    setMessage('');
    setLoading(true);
    try {
      const res = await sendChat(userMsg);
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Something went wrong. Try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💬 Chat</Text>
      </View>
      <ScrollView style={styles.messages}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.sender === 'child' ? styles.child : styles.ai]}>
            <Text style={styles.bubbleText}>{m.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator color="#FF6B35" style={{ margin: 10 }} />}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F0' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#FF6B35' },
  back: { color: '#fff', fontSize: 16, marginRight: 15 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  messages: { flex: 1, padding: 15 },
  bubble: { padding: 12, borderRadius: 12, marginBottom: 10, maxWidth: '80%' },
  child: { backgroundColor: '#FF6B35', alignSelf: 'flex-end' },
  ai: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ddd' },
  bubbleText: { fontSize: 15, color: '#333' },
  inputRow: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#ddd' },
  input: { flex: 1, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 12, fontSize: 15 },
  sendBtn: { backgroundColor: '#FF6B35', padding: 12, borderRadius: 12, marginLeft: 10, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: 'bold' },
});
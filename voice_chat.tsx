import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AUDIO_BASE_URL, sendChat, sendVoiceChat } from '../services/api';

const LANGUAGES = [
  // Indian languages
  { code: 'en', name: 'English', placeholder: 'Type a message...', micIdle: 'Tap to Talk', micActive: 'Listening...' },
  { code: 'hi', name: 'Hindi', placeholder: 'संदेश टाइप करें...', micIdle: 'बोलने के लिए दबाएं', micActive: 'सुन रहा हूं...' },
  { code: 'ta', name: 'Tamil', placeholder: 'செய்தியை தட்டச்சு செய்க...', micIdle: 'பேச தட்டவும்', micActive: 'கேட்டுக்கொண்டிருக்கிறேன்...' },
  { code: 'te', name: 'Telugu', placeholder: 'సందేశాన్ని టైప్ చేయండి...', micIdle: 'మాట్లాడటానికి నొక్కండి', micActive: 'వింటున్నాను...' },
  { code: 'kn', name: 'Kannada', placeholder: 'ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...', micIdle: 'ಮಾತನಾಡಲು ಒತ್ತಿರಿ', micActive: 'ಕೇಳುತ್ತಿದ್ದೇನೆ...' },
  { code: 'ml', name: 'Malayalam', placeholder: 'സന്ദേശം ടൈപ്പ് ചെയ്യുക...', micIdle: 'സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക', micActive: 'കേൾക്കുന്നു...' },
  { code: 'bn', name: 'Bengali', placeholder: 'বার্তা টাইপ করুন...', micIdle: 'কথা বলার জন্য ট্যাপ করুন', micActive: 'শুনছি...' },
  { code: 'mr', name: 'Marathi', placeholder: 'संदेश टाइप करा...', micIdle: 'बोलण्यासाठी टॅप करा', micActive: 'ऐकत आहे...' },
  { code: 'gu', name: 'Gujarati', placeholder: 'સંદેશ ટાઇપ કરો...', micIdle: 'બોલવા માટે ટેપ કરો', micActive: 'સાંભળી રહ્યો છું...' },
  { code: 'pa', name: 'Punjabi', placeholder: 'ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ...', micIdle: 'ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ', micActive: 'ਸੁਣ ਰਿਹਾ ਹਾਂ...' },
  { code: 'ur', name: 'Urdu', placeholder: 'پیغام ٹائپ کریں...', micIdle: 'بولنے کے لیے ٹیپ کریں', micActive: 'سن رہا ہوں...' },
  { code: 'or', name: 'Odia', placeholder: 'ବାର୍ତ୍ତା ଟାଇପ୍ କରନ୍ତୁ...', micIdle: 'କଥା ହେବାକୁ ଟ୍ୟାପ୍ କରନ୍ତୁ', micActive: 'ଶୁଣୁଛି...' },
  { code: 'as', name: 'Assamese', placeholder: 'বাৰ্তা টাইপ কৰক...', micIdle: 'কথা কওঁতে টেপ কৰক', micActive: 'শুনি আছো...' },
  { code: 'ne', name: 'Nepali', placeholder: 'सन्देश टाइप गर्नुहोस्...', micIdle: 'बोलनको लागि ट्याप गर्नुहोस्', micActive: 'सुन्दैछु...' },
  { code: 'si', name: 'Sinhala', placeholder: 'පණිවිඩය ටයිප් කරන්න...', micIdle: 'කතා කිරීමට තට්ටු කරන්න', micActive: 'සවන් දෙමින්...' },

  // European
  { code: 'es', name: 'Spanish', placeholder: 'Escribe un mensaje...', micIdle: 'Toca para hablar', micActive: 'Escuchando...' },
  { code: 'fr', name: 'French', placeholder: 'Tapez un message...', micIdle: 'Appuyez pour parler', micActive: 'Écoute...' },
  { code: 'de', name: 'German', placeholder: 'Nachricht eingeben...', micIdle: 'Tippen zum Sprechen', micActive: 'Höre zu...' },
  { code: 'it', name: 'Italian', placeholder: 'Scrivi un messaggio...', micIdle: 'Tocca per parlare', micActive: 'Sto ascoltando...' },
  { code: 'pt', name: 'Portuguese', placeholder: 'Digite uma mensagem...', micIdle: 'Toque para falar', micActive: 'Ouvindo...' },
  { code: 'nl', name: 'Dutch', placeholder: 'Typ een bericht...', micIdle: 'Tik om te praten', micActive: 'Luisteren...' },
  { code: 'ru', name: 'Russian', placeholder: 'Введите сообщение...', micIdle: 'Нажмите, чтобы говорить', micActive: 'Слушаю...' },
  { code: 'pl', name: 'Polish', placeholder: 'Wpisz wiadomość...', micIdle: 'Stuknij, aby mówić', micActive: 'Słucham...' },
  { code: 'uk', name: 'Ukrainian', placeholder: 'Введіть повідомлення...', micIdle: 'Натисніть, щоб говорити', micActive: 'Слухаю...' },
  { code: 'el', name: 'Greek', placeholder: 'Πληκτρολογήστε μήνυμα...', micIdle: 'Πατήστε για ομιλία', micActive: 'Ακούω...' },
  { code: 'sv', name: 'Swedish', placeholder: 'Skriv ett meddelande...', micIdle: 'Tryck för att tala', micActive: 'Lyssnar...' },
  { code: 'tr', name: 'Turkish', placeholder: 'Bir mesaj yazın...', micIdle: 'Konuşmak için dokun', micActive: 'Dinliyorum...' },
  { code: 'ro', name: 'Romanian', placeholder: 'Scrieți un mesaj...', micIdle: 'Apăsați pentru a vorbi', micActive: 'Ascult...' },
  { code: 'cs', name: 'Czech', placeholder: 'Napište zprávu...', micIdle: 'Klepněte pro mluvení', micActive: 'Poslouchám...' },
  { code: 'hu', name: 'Hungarian', placeholder: 'Írjon üzenetet...', micIdle: 'Koppintson a beszédhez', micActive: 'Hallgatom...' },
  { code: 'da', name: 'Danish', placeholder: 'Skriv en besked...', micIdle: 'Tryk for at tale', micActive: 'Lytter...' },
  { code: 'fi', name: 'Finnish', placeholder: 'Kirjoita viesti...', micIdle: 'Napauta puhuaksesi', micActive: 'Kuuntelen...' },
  { code: 'no', name: 'Norwegian', placeholder: 'Skriv en melding...', micIdle: 'Trykk for å tale', micActive: 'Lytter...' },

  // East Asian
  { code: 'zh', name: 'Chinese', placeholder: '输入消息...', micIdle: '点击说话', micActive: '正在聆听...' },
  { code: 'ja', name: 'Japanese', placeholder: 'メッセージを入力...', micIdle: 'タップして話す', micActive: '聞いています...' },
  { code: 'ko', name: 'Korean', placeholder: '메시지를 입력하세요...', micIdle: '눌러서 말하기', micActive: '듣고 있습니다...' },

  // Southeast Asian
  { code: 'vi', name: 'Vietnamese', placeholder: 'Nhập tin nhắn...', micIdle: 'Nhấn để nói', micActive: 'Đang nghe...' },
  { code: 'th', name: 'Thai', placeholder: 'พิมพ์ข้อความ...', micIdle: 'แท็ปเพื่อพูด', micActive: 'กำลังฟัง...' },
  { code: 'id', name: 'Indonesian', placeholder: 'Ketik pesan...', micIdle: 'Ketuk untuk berbicara', micActive: 'Mendengarkan...' },
  { code: 'ms', name: 'Malay', placeholder: 'Taip mesej...', micIdle: 'Ketik untuk bercakap', micActive: 'Mendengar...' },
  { code: 'tl', name: 'Filipino', placeholder: 'Mag-type ng mensahe...', micIdle: 'I-tap para magsalita', micActive: 'Nakikinig...' },

  // Middle Eastern / African
  { code: 'ar', name: 'Arabic', placeholder: 'اكتب رسالة...', micIdle: 'اضغط للتحدث', micActive: 'أستمع...' },
  { code: 'he', name: 'Hebrew', placeholder: 'הקלד הודעה...', micIdle: 'הקש לדיבור', micActive: 'מקשיב...' },
  { code: 'fa', name: 'Persian', placeholder: 'پیام را تایپ کنید...', micIdle: 'برای صحبت ضربه بزنید', micActive: 'در حال شنیدن...' },
  { code: 'sw', name: 'Swahili', placeholder: 'Andika ujumbe...', micIdle: 'Gusa kuongea', micActive: 'Ninasikiliza...' },
  { code: 'af', name: 'Afrikaans', placeholder: "Tik 'n boodskap...", micIdle: 'Tik om te praat', micActive: 'Luister...' },
];

export default function SmartChatScreen() {
  const router = useRouter();
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mobile audio state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Web audio state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      async function initAudio() {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
      initAudio();
    }
  }, []);

  // --- Text Handler ---
  const handleSendText = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setMessages(prev => [...prev, { sender: 'child', text: userMsg }]);
    setMessage('');
    setLoading(true);
    try {
      const res = await sendChat(userMsg, currentLang.code);
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Something went wrong. Try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  // --- Web Recording ---
  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start web recording:', err);
      alert('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopWebRecording = async () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    setIsRecording(false);
    setLoading(true);

    mediaRecorder.onstop = async () => {
      try {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const ext = mimeType.includes('ogg') ? 'ogg' : 'webm';
        const uri = URL.createObjectURL(audioBlob);

        // Send to Django
        const res = await sendVoiceChat(uri, currentLang.code, audioBlob, ext);
        const audioUrl = res.data.audio_url;

        if (res.data.transcript) {
          setMessages(prev => [...prev, { sender: 'child', text: res.data.transcript }]);
        }
        if (res.data.reply) {
          setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
        }

        if (audioUrl) {
          const audio = new window.Audio(`${AUDIO_BASE_URL}${audioUrl}`);
          audio.play().catch(err => console.error('🔇 Playback blocked:', err));
        }
      } catch (err) {
        console.error('Voice error:', err);
        setMessages(prev => [...prev, { sender: 'ai', text: 'Voice error. Try again!' }]);
      } finally {
        setLoading(false);
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
      }
    };

    mediaRecorder.stop();
  };

  // --- Mobile Recording ---
  const startMobileRecording = async () => {
    try {
      if (recording) await recording.stopAndUnloadAsync();
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopMobileRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    setLoading(true);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) {
        const res = await sendVoiceChat(uri, currentLang.code);
        if (res.data.transcript) {
          setMessages(prev => [...prev, { sender: 'child', text: res.data.transcript }]);
        }
        if (res.data.reply) {
          setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
        }
        const audioUrl = res.data.audio_url;
        if (audioUrl) {
          const { sound } = await Audio.Sound.createAsync(
            { uri: `${AUDIO_BASE_URL}${audioUrl}` },
            { shouldPlay: true }
          );
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
          });
        }
      }
    } catch (err) {
      console.error('Voice error:', err);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Voice error. Try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = Platform.OS === 'web' ? startWebRecording : startMobileRecording;
  const stopRecording = Platform.OS === 'web' ? stopWebRecording : stopMobileRecording;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>BrightMind AI</Text>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsVoiceMode(!isVoiceMode)}>
          <Text style={styles.toggleText}>{isVoiceMode ? "⌨️ Text" : "🎙️ Voice"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.langBar}
        contentContainerStyle={styles.langBarContent}
      >
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[styles.langChip, currentLang.code === lang.code && styles.activeChip]}
            onPress={() => setCurrentLang(lang)}
          >
            <Text style={[styles.langChipText, currentLang.code === lang.code && styles.activeChipText]}>
              {lang.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.messages} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.sender === 'child' ? styles.child : styles.ai]}>
            <Text style={[styles.bubbleText, m.sender === 'child' && { color: '#fff' }]}>{m.text}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator color="#FF6B35" style={{ margin: 10 }} />}
      </ScrollView>

      <View style={styles.inputContainer}>
        {isVoiceMode ? (
          <View style={styles.voiceWrapper}>
            <Text style={styles.statusText}>
              {isRecording ? currentLang.micActive : currentLang.micIdle}
            </Text>
            <TouchableOpacity
              style={[styles.micButton, isRecording ? styles.micRecording : styles.micIdle]}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={loading}
            >
              <Text style={styles.micIcon}>{isRecording ? "🛑" : "🎙️"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder={currentLang.placeholder}
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendText} disabled={loading}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F0' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#FF6B35', paddingTop: 40 },
  back: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  toggleBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  toggleText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  langBar: { backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#eee' },
  langBarContent: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 8 },
  langChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 15, backgroundColor: '#f0f0f0', marginRight: 6 },
  activeChip: { backgroundColor: '#FF6B35' },
  langChipText: { fontSize: 12, color: '#666' },
  activeChipText: { color: '#FFF', fontWeight: 'bold' },
  messages: { flex: 1, padding: 15 },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 10, maxWidth: '85%' },
  child: { backgroundColor: '#FF6B35', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  ai: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#eee' },
  bubbleText: { fontSize: 15, color: '#333', lineHeight: 20 },
  inputContainer: { backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#ddd' },
  inputRow: { flexDirection: 'row', padding: 12 },
  input: { flex: 1, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 12, fontSize: 15 },
  sendBtn: { backgroundColor: '#FF6B35', paddingHorizontal: 18, borderRadius: 12, marginLeft: 10, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: 'bold' },
  voiceWrapper: { alignItems: 'center', padding: 20 },
  statusText: { fontSize: 14, color: '#666', marginBottom: 10, fontWeight: '600' },
  micButton: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  micIdle: { backgroundColor: '#FF6B35' },
  micRecording: { backgroundColor: '#D90429' },
  micIcon: { fontSize: 28 }
});
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { getCreativeIdea, getCreativeTypes, shareCreation } from '../services/api';

export default function CreativeScreen() {
  const [types, setTypes] = useState<string[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [idea, setIdea] = useState<string>('');
  const [loadingIdea, setLoadingIdea] = useState(false);

  const [feedback, setFeedback] = useState('');
  const [points, setPoints] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [sharing, setSharing] = useState(false);

  const [error, setError] = useState('');

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    setLoadingTypes(true);
    setError('');
    try {
      const res = await getCreativeTypes();
      setTypes(res.data?.creative_types || []);
    } catch (err: any) {
      console.error('Failed to load creative types:', err);
      setError('Could not load creative options. Pull to refresh or try again.');
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleSelectType = async (type: string) => {
    setSelectedType(type);
    setIdea('');
    setDescription('');
    setFeedback('');
    setPoints(null);
    setError('');
    setLoadingIdea(true);
    try {
      const res = await getCreativeIdea(type);
      const ideaText = res.data?.idea || 'No idea came back — try again!';
      setIdea(ideaText);
    } catch (err: any) {
      console.error('Failed to get creative idea:', err);
      setError('Could not get an idea right now. Please try again.');
    } finally {
      setLoadingIdea(false);
    }
  };

  const handleShare = async () => {
    if (!selectedType) return;
    if (!description.trim()) {
      Alert.alert('Almost there!', 'Tell me a little about what you made before sharing.');
      return;
    }
    setSharing(true);
    setError('');
    try {
      const res = await shareCreation(selectedType, description.trim());
      setFeedback(res.data?.feedback || 'Great job!');
      setPoints(res.data?.points ?? null);
    } catch (err: any) {
      console.error('Failed to share creation:', err);
      setError('Could not share your creation. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>🎨 Creative Corner</Text>
        <Text style={styles.subtitle}>Pick something you'd like to try today!</Text>

        {loadingTypes ? (
          <ActivityIndicator color="#FF8C42" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.chipRow}>
            {types.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, selectedType === type && styles.chipSelected]}
                onPress={() => handleSelectType(type)}
              >
                <Text style={[styles.chipText, selectedType === type && styles.chipTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loadingIdea ? (
          <ActivityIndicator color="#FF8C42" style={{ marginTop: 20 }} />
        ) : null}

        {error !== '' ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {idea !== '' ? (
          <View style={styles.ideaBox}>
            <Text style={styles.ideaLabel}>Here's your idea:</Text>
            <Text style={styles.ideaText}>{idea}</Text>
          </View>
        ) : null}

        {idea !== '' ? (
          <View style={styles.shareSection}>
            <Text style={styles.shareLabel}>Made something? Tell me about it (optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. I drew a sun with a smiling face"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              editable={!sharing}
            />
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, sharing && styles.buttonDisabled]}
              onPress={handleShare}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Share My Creation</Text>
              )}
            </TouchableOpacity>

            {feedback !== '' ? (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackText}>{feedback}</Text>
                {points !== null ? (
                  <Text style={styles.pointsText}>⭐ Total points: {points}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFF8F0' },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: '#5B3A29', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#7A6A5D', marginBottom: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, columnGap: 10 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF8C42',
  },
  chipSelected: { backgroundColor: '#FF8C42' },
  chipText: { color: '#FF8C42', fontWeight: '600', textTransform: 'capitalize' },
  chipTextSelected: { color: '#fff' },
  ideaBox: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5D6C5',
  },
  ideaLabel: { fontSize: 14, fontWeight: '600', color: '#5B3A29', marginBottom: 8 },
  ideaText: { fontSize: 16, color: '#333', lineHeight: 24 },
  shareSection: { marginTop: 20 },
  shareLabel: { fontSize: 14, color: '#5B3A29', marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5D6C5',
    color: '#333',
    marginBottom: 12,
  },
  button: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryButton: { backgroundColor: '#FF8C42' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorBox: { marginTop: 16, backgroundColor: '#FFE5E5', borderRadius: 12, padding: 14 },
  errorText: { color: '#C0392B', fontSize: 14 },
  feedbackBox: {
    marginTop: 14,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 14,
  },
  feedbackText: { color: '#5B3A29', fontSize: 15, lineHeight: 22 },
  pointsText: { marginTop: 8, color: '#FF8C42', fontWeight: '700', textAlign: 'center' },
});
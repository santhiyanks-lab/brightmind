import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Image, ScrollView,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { startStory } from '../services/api';

const PEXELS_API_KEY = '1HmhvrJyhP5mGcYDxqAV1i46UfvlDcSCMrAsPWttRmZn8lGWFrCdPDXx';

const langCodeMap: Record<string, string> = {
  english: 'en-US', tamil: 'ta-IN', hindi: 'hi-IN', telugu: 'te-IN',
  kannada: 'kn-IN', malayalam: 'ml-IN', bengali: 'bn-IN', marathi: 'mr-IN',
  gujarati: 'gu-IN', punjabi: 'pa-IN', urdu: 'ur-PK',
  chinese: 'zh-CN', japanese: 'ja-JP', korean: 'ko-KR', vietnamese: 'vi-VN',
  thai: 'th-TH', indonesian: 'id-ID', malay: 'ms-MY', filipino: 'fil-PH',
  arabic: 'ar-SA', persian: 'fa-IR', turkish: 'tr-TR', hebrew: 'he-IL',
  french: 'fr-FR', spanish: 'es-ES', portuguese: 'pt-BR', german: 'de-DE',
  italian: 'it-IT', russian: 'ru-RU', dutch: 'nl-NL', greek: 'el-GR',
  polish: 'pl-PL', swedish: 'sv-SE', norwegian: 'nb-NO', danish: 'da-DK',
  finnish: 'fi-FI', swahili: 'sw-KE', amharic: 'am-ET', hausa: 'ha-NG',
  yoruba: 'yo-NG', zulu: 'zu-ZA',
};

const genres = [
  { id: 'forest adventure',    label: 'Forest Adventure',  emoji: '🌲', color: '#4CAF50', bg: '#E8F5E9', query: 'forest nature',        img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=200&fit=crop' },
  { id: 'space explorer',      label: 'Space Explorer',     emoji: '🚀', color: '#3F51B5', bg: '#E8EAF6', query: 'space stars galaxy',   img: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=200&fit=crop' },
  { id: 'underwater kingdom',  label: 'Underwater Kingdom', emoji: '🐠', color: '#00BCD4', bg: '#E0F7FA', query: 'ocean underwater',     img: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=200&fit=crop' },
  { id: 'magic school',        label: 'Magic School',       emoji: '🧙', color: '#9C27B0', bg: '#F3E5F5', query: 'magic fantasy light',  img: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=200&fit=crop' },
  { id: 'brave village child', label: 'Village Hero',       emoji: '🏡', color: '#FF9800', bg: '#FFF3E0', query: 'village countryside',  img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=200&fit=crop' },
  { id: 'dinosaur world',      label: 'Dinosaur World',     emoji: '🦕', color: '#795548', bg: '#EFEBE9', query: 'jungle prehistoric',   img: 'https://images.unsplash.com/photo-1615243029542-4fcced64c70e?w=400&h=200&fit=crop' },
  { id: 'superhero city',      label: 'Superhero City',     emoji: '🦸', color: '#F44336', bg: '#FFEBEE', query: 'city night lights',    img: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&h=200&fit=crop' },
  { id: 'fairy tale kingdom',  label: 'Fairy Tale',         emoji: '🧚', color: '#E91E63', bg: '#FCE4EC', query: 'fairy sparkle pink',   img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=200&fit=crop' },
  { id: 'pirate treasure',     label: 'Pirate Treasure',    emoji: '🏴‍☠️', color: '#607D8B', bg: '#ECEFF1', query: 'ocean waves sea',     img: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&h=200&fit=crop' },
  { id: 'time travel',         label: 'Time Travel',        emoji: '⏰', color: '#009688', bg: '#E0F2F1', query: 'clock time motion',    img: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400&h=200&fit=crop' },
  { id: 'animal safari',       label: 'Animal Safari',      emoji: '🦁', color: '#FF5722', bg: '#FBE9E7', query: 'safari animals wild',  img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=200&fit=crop' },
  { id: 'robot factory',       label: 'Robot Factory',      emoji: '🤖', color: '#455A64', bg: '#ECEFF1', query: 'technology futuristic', img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop' },
];

const languageGroups = [
  { group: '🇮🇳 Indian', languages: [
    { label: 'English', value: 'english' }, { label: 'Tamil', value: 'tamil' },
    { label: 'Hindi', value: 'hindi' }, { label: 'Telugu', value: 'telugu' },
    { label: 'Kannada', value: 'kannada' }, { label: 'Malayalam', value: 'malayalam' },
    { label: 'Bengali', value: 'bengali' }, { label: 'Marathi', value: 'marathi' },
    { label: 'Gujarati', value: 'gujarati' }, { label: 'Punjabi', value: 'punjabi' },
    { label: 'Urdu', value: 'urdu' },
  ]},
  { group: '🌏 Asian', languages: [
    { label: 'Chinese', value: 'chinese' }, { label: 'Japanese', value: 'japanese' },
    { label: 'Korean', value: 'korean' }, { label: 'Vietnamese', value: 'vietnamese' },
    { label: 'Thai', value: 'thai' }, { label: 'Indonesian', value: 'indonesian' },
    { label: 'Malay', value: 'malay' }, { label: 'Filipino', value: 'filipino' },
  ]},
  { group: '🕌 Middle East', languages: [
    { label: 'Arabic', value: 'arabic' }, { label: 'Persian', value: 'persian' },
    { label: 'Turkish', value: 'turkish' }, { label: 'Hebrew', value: 'hebrew' },
  ]},
  { group: '🌍 European', languages: [
    { label: 'French', value: 'french' }, { label: 'Spanish', value: 'spanish' },
    { label: 'Portuguese', value: 'portuguese' }, { label: 'German', value: 'german' },
    { label: 'Italian', value: 'italian' }, { label: 'Russian', value: 'russian' },
    { label: 'Dutch', value: 'dutch' }, { label: 'Greek', value: 'greek' },
    { label: 'Polish', value: 'polish' }, { label: 'Swedish', value: 'swedish' },
    { label: 'Norwegian', value: 'norwegian' }, { label: 'Danish', value: 'danish' },
    { label: 'Finnish', value: 'finnish' },
  ]},
  { group: '🌍 African', languages: [
    { label: 'Swahili', value: 'swahili' }, { label: 'Amharic', value: 'amharic' },
    { label: 'Hausa', value: 'hausa' }, { label: 'Yoruba', value: 'yoruba' },
    { label: 'Zulu', value: 'zulu' },
  ]},
  { group: '🌎 Americas', languages: [
    { label: 'English (US)', value: 'english' }, { label: 'Spanish (Latin)', value: 'spanish' },
    { label: 'Portuguese (BR)', value: 'portuguese' }, { label: 'French (CA)', value: 'french' },
  ]},
];

const videoCache: Record<string, string> = {};

async function fetchPexelsVideo(query: string): Promise<string | null> {
  if (videoCache[query]) return videoCache[query];
  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    const data = await res.json();
    if (!data.videos || data.videos.length === 0) return null;
    const randomVideo = data.videos[Math.floor(Math.random() * data.videos.length)];
    const files = randomVideo.video_files.sort((a: any, b: any) => b.width - a.width);
    const preferred = files.find((f: any) => f.width <= 1280 && f.file_type === 'video/mp4');
    const link = preferred ? preferred.link : files[0]?.link;
    if (link) videoCache[query] = link;
    return link || null;
  } catch { return null; }
}

function StoryVideo({ uri }: { uri: string }) {
  return (
    <View style={{ width: '100%', height: 200, borderRadius: 16, overflow: 'hidden' } as any}>
      {/* @ts-ignore */}
      <video src={uri} autoPlay loop muted playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </View>
  );
}

function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused]     = useState(false);
  const uttRef = useRef<any>(null);

  const speak = (text: string, langValue: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    stop();
    const clean = text.replace(/🌟.*🌟/g, '').replace(/\n+/g, ' ').trim();
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = langCodeMap[langValue] || 'en-US';
    utt.rate = 0.9;
    utt.pitch = 1.1;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(utt.lang.split('-')[0]));
    if (match) utt.voice = match;
    utt.onstart = () => { setSpeaking(true); setPaused(false); };
    utt.onend   = () => { setSpeaking(false); setPaused(false); };
    utt.onerror = () => { setSpeaking(false); setPaused(false); };
    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause(); setPaused(true);
    }
  };
  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume(); setPaused(false);
    }
  };
  const stop = () => {
    window.speechSynthesis?.cancel(); setSpeaking(false); setPaused(false);
  };

  return { speak, pause, resume, stop, speaking, paused };
}

export default function StoriesScreen() {
  const router = useRouter();
  const [selectedLang, setSelectedLang]           = useState('english');
  const [selectedLangLabel, setSelectedLangLabel] = useState('English');
  const [showLangPicker, setShowLangPicker]       = useState(false);
  const [selectedGenre, setSelectedGenre]         = useState<any>(null);
  const [story, setStory]                         = useState('');
  const [points, setPoints]                       = useState(0);
  const [loading, setLoading]                     = useState(false);
  const [videoUrl, setVideoUrl]                   = useState<string | null>(null);
  const [videoLoading, setVideoLoading]           = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const tts = useTTS();

  useEffect(() => { return () => tts.stop(); }, []);

  useEffect(() => {
    if (!selectedGenre) return;
    setVideoUrl(null);
    setVideoLoading(true);
    fetchPexelsVideo(selectedGenre.query).then((url) => {
      setVideoUrl(url); setVideoLoading(false);
    });
  }, [selectedGenre]);

  const handleGenre = async (genre: any) => {
    tts.stop();
    setSelectedGenre(genre);
    setLoading(true);
    setStory('');
    try {
      const res = await (startStory as any)(genre.id, selectedLang);
      setStory(res.data.story);
      setPoints(res.data.points || 0);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
    } catch (error: any) {
      console.log('Story error:', error?.response?.data || error?.message);
      setStory('Could not load story. Try again!');
    } finally {
      setLoading(false);
    }
  };

  // ── Genre selection screen ──────────────────────────────
  if (!selectedGenre || (!story && !loading)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📖 Story World</Text>
        </View>
        <ScrollView style={styles.content}>
          <Text style={styles.sectionLabel}>🌐 Language</Text>
          <TouchableOpacity style={styles.langBtn} onPress={() => setShowLangPicker(!showLangPicker)}>
            <Text style={styles.langBtnText}>🌐 {selectedLangLabel}</Text>
            <Text style={styles.arrow}>{showLangPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showLangPicker && (
            <View style={styles.langDropdown}>
              <ScrollView style={{ maxHeight: 280 }} nestedScrollEnabled>
                {languageGroups.map((g) => (
                  <View key={g.group}>
                    <Text style={styles.groupTitle}>{g.group}</Text>
                    <View style={styles.langGrid}>
                      {g.languages.map((l) => (
                        <TouchableOpacity
                          key={l.label}
                          style={[styles.langChip, selectedLang === l.value && selectedLangLabel === l.label && styles.langChipSelected]}
                          onPress={() => { setSelectedLang(l.value); setSelectedLangLabel(l.label); setShowLangPicker(false); }}
                        >
                          <Text style={[styles.langChipText, selectedLang === l.value && selectedLangLabel === l.label && styles.langChipTextSelected]}>
                            {l.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          <Text style={styles.sectionLabel}>🎭 Pick Your Adventure</Text>
          <View style={styles.cardsGrid}>
            {genres.map((g) => (
              <TouchableOpacity key={g.id} style={[styles.genreCard, { backgroundColor: g.bg }]}
                onPress={() => handleGenre(g)} activeOpacity={0.85}>
                <Image source={{ uri: g.img }} style={styles.cardImg} resizeMode="cover" />
                <View style={[styles.cardFooter, { backgroundColor: g.color }]}>
                  <Text style={styles.cardEmoji}>{g.emoji}</Text>
                  <Text style={styles.cardLabel}>{g.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Story reading screen ────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: selectedGenre.color }]}>
        <TouchableOpacity onPress={() => { tts.stop(); setSelectedGenre(null); setStory(''); }}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{selectedGenre.emoji} {selectedGenre.label}</Text>
        {points > 0 && <Text style={styles.points}>⭐ {points}</Text>}
      </View>

      <ScrollView ref={scrollRef} style={styles.content}>

        {/* Video */}
        <View style={styles.videoWrapper}>
          {videoLoading ? (
            <View style={[styles.videoPlaceholder, { backgroundColor: selectedGenre.bg }]}>
              <ActivityIndicator color={selectedGenre.color} />
              <Text style={{ color: selectedGenre.color, marginTop: 6, fontSize: 12 }}>Loading video...</Text>
            </View>
          ) : videoUrl ? (
            <StoryVideo uri={videoUrl} />
          ) : (
            <Image source={{ uri: selectedGenre.img }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
          )}
          <View style={[styles.videoOverlay, { backgroundColor: selectedGenre.color + '55' }]}>
            <Text style={styles.videoTitle}>{selectedGenre.emoji} {selectedGenre.label}</Text>
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>🌐 {selectedLangLabel}</Text>
            </View>
          </View>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={selectedGenre.color} size="large" />
            <Text style={styles.loadingText}>✨ Creating your story in {selectedLangLabel}...</Text>
          </View>
        )}

        {/* Story */}
        {story ? (
          <View style={styles.storyCard}>
            {/* TTS Controls */}
            <View style={styles.ttsBar}>
              <Text style={styles.ttsLabel}>🔊 Read Aloud</Text>
              <View style={styles.ttsBtns}>
                {!tts.speaking ? (
                  <TouchableOpacity style={[styles.ttsBtn, { backgroundColor: selectedGenre.color }]}
                    onPress={() => tts.speak(story, selectedLang)}>
                    <Text style={styles.ttsBtnText}>▶ Play</Text>
                  </TouchableOpacity>
                ) : tts.paused ? (
                  <TouchableOpacity style={[styles.ttsBtn, { backgroundColor: selectedGenre.color }]}
                    onPress={tts.resume}>
                    <Text style={styles.ttsBtnText}>▶ Resume</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.ttsBtn, { backgroundColor: '#FF9800' }]}
                    onPress={tts.pause}>
                    <Text style={styles.ttsBtnText}>⏸ Pause</Text>
                  </TouchableOpacity>
                )}
                {tts.speaking && (
                  <TouchableOpacity style={[styles.ttsBtn, { backgroundColor: '#f44336' }]}
                    onPress={tts.stop}>
                    <Text style={styles.ttsBtnText}>⏹ Stop</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={styles.storyText}>{story}</Text>
          </View>
        ) : null}

        {/* THE END banner + New Story */}
        {!loading && story ? (
          <>
            <View style={[styles.endBanner, { borderColor: selectedGenre.color }]}>
              <Text style={[styles.endText, { color: selectedGenre.color }]}>🌟 THE END 🌟</Text>
              <Text style={styles.endSubText}>Great story! Want another adventure?</Text>
            </View>
            <TouchableOpacity style={[styles.newBtn, { backgroundColor: selectedGenre.color }]}
              onPress={() => handleGenre(selectedGenre)}>
              <Text style={styles.newBtnText}>🔄 New Story</Text>
            </TouchableOpacity>
          </>
        ) : null}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#FFF9F0' },
  header:       { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#4ECDC4' },
  back:         { color: '#fff', fontSize: 16, marginRight: 12 },
  title:        { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },
  points:       { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  content:      { padding: 15 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 10, marginTop: 15 },

  langBtn:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#4ECDC4' },
  langBtnText:          { fontSize: 15, color: '#333', fontWeight: 'bold' },
  arrow:                { fontSize: 13, color: '#888' },
  langDropdown:         { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#ddd', marginTop: 5, padding: 10 },
  groupTitle:           { fontSize: 12, fontWeight: 'bold', color: '#999', marginTop: 10, marginBottom: 5 },
  langGrid:             { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  langChip:             { paddingVertical: 5, paddingHorizontal: 11, backgroundColor: '#f5f5f5', borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  langChipSelected:     { backgroundColor: '#4ECDC4', borderColor: '#4ECDC4' },
  langChipText:         { fontSize: 12, color: '#444' },
  langChipTextSelected: { color: '#fff', fontWeight: 'bold' },

  cardsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  genreCard:  { width: '47%', borderRadius: 16, overflow: 'hidden', marginBottom: 4, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },
  cardImg:    { width: '100%', height: 110 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 6 },
  cardEmoji:  { fontSize: 18 },
  cardLabel:  { color: '#fff', fontWeight: 'bold', fontSize: 13, flex: 1 },

  videoWrapper:     { borderRadius: 16, overflow: 'hidden', marginBottom: 14, height: 200 },
  videoPlaceholder: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center' },
  videoOverlay:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', padding: 14 },
  videoTitle:       { color: '#fff', fontSize: 22, fontWeight: 'bold', textShadowColor: '#000', textShadowRadius: 6, textShadowOffset: { width: 1, height: 1 } },
  langBadge:        { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
  langBadgeText:    { fontSize: 12, color: '#fff', fontWeight: 'bold' },

  loadingBox:  { alignItems: 'center', marginVertical: 30 },
  loadingText: { marginTop: 10, color: '#888', fontSize: 14 },

  storyCard:  { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#eee' },
  ttsBar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  ttsLabel:   { fontSize: 14, fontWeight: 'bold', color: '#555' },
  ttsBtns:    { flexDirection: 'row', gap: 8 },
  ttsBtn:     { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20 },
  ttsBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  storyText:  { fontSize: 16, lineHeight: 30, color: '#333' },

  endBanner:  { alignItems: 'center', padding: 20, marginBottom: 16, borderRadius: 16, borderWidth: 2, backgroundColor: '#fff' },
  endText:    { fontSize: 24, fontWeight: 'bold' },
  endSubText: { fontSize: 14, color: '#888', marginTop: 6 },

  newBtn:     { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  newBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
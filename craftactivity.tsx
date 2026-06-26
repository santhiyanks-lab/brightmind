import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CraftActivityProps {
  idea: string;
  onDone: (completedSteps: number, totalSteps: number) => void;
}

interface Step {
  id: string;
  text: string;
  done: boolean;
  emoji: string;
}

const STEP_EMOJIS = ['✂️', '🖌️', '📌', '🔧', '🎀', '✨', '🧲', '📐', '🪡', '🎉'];

function parseStepsFromText(text: string): Step[] {
  // Try numbered list first: "1. Step text" or "1) Step text"
  const numberedLines = text.split('\n').filter(l => /^\d+[\.\)]\s/.test(l.trim()));
  if (numberedLines.length >= 2) {
    return numberedLines.map((line, i) => ({
      id: `step_${i}`,
      text: line.replace(/^\d+[\.\)]\s*/, '').trim(),
      done: false,
      emoji: STEP_EMOJIS[i % STEP_EMOJIS.length],
    }));
  }

  // Fallback: split by sentences
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
  return sentences.slice(0, 8).map((s, i) => ({
    id: `step_${i}`,
    text: s,
    done: false,
    emoji: STEP_EMOJIS[i % STEP_EMOJIS.length],
  }));
}

async function fetchCraftSteps(idea: string): Promise<Step[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Give me 5-7 simple craft-making steps for a child aged 6-12 to make this:
"${idea}"

Format as a numbered list only, like:
1. Cut the paper into a square shape
2. Fold it in half diagonally
...

Use simple words. Each step should be one short sentence. No preamble, just the numbered list.`,
      }],
    }),
  });
  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  return parseStepsFromText(text);
}

export default function CraftActivity({ idea, onDone }: CraftActivityProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCraftSteps(idea)
      .then(setSteps)
      .catch(() => setError('Could not load steps. Check your connection.'))
      .finally(() => setLoading(false));
  }, [idea]);

  const toggleStep = (id: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const completedCount = steps.filter(s => s.done).length;
  const allDone = completedCount === steps.length && steps.length > 0;
  const progress = steps.length > 0 ? completedCount / steps.length : 0;

  return (
    <View style={styles.container}>
      <View style={styles.ideaBanner}>
        <Text style={styles.ideaLabel}>Craft idea</Text>
        <Text style={styles.ideaText}>{idea}</Text>
      </View>

      {/* Progress bar */}
      {steps.length > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{steps.length} steps done
          </Text>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E67E22" />
            <Text style={styles.loadingText}>Getting craft steps...</Text>
          </View>
        )}

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {steps.map((step, index) => (
          <TouchableOpacity
            key={step.id}
            style={[styles.stepCard, step.done && styles.stepCardDone]}
            onPress={() => toggleStep(step.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.stepCheckbox, step.done && styles.stepCheckboxDone]}>
              {step.done ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepEmoji}>{step.emoji}</Text>
              <Text style={[styles.stepText, step.done && styles.stepTextDone]}>
                {step.text}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {allDone && (
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Amazing work!</Text>
            <Text style={styles.completionSub}>You finished all the steps!</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnPrimary, !allDone && styles.btnPrimaryMuted]}
          onPress={() => onDone(completedCount, steps.length)}
        >
          <Text style={styles.btnPrimaryText}>
            {allDone ? 'I made it! ✓' : `Done for now (${completedCount}/${steps.length})`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  ideaBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    margin: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E67E22',
  },
  ideaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E67E22',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ideaText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  progressSection: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E67E22',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#78909C',
    textAlign: 'right',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#78909C',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
    padding: 16,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  stepCardDone: {
    backgroundColor: '#F1F8E9',
    borderColor: '#AED581',
  },
  stepCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E67E22',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  stepCheckboxDone: {
    backgroundColor: '#E67E22',
    borderColor: '#E67E22',
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E67E22',
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepEmoji: {
    fontSize: 20,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  stepTextDone: {
    color: '#78909C',
    textDecorationLine: 'line-through',
  },
  completionCard: {
    backgroundColor: '#FFF9C4',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF176',
    marginTop: 4,
  },
  completionEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F57F17',
  },
  completionSub: {
    fontSize: 13,
    color: '#F57F17',
    marginTop: 2,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
  },
  btnPrimary: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E67E22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryMuted: {
    backgroundColor: '#FFCC80',
  },
  btnPrimaryText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
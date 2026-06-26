import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────────────────────
type GameCategory = 'home' | 'match' | 'quiz' | 'count' | 'word' | 'memory';
type Difficulty = 'easy' | 'medium' | 'hard';

// ─── Data ────────────────────────────────────────────────────────────────────
const GAME_CARDS = [
  {
    id: 'match',
    emoji: '🃏',
    title: 'Match It!',
    titleTa: 'பொருத்துக!',
    desc: 'Match pictures & words',
    color: '#FF6B6B',
    bg: '#FFF0F0',
    stars: 3,
  },
  {
    id: 'quiz',
    emoji: '🧠',
    title: 'Quiz Zone',
    titleTa: 'வினாடி வினா',
    desc: 'Answer fun questions',
    color: '#845EF7',
    bg: '#F3F0FF',
    stars: 4,
  },
  {
    id: 'count',
    emoji: '🔢',
    title: 'Count & Learn',
    titleTa: 'எண்ணு & கற்று',
    desc: 'Practice numbers 1–20',
    color: '#20C997',
    bg: '#F0FFF9',
    stars: 2,
  },
  {
    id: 'word',
    emoji: '📝',
    title: 'Word Builder',
    titleTa: 'சொல் கட்டி',
    desc: 'Spell simple words',
    color: '#FF922B',
    bg: '#FFF4E6',
    stars: 5,
  },
  {
    id: 'memory',
    emoji: '🧩',
    title: 'Memory Flip',
    titleTa: 'நினைவு விளையாட்டு',
    desc: 'Flip cards, find pairs',
    color: '#339AF0',
    bg: '#E7F5FF',
    stars: 3,
  },
];

const QUIZ_QUESTIONS = [
  { q: 'Which animal says "Moo"? 🐄', options: ['Cat 🐱', 'Cow 🐄', 'Dog 🐶', 'Hen 🐔'], answer: 1 },
  { q: 'What colour is the sky? ☁️', options: ['Green 🟢', 'Red 🔴', 'Blue 🔵', 'Yellow 🟡'], answer: 2 },
  { q: 'How many legs does a spider have? 🕷️', options: ['4', '6', '8', '10'], answer: 2 },
  { q: 'Which fruit is yellow and curved? 🍌', options: ['Apple 🍎', 'Mango 🥭', 'Banana 🍌', 'Grape 🍇'], answer: 2 },
  { q: 'What do fish live in? 🐟', options: ['Sky 🌤️', 'Land 🌍', 'Water 💧', 'Trees 🌳'], answer: 2 },
];

const MATCH_ITEMS = [
  { word: 'Cat', emoji: '🐱' },
  { word: 'Sun', emoji: '☀️' },
  { word: 'Tree', emoji: '🌳' },
  { word: 'Fish', emoji: '🐟' },
  { word: 'Apple', emoji: '🍎' },
  { word: 'Ball', emoji: '⚽' },
];

const MEMORY_EMOJIS = ['🐱', '🐶', '🐸', '🦋', '🌸', '⭐', '🍎', '🚀'];

// ─── Home Screen ─────────────────────────────────────────────────────────────
const HomeScreen = ({ onSelect }: { onSelect: (id: GameCategory) => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.homeHeader}>
        <Text style={styles.homeBadge}>🎮 Brain Games</Text>
        <Text style={styles.homeTitle}>Play & Learn!</Text>
        <Text style={styles.homeSub}>Choose your game and earn stars ⭐</Text>
      </View>

      {/* XP Bar */}
      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>🏆 Your Points</Text>
          <Text style={styles.xpPoints}>240 pts</Text>
        </View>
        <View style={styles.xpBarBg}>
          <View style={[styles.xpBarFill, { width: '60%' }]} />
        </View>
        <Text style={styles.xpHint}>60 more points to Level 4! 🚀</Text>
      </View>

      {/* Game Cards */}
      <Text style={styles.sectionLabel}>🎯 Choose a Game</Text>
      <View style={styles.gameGrid}>
        {GAME_CARDS.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.gameCard, { backgroundColor: g.bg, borderColor: g.color + '40' }]}
            onPress={() => onSelect(g.id as GameCategory)}
            activeOpacity={0.85}
          >
            <View style={[styles.gameIconBg, { backgroundColor: g.color + '20' }]}>
              <Text style={styles.gameEmoji}>{g.emoji}</Text>
            </View>
            <Text style={[styles.gameTitle, { color: g.color }]}>{g.title}</Text>
            <Text style={styles.gameTitleTa}>{g.titleTa}</Text>
            <Text style={styles.gameDesc}>{g.desc}</Text>
            <Text style={styles.gameStars}>{'⭐'.repeat(g.stars)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Challenge */}
      <View style={styles.challengeCard}>
        <Text style={styles.challengeTitle}>🌟 Daily Challenge</Text>
        <Text style={styles.challengeDesc}>Complete any 3 games today to earn a bonus badge!</Text>
        <View style={styles.challengeDots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotFilled]} />
          ))}
        </View>
        <Text style={styles.challengeProgress}>1 / 3 completed</Text>
      </View>

      <View style={{ height: 32 }} />
    </Animated.ScrollView>
  );
};

// ─── Quiz Game ────────────────────────────────────────────────────────────────
const QuizGame = ({ onBack }: { onBack: () => void }) => {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const current = QUIZ_QUESTIONS[qIndex];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === current.answer) {
      setScore((s) => s + 10);
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
    setTimeout(() => {
      if (qIndex + 1 < QUIZ_QUESTIONS.length) {
        setQIndex((q) => q + 1);
        setSelected(null);
      } else {
        setDone(true);
      }
    }, 900);
  };

  if (done) {
    return (
      <View style={styles.resultScreen}>
        <Text style={styles.resultEmoji}>{score >= 40 ? '🏆' : score >= 20 ? '😊' : '💪'}</Text>
        <Text style={styles.resultTitle}>Game Over!</Text>
        <Text style={styles.resultScore}>You scored {score} / {QUIZ_QUESTIONS.length * 10}</Text>
        <Text style={styles.resultStars}>{'⭐'.repeat(Math.ceil(score / 20))}</Text>
        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#845EF7' }]} onPress={onBack}>
          <Text style={styles.btnText}>Back to Games 🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => { setQIndex(0); setScore(0); setSelected(null); setDone(false); }}>
          <Text style={[styles.btnText, { color: '#845EF7' }]}>Play Again 🔄</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {QUIZ_QUESTIONS.map((_, i) => (
          <View key={i} style={[styles.progressDot, i <= qIndex && { backgroundColor: '#845EF7' }]} />
        ))}
      </View>
      <Text style={styles.scoreLabel}>Score: {score} ⭐</Text>

      {/* Question */}
      <Animated.View style={[styles.questionCard, { transform: [{ scale: bounceAnim }] }]}>
        <Text style={styles.questionNum}>Q{qIndex + 1} of {QUIZ_QUESTIONS.length}</Text>
        <Text style={styles.questionText}>{current.q}</Text>
      </Animated.View>

      {/* Options */}
      <View style={styles.optionsGrid}>
        {current.options.map((opt, i) => {
          let bg = '#F8F8F8';
          let border = '#E0E0E0';
          if (selected !== null) {
            if (i === current.answer) { bg = '#D3F9D8'; border = '#40C057'; }
            else if (i === selected && selected !== current.answer) { bg = '#FFE3E3'; border = '#FA5252'; }
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleAnswer(i)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ─── Match Game ───────────────────────────────────────────────────────────────
const MatchGame = ({ onBack }: { onBack: () => void }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const items = MATCH_ITEMS.slice(0, 5);

  const handleWordPress = (word: string) => {
    if (matched.includes(word)) return;
    setSelectedWord(word);
  };

  const handleEmojiPress = (word: string) => {
    if (matched.includes(word)) return;
    if (selectedWord === word) {
      setMatched((m) => [...m, word]);
      setScore((s) => s + 10);
      setSelectedWord(null);
    } else if (selectedWord) {
      setSelectedWord(null);
    }
  };

  const allDone = matched.length === items.length;

  if (allDone) {
    return (
      <View style={styles.resultScreen}>
        <Text style={styles.resultEmoji}>🎉</Text>
        <Text style={styles.resultTitle}>Perfect Match!</Text>
        <Text style={styles.resultScore}>Score: {score} points</Text>
        <Text style={styles.resultStars}>⭐⭐⭐</Text>
        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#FF6B6B' }]} onPress={onBack}>
          <Text style={styles.btnText}>Back to Games 🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => { setMatched([]); setScore(0); setSelectedWord(null); }}>
          <Text style={[styles.btnText, { color: '#FF6B6B' }]}>Play Again 🔄</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.scoreLabel}>Matched: {matched.length} / {items.length} ⭐</Text>
      <Text style={styles.gameInstructions}>👆 Tap a word, then tap the matching picture!</Text>

      <View style={styles.matchContainer}>
        {/* Words column */}
        <View style={styles.matchCol}>
          <Text style={styles.matchColLabel}>Words</Text>
          {items.map((item) => (
            <TouchableOpacity
              key={item.word}
              style={[
                styles.matchWordBtn,
                matched.includes(item.word) && styles.matchedItem,
                selectedWord === item.word && styles.selectedItem,
              ]}
              onPress={() => handleWordPress(item.word)}
            >
              <Text style={[styles.matchWordText, matched.includes(item.word) && { color: '#40C057' }]}>
                {matched.includes(item.word) ? '✓ ' : ''}{item.word}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Connector */}
        <View style={styles.matchLine} />

        {/* Emoji column (shuffled) */}
        <View style={styles.matchCol}>
          <Text style={styles.matchColLabel}>Pictures</Text>
          {[...items].reverse().map((item) => (
            <TouchableOpacity
              key={item.word}
              style={[
                styles.matchEmojiBtn,
                matched.includes(item.word) && styles.matchedItem,
              ]}
              onPress={() => handleEmojiPress(item.word)}
            >
              <Text style={styles.matchEmojiText}>{item.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

// ─── Count Game ───────────────────────────────────────────────────────────────
const CountGame = ({ onBack }: { onBack: () => void }) => {
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(Math.floor(Math.random() * 5) + 1);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [done, setDone] = useState(false);

  const emoji = ['🍎', '⭐', '🐠', '🌸', '🎈'][level % 5];
  const options = Array.from({ length: 4 }, (_, i) => {
    const offset = i - 1;
    return Math.max(1, target + offset);
  }).sort(() => Math.random() - 0.5);

  const handleAnswer = (n: number) => {
    setSelected(n);
    if (n === target) {
      setScore((s) => s + 10);
      setTimeout(() => {
        const newTarget = Math.floor(Math.random() * 9) + 1;
        setTarget(newTarget);
        setLevel((l) => l + 1);
        setSelected(null);
        if (level >= 8) setDone(true);
      }, 700);
    } else {
      setLives((l) => {
        if (l - 1 <= 0) { setDone(true); return 0; }
        return l - 1;
      });
      setTimeout(() => setSelected(null), 700);
    }
  };

  if (done) {
    return (
      <View style={styles.resultScreen}>
        <Text style={styles.resultEmoji}>{score >= 60 ? '🏆' : '💪'}</Text>
        <Text style={styles.resultTitle}>{lives > 0 ? 'Excellent!' : 'Game Over!'}</Text>
        <Text style={styles.resultScore}>Score: {score} points</Text>
        <Text style={styles.resultStars}>{'⭐'.repeat(Math.min(3, Math.ceil(score / 30)))}</Text>
        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#20C997' }]} onPress={onBack}>
          <Text style={styles.btnText}>Back to Games 🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => { setLevel(1); setScore(0); setLives(3); setDone(false); setTarget(Math.floor(Math.random() * 5) + 1); setSelected(null); }}>
          <Text style={[styles.btnText, { color: '#20C997' }]}>Play Again 🔄</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.livesRow}>
        <Text style={styles.livesText}>{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</Text>
        <Text style={styles.scoreLabel}>Score: {score}</Text>
      </View>

      <Text style={styles.countQuestion}>How many {emoji} do you see?</Text>

      <View style={styles.emojiGrid}>
        {Array.from({ length: target }).map((_, i) => (
          <Text key={i} style={styles.countEmoji}>{emoji}</Text>
        ))}
      </View>

      <View style={styles.countOptions}>
        {options.map((n) => {
          let bg = '#F0FFF9';
          let border = '#20C99740';
          if (selected === n) {
            bg = n === target ? '#D3F9D8' : '#FFE3E3';
            border = n === target ? '#40C057' : '#FA5252';
          }
          return (
            <TouchableOpacity
              key={n}
              style={[styles.countBtn, { backgroundColor: bg, borderColor: border }]}
              onPress={() => handleAnswer(n)}
            >
              <Text style={styles.countBtnText}>{n}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ─── Memory Game ──────────────────────────────────────────────────────────────
const MemoryGame = ({ onBack }: { onBack: () => void }) => {
  const pairs = MEMORY_EMOJIS.slice(0, 6);
  const initialCards = [...pairs, ...pairs]
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));

  const [cards, setCards] = useState(initialCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  const handleFlip = (id: number) => {
    if (flipped.length === 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, flipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped.map((fid) => cards.find((c) => c.id === fid)!);
      if (a.emoji === b.emoji) {
        setScore((s) => s + 20);
        setCards((prev) => prev.map((c) => newFlipped.includes(c.id) ? { ...c, matched: true } : c));
        setFlipped([]);
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => newFlipped.includes(c.id) ? { ...c, flipped: false } : c));
          setFlipped([]);
        }, 900);
      }
    }
  };

  const allMatched = cards.every((c) => c.matched);

  if (allMatched) {
    return (
      <View style={styles.resultScreen}>
        <Text style={styles.resultEmoji}>🧩</Text>
        <Text style={styles.resultTitle}>All Matched!</Text>
        <Text style={styles.resultScore}>Score: {score} in {moves} moves</Text>
        <Text style={styles.resultStars}>{'⭐'.repeat(moves <= 8 ? 3 : moves <= 12 ? 2 : 1)}</Text>
        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#339AF0' }]} onPress={onBack}>
          <Text style={styles.btnText}>Back to Games 🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => { setCards(initialCards.sort(() => Math.random() - 0.5)); setFlipped([]); setScore(0); setMoves(0); }}>
          <Text style={[styles.btnText, { color: '#339AF0' }]}>Play Again 🔄</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.livesRow}>
        <Text style={styles.livesText}>🎯 Moves: {moves}</Text>
        <Text style={styles.scoreLabel}>Score: {score}</Text>
      </View>
      <Text style={styles.gameInstructions}>Flip and find matching pairs! 🧩</Text>
      <View style={styles.memoryGrid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.memoryCard,
              (card.flipped || card.matched) && styles.memoryCardFlipped,
              card.matched && styles.memoryCardMatched,
            ]}
            onPress={() => handleFlip(card.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.memoryEmoji}>
              {card.flipped || card.matched ? card.emoji : '❓'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ─── Word Builder ─────────────────────────────────────────────────────────────
const WordGame = ({ onBack }: { onBack: () => void }) => {
  const WORDS = [
    { word: 'CAT', hint: '🐱', scrambled: ['C', 'A', 'T'] },
    { word: 'SUN', hint: '☀️', scrambled: ['N', 'U', 'S'] },
    { word: 'DOG', hint: '🐶', scrambled: ['G', 'O', 'D'] },
    { word: 'BUS', hint: '🚌', scrambled: ['B', 'S', 'U'] },
    { word: 'HEN', hint: '🐔', scrambled: ['E', 'N', 'H'] },
  ];

  const [wIndex, setWIndex] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);

  const current = WORDS[wIndex];

  const handleLetter = (l: string, i: number) => {
    if (typed.length >= current.word.length) return;
    setTyped((t) => [...t, l]);
  };

  const handleCheck = () => {
    const isCorrect = typed.join('') === current.word;
    setCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 15);
    setTimeout(() => {
      if (wIndex + 1 < WORDS.length) {
        setWIndex((w) => w + 1);
        setTyped([]);
        setCorrect(null);
      } else {
        setDone(true);
      }
    }, 900);
  };

  if (done) {
    return (
      <View style={styles.resultScreen}>
        <Text style={styles.resultEmoji}>📝</Text>
        <Text style={styles.resultTitle}>Word Master!</Text>
        <Text style={styles.resultScore}>Score: {score} / {WORDS.length * 15}</Text>
        <Text style={styles.resultStars}>{'⭐'.repeat(Math.ceil(score / 25))}</Text>
        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#FF922B' }]} onPress={onBack}>
          <Text style={styles.btnText}>Back to Games 🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => { setWIndex(0); setTyped([]); setScore(0); setDone(false); setCorrect(null); }}>
          <Text style={[styles.btnText, { color: '#FF922B' }]}>Play Again 🔄</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.scoreLabel}>Score: {score} ⭐  Word {wIndex + 1}/{WORDS.length}</Text>
      <Text style={styles.gameInstructions}>Arrange the letters to form the word! ✏️</Text>

      <View style={styles.wordHintCard}>
        <Text style={styles.wordHintEmoji}>{current.hint}</Text>
        <Text style={styles.wordHintText}>What is this?</Text>
      </View>

      {/* Answer slots */}
      <View style={styles.wordSlots}>
        {Array.from({ length: current.word.length }).map((_, i) => (
          <View key={i} style={[
            styles.wordSlot,
            correct === true && { borderColor: '#40C057', backgroundColor: '#D3F9D8' },
            correct === false && { borderColor: '#FA5252', backgroundColor: '#FFE3E3' },
          ]}>
            <Text style={styles.wordSlotText}>{typed[i] || ''}</Text>
          </View>
        ))}
      </View>

      {/* Letter buttons */}
      <View style={styles.letterBtns}>
        {current.scrambled.map((l, i) => (
          <TouchableOpacity
            key={i}
            style={styles.letterBtn}
            onPress={() => handleLetter(l, i)}
          >
            <Text style={styles.letterBtnText}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.wordActions}>
        <TouchableOpacity style={styles.clearBtn} onPress={() => setTyped([])}>
          <Text style={styles.clearBtnText}>Clear ↩️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkBtn, typed.length < current.word.length && { opacity: 0.5 }]}
          onPress={handleCheck}
          disabled={typed.length < current.word.length}
        >
          <Text style={styles.checkBtnText}>Check ✅</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Games Screen ────────────────────────────────────────────────────────
const GamesScreen = () => {
  const [activeGame, setActiveGame] = useState<GameCategory>('home');

  const gameInfo: Record<GameCategory, { title: string; color: string; emoji: string }> = {
    home: { title: 'Brain Games', color: '#845EF7', emoji: '🎮' },
    quiz: { title: 'Quiz Zone', color: '#845EF7', emoji: '🧠' },
    match: { title: 'Match It!', color: '#FF6B6B', emoji: '🃏' },
    count: { title: 'Count & Learn', color: '#20C997', emoji: '🔢' },
    word: { title: 'Word Builder', color: '#FF922B', emoji: '📝' },
    memory: { title: 'Memory Flip', color: '#339AF0', emoji: '🧩' },
  };

  const info = gameInfo[activeGame];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: info.color + '30' }]}>
        {activeGame !== 'home' ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => setActiveGame('home')}>
            <Text style={[styles.backBtnText, { color: info.color }]}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
        <Text style={[styles.topBarTitle, { color: info.color }]}>
          {info.emoji} {info.title}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Game Area */}
      <ScrollView
        style={styles.gameArea}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {activeGame === 'home' && <HomeScreen onSelect={setActiveGame} />}
        {activeGame === 'quiz' && <QuizGame onBack={() => setActiveGame('home')} />}
        {activeGame === 'match' && <MatchGame onBack={() => setActiveGame('home')} />}
        {activeGame === 'count' && <CountGame onBack={() => setActiveGame('home')} />}
        {activeGame === 'word' && <WordGame onBack={() => setActiveGame('home')} />}
        {activeGame === 'memory' && <MemoryGame onBack={() => setActiveGame('home')} />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GamesScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
  },
  topBarTitle: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
  backBtn: { paddingHorizontal: 4 },
  backBtnText: { fontSize: 15, fontWeight: '600' },
  gameArea: { flex: 1, backgroundColor: '#FAFAFA' },

  // Home
  homeHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  homeBadge: {
    backgroundColor: '#F3F0FF',
    color: '#845EF7',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    overflow: 'hidden',
  },
  homeTitle: { fontSize: 30, fontWeight: '800', color: '#1A1A2E', textAlign: 'center' },
  homeSub: { fontSize: 14, color: '#888', marginTop: 4 },

  xpCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E0FF',
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
  xpPoints: { fontSize: 14, fontWeight: '700', color: '#845EF7' },
  xpBarBg: { height: 8, backgroundColor: '#EEE', borderRadius: 8, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: 8, backgroundColor: '#845EF7', borderRadius: 8 },
  xpHint: { fontSize: 12, color: '#888' },

  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  gameCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  gameIconBg: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  gameEmoji: { fontSize: 26 },
  gameTitle: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  gameTitleTa: { fontSize: 11, color: '#999', marginTop: 1, textAlign: 'center' },
  gameDesc: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 },
  gameStars: { fontSize: 13, marginTop: 6 },

  challengeCard: {
    backgroundColor: '#FFFBF0',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE066',
    marginBottom: 8,
  },
  challengeTitle: { fontSize: 16, fontWeight: '700', color: '#CC9200' },
  challengeDesc: { fontSize: 13, color: '#666', marginTop: 4, marginBottom: 12 },
  challengeDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#EEE', borderWidth: 1, borderColor: '#DDD' },
  dotFilled: { backgroundColor: '#FFD43B', borderColor: '#CC9200' },
  challengeProgress: { fontSize: 12, color: '#888', marginTop: 6 },

  // Quiz
  progressRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 8 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#DDD' },
  scoreLabel: { textAlign: 'center', fontSize: 14, color: '#666', marginBottom: 12 },
  questionCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C5B8F5',
  },
  questionNum: { fontSize: 12, color: '#845EF7', fontWeight: '600', marginBottom: 6 },
  questionText: { fontSize: 20, fontWeight: '700', color: '#3A2E6E', textAlign: 'center', lineHeight: 28 },
  optionsGrid: { gap: 12 },
  optionBtn: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  optionText: { fontSize: 16, fontWeight: '600', color: '#333' },

  // Match
  gameInstructions: { textAlign: 'center', fontSize: 13, color: '#666', marginBottom: 16 },
  matchContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  matchCol: { flex: 1, gap: 8 },
  matchColLabel: { fontSize: 12, fontWeight: '700', color: '#999', textAlign: 'center', marginBottom: 4 },
  matchLine: { width: 1, backgroundColor: '#DDD', alignSelf: 'stretch', marginTop: 32 },
  matchWordBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    borderWidth: 1.5,
    borderColor: '#FF6B6B40',
    alignItems: 'center',
  },
  matchWordText: { fontSize: 15, fontWeight: '600', color: '#333' },
  matchEmojiBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    borderWidth: 1.5,
    borderColor: '#FF6B6B40',
    alignItems: 'center',
  },
  matchEmojiText: { fontSize: 26 },
  matchedItem: { backgroundColor: '#D3F9D8', borderColor: '#40C057' },
  selectedItem: { backgroundColor: '#FFE066', borderColor: '#FCC419', borderWidth: 2 },

  // Count
  livesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  livesText: { fontSize: 20 },
  countQuestion: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', marginBottom: 16 },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    backgroundColor: '#F0FFF9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#20C99730',
  },
  countEmoji: { fontSize: 36 },
  countOptions: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  countBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  countBtnText: { fontSize: 24, fontWeight: '700', color: '#1A1A2E' },

  // Memory
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 8,
  },
  memoryCard: {
    width: (width - 80) / 4,
    height: (width - 80) / 4,
    borderRadius: 12,
    backgroundColor: '#E7F5FF',
    borderWidth: 1.5,
    borderColor: '#339AF040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryCardFlipped: { backgroundColor: '#FFF', borderColor: '#339AF0' },
  memoryCardMatched: { backgroundColor: '#D3F9D8', borderColor: '#40C057' },
  memoryEmoji: { fontSize: 28 },

  // Word
  wordHintCard: {
    backgroundColor: '#FFF4E6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FF922B30',
  },
  wordHintEmoji: { fontSize: 60, marginBottom: 6 },
  wordHintText: { fontSize: 14, color: '#888' },
  wordSlots: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 20 },
  wordSlot: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF922B40',
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordSlotText: { fontSize: 24, fontWeight: '700', color: '#FF922B' },
  letterBtns: { flexDirection: 'row', gap: 12, justifyContent: 'center', marginBottom: 20 },
  letterBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FF922B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBtnText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  wordActions: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  clearBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#EEE',
  },
  clearBtnText: { fontSize: 14, fontWeight: '600', color: '#555' },
  checkBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FF922B',
  },
  checkBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },

  // Result
  resultScreen: { alignItems: 'center', paddingVertical: 40 },
  resultEmoji: { fontSize: 72, marginBottom: 12 },
  resultTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A2E', marginBottom: 6 },
  resultScore: { fontSize: 18, color: '#555', marginBottom: 8 },
  resultStars: { fontSize: 28, marginBottom: 28 },
  btnPrimary: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  btnOutline: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DDD',
    minWidth: 200,
    alignItems: 'center',
  },
  btnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
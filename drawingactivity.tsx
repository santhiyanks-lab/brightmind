import { useRef, useState } from 'react';
import {
    Alert,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface DrawingActivityProps {
  idea: string;
  onDone: (paths: PathData[]) => void;
}

interface PathData {
  d: string;
  color: string;
  width: number;
}

interface Point {
  x: number;
  y: number;
}

const COLORS = [
  '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71',
  '#1ABC9C', '#3498DB', '#9B59B6', '#E91E63',
  '#795548', '#000000', '#FFFFFF', '#607D8B',
];

const BRUSH_SIZES = [3, 6, 10, 16];

export default function DrawingActivity({ idea, onDone }: DrawingActivityProps) {
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState('#3498DB');
  const [selectedSize, setSelectedSize] = useState(6);
  const [canvasLayout, setCanvasLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (evt) => {
      isDrawing.current = true;
      const { locationX, locationY } = evt.nativeEvent;
      lastPoint.current = { x: locationX, y: locationY };
      setCurrentPath(`M${locationX},${locationY}`);
    },

    onPanResponderMove: (evt) => {
      if (!isDrawing.current || !lastPoint.current) return;
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
      lastPoint.current = { x: locationX, y: locationY };
    },

    onPanResponderRelease: () => {
      isDrawing.current = false;
      if (currentPath) {
        setPaths(prev => [...prev, {
          d: currentPath,
          color: selectedColor,
          width: selectedSize,
        }]);
        setCurrentPath('');
      }
      lastPoint.current = null;
    },
  });

  const handleUndo = () => {
    setPaths(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    Alert.alert('Clear drawing?', 'This will erase everything.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setPaths([]) },
    ]);
  };

  const handleDone = () => {
    if (paths.length === 0) {
      Alert.alert('Nothing drawn yet!', 'Draw something first, then tap Done.');
      return;
    }
    onDone(paths);
  };

  return (
    <View style={styles.container}>
      {/* Idea prompt */}
      <View style={styles.ideaBanner}>
        <Text style={styles.ideaLabel}>Your idea</Text>
        <Text style={styles.ideaText}>{idea}</Text>
      </View>

      {/* Canvas */}
      <View
        style={styles.canvas}
        onLayout={(e) => setCanvasLayout(e.nativeEvent.layout)}
        {...panResponder.panHandlers}
      >
        <Svg
          width={canvasLayout.width || '100%'}
          height={canvasLayout.height || 300}
          style={StyleSheet.absoluteFill}
        >
          {paths.map((p, i) => (
            <Path
              key={i}
              d={p.d}
              stroke={p.color}
              strokeWidth={p.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke={selectedColor}
              strokeWidth={selectedSize}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>
        {paths.length === 0 && (
          <Text style={styles.canvasHint}>Draw with your finger ✏️</Text>
        )}
      </View>

      {/* Brush sizes */}
      <View style={styles.sizeRow}>
        {BRUSH_SIZES.map(size => (
          <TouchableOpacity
            key={size}
            onPress={() => setSelectedSize(size)}
            style={[
              styles.sizeButton,
              selectedSize === size && styles.sizeButtonActive,
            ]}
          >
            <View style={[
              styles.sizeDot,
              { width: size * 1.8, height: size * 1.8, borderRadius: size, backgroundColor: selectedColor },
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Color picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow} contentContainerStyle={styles.colorRowContent}>
        {COLORS.map(color => (
          <TouchableOpacity
            key={color}
            onPress={() => setSelectedColor(color)}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              selectedColor === color && styles.colorSwatchSelected,
            ]}
          />
        ))}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleUndo} disabled={paths.length === 0}>
          <Text style={[styles.btnSecondaryText, paths.length === 0 && styles.btnDisabled]}>↩ Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleClear}>
          <Text style={styles.btnSecondaryText}>🗑 Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleDone}>
          <Text style={styles.btnPrimaryText}>Done ✓</Text>
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
    backgroundColor: '#EEF6FF',
    borderRadius: 12,
    padding: 12,
    margin: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498DB',
  },
  ideaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3498DB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ideaText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  canvas: {
    margin: 16,
    marginTop: 8,
    height: 300,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasHint: {
    fontSize: 14,
    color: '#BDBDBD',
    pointerEvents: 'none',
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sizeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  sizeButtonActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#3498DB',
  },
  sizeDot: {},
  colorRow: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  colorRowContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: '#2C3E50',
    transform: [{ scale: 1.15 }],
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  btnSecondary: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  btnSecondaryText: {
    fontSize: 14,
    color: '#546E7A',
    fontWeight: '500',
  },
  btnDisabled: {
    color: '#BDBDBD',
  },
  btnPrimary: {
    flex: 1.5,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
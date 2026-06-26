import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

interface ColoringActivityProps {
  idea: string;
  onDone: (coloredShapes: ColoredShape[]) => void;
}

interface ColoredShape {
  id: string;
  fill: string;
}

interface Shape {
  id: string;
  label: string;
  type: 'path' | 'circle' | 'rect' | 'ellipse';
  props: Record<string, string | number>;
}

const COLORS = [
  '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71',
  '#1ABC9C', '#3498DB', '#9B59B6', '#E91E63',
  '#FF8A65', '#A5D6A7', '#80DEEA', '#CE93D8',
  '#FFFFFF', '#607D8B',
];

// A simple sun + cloud + tree + house scene children can color
const SCENE_SHAPES: Shape[] = [
  {
    id: 'sky',
    label: 'Sky',
    type: 'rect',
    props: { x: 0, y: 0, width: 280, height: 180, rx: 0 },
  },
  {
    id: 'sun',
    label: 'Sun',
    type: 'circle',
    props: { cx: 220, cy: 45, r: 32 },
  },
  {
    id: 'cloud1',
    label: 'Cloud',
    type: 'ellipse',
    props: { cx: 80, cy: 38, rx: 40, ry: 22 },
  },
  {
    id: 'ground',
    label: 'Grass',
    type: 'rect',
    props: { x: 0, y: 175, width: 280, height: 50, rx: 0 },
  },
  {
    id: 'house_wall',
    label: 'House wall',
    type: 'rect',
    props: { x: 90, y: 110, width: 80, height: 70, rx: 4 },
  },
  {
    id: 'roof',
    label: 'Roof',
    type: 'path',
    props: { d: 'M80,115 L130,72 L180,115 Z' },
  },
  {
    id: 'door',
    label: 'Door',
    type: 'rect',
    props: { x: 118, y: 148, width: 24, height: 32, rx: 3 },
  },
  {
    id: 'window',
    label: 'Window',
    type: 'rect',
    props: { x: 100, y: 120, width: 22, height: 20, rx: 3 },
  },
  {
    id: 'tree_trunk',
    label: 'Tree trunk',
    type: 'rect',
    props: { x: 34, y: 148, width: 12, height: 30, rx: 2 },
  },
  {
    id: 'tree_top',
    label: 'Tree top',
    type: 'ellipse',
    props: { cx: 40, cy: 138, rx: 24, ry: 28 },
  },
];

const DEFAULT_FILLS: Record<string, string> = {
  sky: '#E3F2FD',
  sun: '#FFF9C4',
  cloud1: '#FFFFFF',
  ground: '#C8E6C9',
  house_wall: '#FFCCBC',
  roof: '#EF9A9A',
  door: '#A1887F',
  window: '#B3E5FC',
  tree_trunk: '#BCAAA4',
  tree_top: '#C8E6C9',
};

export default function ColoringActivity({ idea, onDone }: ColoringActivityProps) {
  const [fills, setFills] = useState<Record<string, string>>(DEFAULT_FILLS);
  const [selectedColor, setSelectedColor] = useState('#3498DB');
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  const handleShapeTap = (id: string) => {
    setFills(prev => ({ ...prev, [id]: selectedColor }));
    setSelectedShapeId(id);
  };

  const handleDone = () => {
    onDone(Object.entries(fills).map(([id, fill]) => ({ id, fill })));
  };

  const handleReset = () => {
    Alert.alert('Reset colors?', 'All colors will go back to default.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', onPress: () => setFills(DEFAULT_FILLS) },
    ]);
  };

  const renderShape = (shape: Shape) => {
    const fill = fills[shape.id] || '#F5F5F5';
    const stroke = '#546E7A';
    const strokeWidth = 1.5;
    const isSelected = selectedShapeId === shape.id;
    const commonProps = {
      fill,
      stroke: isSelected ? '#3498DB' : stroke,
      strokeWidth: isSelected ? 2.5 : strokeWidth,
      onPress: () => handleShapeTap(shape.id),
    };

    if (shape.type === 'path') {
      return <Path key={shape.id} {...commonProps} d={shape.props.d as string} />;
    }
    if (shape.type === 'circle') {
      return <Circle key={shape.id} {...commonProps} cx={shape.props.cx as number} cy={shape.props.cy as number} r={shape.props.r as number} />;
    }
    if (shape.type === 'rect') {
      return <Rect key={shape.id} {...commonProps} x={shape.props.x as number} y={shape.props.y as number} width={shape.props.width as number} height={shape.props.height as number} rx={shape.props.rx as number} />;
    }
    if (shape.type === 'ellipse') {
      return <Ellipse key={shape.id} {...commonProps} cx={shape.props.cx as number} cy={shape.props.cy as number} rx={shape.props.rx as number} ry={shape.props.ry as number} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.ideaBanner}>
        <Text style={styles.ideaLabel}>Your idea</Text>
        <Text style={styles.ideaText}>{idea}</Text>
      </View>

      <Text style={styles.hint}>Tap a color, then tap a shape to fill it 🎨</Text>

      {/* SVG coloring scene */}
      <View style={styles.svgWrapper}>
        <Svg viewBox="0 0 280 225" width="100%" height={240}>
          {SCENE_SHAPES.map(renderShape)}
        </Svg>
      </View>

      {/* Color palette */}
      <View style={styles.paletteSection}>
        <Text style={styles.paletteLabel}>Pick a color</Text>
        <View style={styles.palette}>
          {COLORS.map(color => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.swatch,
                { backgroundColor: color },
                selectedColor === color && styles.swatchSelected,
                color === '#FFFFFF' && styles.swatchWhite,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Selected info */}
      {selectedShapeId && (
        <Text style={styles.tapInfo}>
          Colored: {SCENE_SHAPES.find(s => s.id === selectedShapeId)?.label}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleReset}>
          <Text style={styles.btnSecondaryText}>↺ Reset</Text>
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
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
    padding: 12,
    margin: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9B59B6',
  },
  ideaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9B59B6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ideaText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  hint: {
    fontSize: 13,
    color: '#78909C',
    textAlign: 'center',
    marginBottom: 8,
  },
  svgWrapper: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  paletteSection: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  paletteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78909C',
    marginBottom: 8,
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: '#2C3E50',
    transform: [{ scale: 1.2 }],
  },
  swatchWhite: {
    borderColor: '#E0E0E0',
  },
  tapInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9B59B6',
    marginTop: 8,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
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
  btnPrimary: {
    flex: 2,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#9B59B6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
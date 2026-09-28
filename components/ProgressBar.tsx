import { View, type ViewStyle } from 'react-native';
import { useTheme } from '@/lib/theme';

type Props = {
  value: number; // entre 0 et 1
  color?: string;
  trackColor?: string;
  height?: number;
  // Texte lu par le lecteur d'écran, ex : "12 cartes vues sur 48"
  label: string;
  style?: ViewStyle;
};

export function ProgressBar({ value, color, trackColor, height = 8, label, style }: Props) {
  const { colors } = useTheme();
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <View
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      accessibilityLabel={label}
      style={[
        {
          width: '100%',
          overflow: 'hidden',
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor ?? colors.bg.subtle,
        },
        style,
      ]}
    >
      <View
        style={{ width: `${pct}%`, height, borderRadius: height / 2, backgroundColor: color ?? colors.brand.primary }}
      />
    </View>
  );
}

// Icônes de la barre de navigation (Accueil, Parcours, Stats, Profil)
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconProps = { color: string };

export function IconAccueil({ color }: IconProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={9} width={18} height={13} rx={4} fill={color} />
      <Path d="M12 1L21.5263 8.5H2.47372L12 1Z" fill={color} />
    </Svg>
  );
}

export function IconParcours({ color }: IconProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={3.5} rx={2} fill={color} />
      <Rect x={3} y={10.5} width={18} height={3.5} rx={2} fill={color} />
      <Rect x={3} y={17} width={12} height={3.5} rx={2} fill={color} />
    </Svg>
  );
}

export function IconStats({ color }: IconProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={13} width={4.5} height={9} rx={2} fill={color} />
      <Rect x={9.75} y={7} width={4.5} height={15} rx={2} fill={color} />
      <Rect x={16.5} y={2} width={4.5} height={20} rx={2} fill={color} />
    </Svg>
  );
}

export function IconProfil({ color }: IconProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={6.5} r={4.5} fill={color} />
      <Path
        d="M3 21C3 19.9494 3.23279 18.9091 3.68508 17.9385C4.13738 16.9679 4.80031 16.086 5.63604 15.3431C6.47177 14.6003 7.46392 14.011 8.55585 13.609C9.64778 13.2069 10.8181 13 12 13C13.1819 13 14.3522 13.2069 15.4442 13.609C16.5361 14.011 17.5282 14.6003 18.364 15.3431C19.1997 16.086 19.8626 16.9679 20.3149 17.9385C20.7672 18.9091 21 19.9494 21 21L12 21L3 21Z"
        fill={color}
      />
    </Svg>
  );
}

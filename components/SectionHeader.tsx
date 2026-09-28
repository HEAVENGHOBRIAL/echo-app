import { Text, View } from 'react-native';
import { TextLink } from '@/components/TextLink';
import { makeStyles } from '@/lib/theme';
import { typography } from '@/theme';

type Props = {
  title: string;
  linkLabel?: string;
  onLinkPress?: () => void;
};

// Titre de section (ex : "Tes parcours" + lien "Voir tout")
export function SectionHeader({ title, linkLabel, onLinkPress }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text role="heading" aria-level={2} style={styles.title}>
        {title}
      </Text>
      {linkLabel && onLinkPress && <TextLink label={linkLabel} onPress={onLinkPress} />}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  title: { ...typography.h2, color: c.text.primary, flexShrink: 1 },
}));

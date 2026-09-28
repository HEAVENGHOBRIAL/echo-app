// Réglages : langue (FR / EN) et thème (Auto / Clair / Sombre)
import { Pressable, Text, View } from 'react-native';
import { focusStyles, type PressState } from '@/components/focus';
import { useLang, type Lang } from '@/lib/i18n';
import { makeStyles, useTheme, type ThemePref } from '@/lib/theme';
import { radius, spacing, typography } from '@/theme';

// Bloc complet (onglet Profil)
export function SettingsPanel() {
  const styles = useStyles();
  const { t, lang, setLang } = useLang();
  const { pref, setPref } = useTheme();

  return (
    <View style={styles.panel}>
      <Text role="heading" aria-level={2} style={styles.panelTitle}>
        {t.settings.title}
      </Text>
      <Segmented<Lang>
        label={t.settings.language}
        value={lang}
        onChange={setLang}
        options={[
          { value: 'fr', label: 'Français' },
          { value: 'en', label: 'English' },
        ]}
      />
      <Segmented<ThemePref>
        label={t.settings.theme}
        value={pref}
        onChange={setPref}
        options={[
          { value: 'system', label: t.settings.themeSystem },
          { value: 'light', label: t.settings.themeLight },
          { value: 'dark', label: t.settings.themeDark },
        ]}
      />
    </View>
  );
}

// Petits boutons rapides (onboarding, barre latérale) : "EN" / "FR" et ☾ / ☀
export function QuickToggles() {
  const styles = useStyles();
  const { t, lang, setLang } = useLang();
  const { scheme, setPref } = useTheme();
  const dark = scheme === 'dark';

  return (
    <View style={styles.quick}>
      <Pressable
        onPress={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        accessibilityRole="button"
        accessibilityLabel={t.settings.switchLang}
        style={({ focused, pressed }: PressState) => [styles.pill, pressed && styles.pillPressed, focused && focusStyles.ring]}
      >
        <Text style={styles.pillText}>{t.settings.switchLangShort}</Text>
      </Pressable>
      <Pressable
        onPress={() => setPref(dark ? 'light' : 'dark')}
        accessibilityRole="button"
        accessibilityLabel={dark ? t.settings.darkOff : t.settings.darkOn}
        style={({ focused, pressed }: PressState) => [styles.pill, pressed && styles.pillPressed, focused && focusStyles.ring]}
      >
        <Text style={styles.pillText}>{dark ? '☀' : '☾'}</Text>
      </Pressable>
    </View>
  );
}

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
};

// Choix unique en boutons côte à côte (lu comme un groupe de boutons radio)
function Segmented<T extends string>({ label, value, onChange, options }: SegmentedProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.segments} role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              role="radio"
              aria-checked={selected}
              accessibilityLabel={o.label}
              style={({ focused }: PressState) => [
                styles.segment,
                selected && styles.segmentOn,
                focused && focusStyles.ring,
              ]}
            >
              <Text style={[styles.segmentText, selected && styles.segmentTextOn]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  panel: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.bg.surface,
  },
  panelTitle: { ...typography.h2, color: c.text.primary },
  group: { gap: spacing.sm },
  groupLabel: { ...typography.caption, color: c.text.secondary },
  segments: { flexDirection: 'row', gap: 6, padding: 4, borderRadius: radius.md, backgroundColor: c.bg.subtle },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
  },
  segmentOn: { backgroundColor: c.bg.surface, borderWidth: 1.5, borderColor: c.brand.primary },
  segmentText: { ...typography.label, color: c.text.secondary },
  segmentTextOn: { color: c.text.primary },

  quick: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.bg.surface,
  },
  pillPressed: { backgroundColor: c.bg.subtle },
  pillText: { ...typography.label, color: c.text.primary },
}));

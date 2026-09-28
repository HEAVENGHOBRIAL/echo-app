// Navigation principale : Accueil · Parcours · Stats · Profil
// - Mobile : barre en bas (comme le Figma)
// - Ordinateur / tablette paysage : barre latérale à gauche
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ComponentType } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { focusStyles, type PressState } from '@/components/focus';
import { Logo } from '@/components/Logo';
import { IconAccueil, IconParcours, IconProfil, IconStats } from '@/components/NavIcons';
import { QuickToggles } from '@/components/Settings';
import { useT } from '@/lib/i18n';
import { makeStyles, useTheme } from '@/lib/theme';
import { fonts, layout, spacing, typography } from '@/theme';

export default function TabsLayout() {
  const styles = useStyles();
  const t = useT();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= layout.wideBreakpoint;

  return (
    <Tabs style={[styles.root, { flexDirection: wide ? 'row' : 'column-reverse' }]}>
      <TabList
        role="navigation"
        aria-label={t.tabs.nav}
        style={
          wide
            ? [styles.sidebar, { paddingTop: insets.top + spacing.lg }]
            : [styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]
        }
      >
        {wide && (
          <View style={styles.brand}>
            <Logo />
            <Text style={styles.brandName}>Echo</Text>
          </View>
        )}
        <TabTrigger name="home" href="/home" asChild>
          <NavItem label={t.tabs.home} Icon={IconAccueil} wide={wide} />
        </TabTrigger>
        <TabTrigger name="parcours" href="/parcours" asChild>
          <NavItem label={t.tabs.tracks} Icon={IconParcours} wide={wide} />
        </TabTrigger>
        <TabTrigger name="stats" href="/stats" asChild>
          <NavItem label={t.tabs.stats} Icon={IconStats} wide={wide} />
        </TabTrigger>
        <TabTrigger name="profil" href="/profil" asChild>
          <NavItem label={t.tabs.profile} Icon={IconProfil} wide={wide} />
        </TabTrigger>
        {wide && (
          <View style={styles.sidebarFooter}>
            <QuickToggles />
          </View>
        )}
      </TabList>

      <TabSlot style={styles.slot} />
    </Tabs>
  );
}

type NavItemProps = TabTriggerSlotProps & {
  label: string;
  Icon: ComponentType<{ color: string }>;
  wide: boolean;
};

const NavItem = forwardRef<View, NavItemProps>(function NavItem(
  { label, Icon, wide, isFocused, style: _style, ...props },
  ref,
) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      ref={ref}
      {...props}
      role="link"
      aria-label={label}
      aria-current={isFocused ? 'page' : undefined}
      style={({ focused, pressed }: PressState) => [
        wide ? styles.itemWide : styles.item,
        wide && isFocused && styles.itemWideActive,
        pressed && styles.itemPressed,
        focused && focusStyles.ring,
      ]}
    >
      <Icon color={isFocused ? colors.brand.primary : colors.text.muted} />
      <Text
        style={[
          wide ? styles.labelWide : styles.label,
          isFocused ? styles.labelActive : styles.labelIdle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
});

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg.app },
  slot: { flex: 1 },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: spacing.lg,
    backgroundColor: c.bg.surface,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  item: { alignItems: 'center', gap: 4, minWidth: 64, minHeight: 44, borderRadius: 8, paddingVertical: 2 },
  label: typography.caption,
  labelActive: { color: c.brand.primary, fontFamily: fonts.semibold },
  labelIdle: { color: c.text.secondary },

  sidebar: {
    // TabList est en ligne par défaut : on force la colonne
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    width: 240,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: c.bg.surface,
    borderRightWidth: 1,
    borderRightColor: c.border,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg, paddingHorizontal: 8 },
  brandName: { ...typography.h1, color: c.text.primary },
  itemWide: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 12, borderRadius: 12 },
  itemWideActive: { backgroundColor: c.brand.soft },
  itemPressed: { opacity: 0.7 },
  labelWide: typography.label,
  sidebarFooter: { marginTop: 'auto', paddingHorizontal: 8 },
}));

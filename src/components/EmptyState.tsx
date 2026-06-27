import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppButton } from './AppButton';

interface Props { title: string; subtitle?: string; ctaLabel?: string; onCta?: () => void; }

export const EmptyState: React.FC<Props> = ({ title, subtitle, ctaLabel, onCta }) => (
  <View style={styles.wrap}>
    <Text style={styles.icon}>🔍</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    {ctaLabel && onCta ? <AppButton title={ctaLabel} onPress={onCta} style={styles.btn} /> : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#0B1F3A', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#8A9BB0', textAlign: 'center', marginBottom: 24 },
  btn: { alignSelf: 'center' },
});
import React, { ReactNode } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  padded?: boolean;
}

export const ScreenContainer: React.FC<Props> = ({ children, scroll = false, style, padded = true }) => {
  const inner = <View style={[padded && styles.padded, style]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe}>
      {scroll
        ? <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">{inner}</ScrollView>
        : <View style={styles.flex}>{inner}</View>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F4F7' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  padded: { padding: 20 },
});
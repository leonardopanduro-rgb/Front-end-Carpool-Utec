import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const AppInput: React.FC<Props> = ({ label, error, rightIcon, isPassword, ...rest }) => {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, error ? styles.rowErr : null]}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#8A9BB0"
          secureTextEntry={isPassword && !show}
          autoCapitalize="none"
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShow(v => !v)} style={styles.eye}>
            <Text style={{ color: '#8A9BB0', fontSize: 13 }}>{show ? 'Ocultar' : 'Ver'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon}
      </View>
      {error ? <Text style={styles.err}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#0B1F3A', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#D0D9E8', borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: 14 },
  rowErr: { borderColor: '#E53E3E' },
  input: { flex: 1, height: 48, fontSize: 15, color: '#0B1F3A' },
  eye: { paddingHorizontal: 8 },
  err: { color: '#E53E3E', fontSize: 12, marginTop: 4 },
});
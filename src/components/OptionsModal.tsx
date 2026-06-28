import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';

interface Option { label: string; value: string; }

interface Props {
  visible: boolean;
  title: string;
  options: Option[];
  selected?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  searchable?: boolean;
}

/** Selector en modal (bottom sheet) con lista scrolleable y búsqueda opcional. */
export const OptionsModal = ({ visible, title, options, selected, onSelect, onClose, searchable }: Props) => {
  const [query, setQuery] = useState('');
  const list = searchable && query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const choose = (value: string) => { onSelect(value); setQuery(''); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          {searchable && (
            <TextInput
              style={styles.search}
              placeholder="Buscar..."
              placeholderTextColor="#8A9BB0"
              value={query}
              onChangeText={setQuery}
            />
          )}
          <FlatList
            data={list}
            keyExtractor={o => o.value}
            keyboardShouldPersistTaps="handled"
            style={styles.listWrap}
            renderItem={({ item }) => {
              const active = item.value === selected;
              return (
                <TouchableOpacity style={styles.row} onPress={() => choose(item.value)}>
                  <Text style={[styles.rowTxt, active && styles.rowActive]}>{item.label}</Text>
                  {active && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={styles.empty}>Sin resultados</Text>}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(11,31,58,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 14, paddingBottom: 24, maxHeight: '75%' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginBottom: 10 },
  title: { fontSize: 17, fontWeight: '800', color: '#0B1F3A' },
  close: { fontSize: 18, color: '#8A9BB0', fontWeight: '700' },
  search: { marginHorizontal: 18, marginBottom: 8, borderWidth: 1.5, borderColor: '#D0D9E8', borderRadius: 10, height: 44, paddingHorizontal: 14, color: '#0B1F3A' },
  listWrap: { paddingHorizontal: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 10 },
  rowTxt: { fontSize: 15, color: '#0B1F3A' },
  rowActive: { color: '#18A8E0', fontWeight: '800' },
  check: { color: '#18A8E0', fontSize: 16, fontWeight: '800' },
  empty: { textAlign: 'center', color: '#8A9BB0', paddingVertical: 24 },
});

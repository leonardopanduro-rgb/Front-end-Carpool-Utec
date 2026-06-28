import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
  /** Día mínimo seleccionable (por defecto: hoy). */
  minDate?: Date;
};

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DOW = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const roundedNow = () => {
  const d = new Date();
  d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0);
  return d;
};

const pad = (n: number) => String(n).padStart(2, '0');

const formatDisplay = (d: Date) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}  ·  ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const DateTimePicker = ({ label, value, onChange, error, minDate }: Props) => {
  const [open, setOpen] = useState(false);
  const min = stripTime(minDate ?? new Date());

  // Estado borrador (no se aplica hasta confirmar)
  const [viewYear, setViewYear] = useState(0);
  const [viewMonth, setViewMonth] = useState(0);
  const [selDay, setSelDay] = useState<Date | null>(null);
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);

  const openPicker = () => {
    const base = value ?? roundedNow();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setSelDay(value ? stripTime(value) : null);
    setHour(base.getHours());
    setMinute(Math.round(base.getMinutes() / 5) * 5 % 60);
    setOpen(true);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const stepHour = (delta: number) => setHour((h) => (h + delta + 24) % 24);
  const stepMin = (delta: number) => setMinute((m) => (m + delta * 5 + 60) % 60);

  const firstOffset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const confirm = () => {
    if (!selDay) return;
    onChange(new Date(selDay.getFullYear(), selDay.getMonth(), selDay.getDate(), hour, minute, 0));
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.field, error && styles.fieldErr]} onPress={openPicker} activeOpacity={0.8}>
        <Text style={value ? styles.fieldVal : styles.fieldPlaceholder}>
          {value ? `📅 ${formatDisplay(value)}` : 'Toca para elegir fecha y hora'}
        </Text>
      </TouchableOpacity>
      {error ? <Text style={styles.err}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            {/* Encabezado mes */}
            <View style={styles.monthRow}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}><Text style={styles.navTxt}>‹</Text></TouchableOpacity>
              <Text style={styles.monthTxt}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}><Text style={styles.navTxt}>›</Text></TouchableOpacity>
            </View>

            {/* Días de la semana */}
            <View style={styles.grid}>
              {DOW.map((d) => (
                <View key={d} style={styles.cell}><Text style={styles.dowTxt}>{d}</Text></View>
              ))}
            </View>

            {/* Grilla de días */}
            <View style={styles.grid}>
              {cells.map((day, i) => {
                if (day === null) return <View key={`b${i}`} style={styles.cell} />;
                const date = new Date(viewYear, viewMonth, day);
                const disabled = stripTime(date) < min;
                const selected = !!selDay && stripTime(date).getTime() === selDay.getTime();
                return (
                  <TouchableOpacity
                    key={day}
                    style={styles.cell}
                    disabled={disabled}
                    onPress={() => setSelDay(stripTime(date))}
                  >
                    <View style={[styles.dayInner, selected && styles.daySelected]}>
                      <Text style={[styles.dayTxt, disabled && styles.dayDisabled, selected && styles.dayTxtSelected]}>
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selector de hora */}
            <Text style={styles.timeLabel}>Hora de salida</Text>
            <View style={styles.timeRow}>
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => stepHour(-1)} style={styles.stepBtn}><Text style={styles.stepTxt}>−</Text></TouchableOpacity>
                <Text style={styles.timeVal}>{pad(hour)}</Text>
                <TouchableOpacity onPress={() => stepHour(1)} style={styles.stepBtn}><Text style={styles.stepTxt}>+</Text></TouchableOpacity>
              </View>
              <Text style={styles.colon}>:</Text>
              <View style={styles.stepper}>
                <TouchableOpacity onPress={() => stepMin(-1)} style={styles.stepBtn}><Text style={styles.stepTxt}>−</Text></TouchableOpacity>
                <Text style={styles.timeVal}>{pad(minute)}</Text>
                <TouchableOpacity onPress={() => stepMin(1)} style={styles.stepBtn}><Text style={styles.stepTxt}>+</Text></TouchableOpacity>
              </View>
            </View>

            {/* Acciones */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setOpen(false)} style={[styles.actionBtn, styles.cancelBtn]}>
                <Text style={styles.cancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirm} disabled={!selDay} style={[styles.actionBtn, styles.okBtn, !selDay && styles.okDisabled]}>
                <Text style={styles.okTxt}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#0B1F3A', marginBottom: 6 },
  field: { borderWidth: 1.5, borderColor: '#D0D9E8', borderRadius: 10, backgroundColor: '#fff', height: 48, justifyContent: 'center', paddingHorizontal: 14 },
  fieldErr: { borderColor: '#E53E3E' },
  fieldVal: { color: '#0B1F3A', fontSize: 15, fontWeight: '600' },
  fieldPlaceholder: { color: '#8A9BB0', fontSize: 15 },
  err: { color: '#E53E3E', fontSize: 12, marginTop: 4 },

  backdrop: { flex: 1, backgroundColor: 'rgba(11,31,58,0.55)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, maxWidth: 360, width: '100%', alignSelf: 'center' },

  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F7FD', alignItems: 'center', justifyContent: 'center' },
  navTxt: { fontSize: 22, color: '#18A8E0', fontWeight: '800', lineHeight: 24 },
  monthTxt: { fontSize: 16, fontWeight: '800', color: '#0B1F3A' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' },
  dowTxt: { fontSize: 12, fontWeight: '700', color: '#8A9BB0' },
  dayInner: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: '#18A8E0' },
  dayTxt: { fontSize: 14, color: '#0B1F3A', fontWeight: '600' },
  dayTxtSelected: { color: '#fff', fontWeight: '800' },
  dayDisabled: { color: '#CBD5E1' },

  timeLabel: { fontSize: 13, fontWeight: '700', color: '#0B1F3A', marginTop: 14, marginBottom: 8, textAlign: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F4F7', borderRadius: 10, paddingHorizontal: 4 },
  stepBtn: { width: 38, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontSize: 22, color: '#18A8E0', fontWeight: '800' },
  timeVal: { fontSize: 20, fontWeight: '800', color: '#0B1F3A', minWidth: 34, textAlign: 'center' },
  colon: { fontSize: 22, fontWeight: '800', color: '#0B1F3A' },

  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  actionBtn: { flex: 1, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { backgroundColor: '#F2F4F7' },
  cancelTxt: { color: '#0B1F3A', fontWeight: '700', fontSize: 15 },
  okBtn: { backgroundColor: '#18A8E0' },
  okDisabled: { backgroundColor: '#A8D8EC' },
  okTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

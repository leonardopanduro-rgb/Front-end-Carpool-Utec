import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useVehicles } from '../hooks/useVehicles';
import { vehicleService } from '../services/vehicle';
import { Vehicle, VehicleRequest } from '../types/vehicle';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { VehicleCard } from '../components/VehicleCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { parseAxiosError } from '../utils/errorMessages';

export const VehicleScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { vehicles, loading, error, fetch } = useVehicles();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ plate:'', brand:'', model:'', color:'', seats:'' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number|null>(null);
  const [formErrors, setFormErrors] = useState<Record<string,string>>({});

  useEffect(() => { fetch(); }, []);
  const myVehicles = vehicles.filter(v => v.ownerId === user?.id);

  const openCreate = () => { setEditing(null); setForm({plate:'',brand:'',model:'',color:'',seats:''}); setFormErrors({}); setModal(true); };
  const openEdit = (v: Vehicle) => { setEditing(v); setForm({plate:v.plate,brand:v.brand,model:v.model,color:v.color,seats:String(v.seats)}); setFormErrors({}); setModal(true); };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.plate.trim()) e.plate = 'Requerido';
    if (!form.brand.trim()) e.brand = 'Requerido';
    if (!form.model.trim()) e.model = 'Requerido';
    if (!form.color.trim()) e.color = 'Requerido';
    const s = parseInt(form.seats);
    if (isNaN(s) || s <= 0) e.seats = 'Debe ser mayor a 0';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const data: VehicleRequest = { plate:form.plate.trim(), brand:form.brand.trim(), model:form.model.trim(), color:form.color.trim(), seats:parseInt(form.seats) };
    try {
      if (editing) await vehicleService.update(editing.id, data);
      else await vehicleService.create(data);
      setModal(false); fetch();
    } catch (err: any) {
      Alert.alert('Error', parseAxiosError(err).message);
    } finally { setSaving(false); }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Eliminar vehículo','¿Seguro?',[
      {text:'Cancelar',style:'cancel'},
      {text:'Eliminar',style:'destructive',onPress:async()=>{
        setDeleting(id);
        try { await vehicleService.remove(id); fetch(); }
        catch(err:any){ Alert.alert('Error',parseAxiosError(err).message); }
        finally{ setDeleting(null); }
      }},
    ]);
  };

  const set = (k: string, v: string) => setForm(f => ({...f,[k]:v}));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis vehículos</Text>
        <AppButton title="+ Agregar" onPress={openCreate} style={styles.addBtn} />
      </View>
      {loading ? <LoadingState /> : error ? <ErrorMessage error={error} onRetry={fetch} /> : myVehicles.length === 0
        ? <EmptyState title="Sin vehículos registrados" subtitle="Agrega tu auto para publicar como conductor" ctaLabel="Registrar vehículo" onCta={openCreate} />
        : <ScrollView contentContainerStyle={{padding:20}}>
            {myVehicles.map(v => <VehicleCard key={v.id} vehicle={v} onEdit={()=>openEdit(v)} onDelete={()=>handleDelete(v.id)} />)}
          </ScrollView>}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Editar vehículo' : 'Nuevo vehículo'}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <AppInput label="Placa" value={form.plate} onChangeText={v=>set('plate',v)} placeholder="ABC-123" error={formErrors.plate} />
              <AppInput label="Marca" value={form.brand} onChangeText={v=>set('brand',v)} placeholder="Toyota" error={formErrors.brand} />
              <AppInput label="Modelo" value={form.model} onChangeText={v=>set('model',v)} placeholder="Yaris" error={formErrors.model} />
              <AppInput label="Color" value={form.color} onChangeText={v=>set('color',v)} placeholder="Blanco" error={formErrors.color} />
              <AppInput label="Asientos" value={form.seats} onChangeText={v=>set('seats',v)} keyboardType="number-pad" placeholder="4" error={formErrors.seats} />
              <AppButton title={editing ? 'Guardar cambios' : 'Registrar'} onPress={handleSave} loading={saving} />
              <AppButton title="Cancelar" onPress={()=>setModal(false)} variant="outline" style={{marginTop:10}} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F2F4F7'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:20},
  title:{fontSize:22,fontWeight:'800',color:'#0B1F3A'},
  addBtn:{paddingHorizontal:16,height:40},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'},
  modalCard:{backgroundColor:'#fff',borderTopLeftRadius:20,borderTopRightRadius:20,padding:24,maxHeight:'85%'},
  modalTitle:{fontSize:20,fontWeight:'800',color:'#0B1F3A',marginBottom:20},
});
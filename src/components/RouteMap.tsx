import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;

export type MapPoint = { lat: number; lng: number } | string;

interface Props {
  origin: MapPoint;
  destination: MapPoint;
  waypoints?: MapPoint[];
  height?: number;
  /** Permite tocar el mapa para marcar un punto (devuelto por onPick). */
  pickable?: boolean;
  onPick?: (p: { lat: number; lng: number }) => void;
}

// Serializa un punto para Google Directions: coords -> {lat,lng}; texto -> string geocodable.
const serialize = (p: MapPoint): string => {
  if (typeof p === 'string') return JSON.stringify(`${p}, Lima, Peru`);
  return JSON.stringify({ lat: p.lat, lng: p.lng });
};

export const RouteMap: React.FC<Props> = ({ origin, destination, waypoints = [], height = 240, pickable = false, onPick }) => {
  const [info, setInfo] = useState<{ km: string; min: number } | null>(null);

  if (!KEY || KEY === 'PEGA_TU_KEY_AQUI') {
    return (
      <View style={[styles.fallback, { height }]}>
        <Text style={styles.fallbackTxt}>🗺️ Configura EXPO_PUBLIC_GOOGLE_MAPS_KEY para ver el mapa de la ruta.</Text>
      </View>
    );
  }

  const wpts = waypoints.map(w => `{location:${serialize(w)},stopover:true}`).join(',');

  const html = `<!DOCTYPE html><html><head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>html,body,#map{height:100%;margin:0;padding:0}#err{font:14px sans-serif;color:#555;padding:16px}</style>
  </head><body>
  <div id="map"></div>
  <script>
    function post(o){ if(window.ReactNativeWebView){ window.ReactNativeWebView.postMessage(JSON.stringify(o)); } }
    function initMap(){
      var map=new google.maps.Map(document.getElementById('map'),{zoom:13,center:{lat:-12.068,lng:-77.08},mapTypeControl:false,streetViewControl:false,fullscreenControl:false});
      var ds=new google.maps.DirectionsService();
      var dr=new google.maps.DirectionsRenderer({map:map});
      var pickMarker=null;
      ${pickable ? "map.addListener('click',function(e){var pos=e.latLng;if(pickMarker){pickMarker.setPosition(pos);}else{pickMarker=new google.maps.Marker({position:pos,map:map,label:'P'});}post({type:'pick',lat:pos.lat(),lng:pos.lng()});});" : ""}
      ds.route({origin:${serialize(origin)},destination:${serialize(destination)},waypoints:[${wpts}],travelMode:'DRIVING'},function(res,status){
        if(status==='OK'){
          dr.setDirections(res);
          var legs=res.routes[0].legs,dist=0,dur=0;
          for(var i=0;i<legs.length;i++){dist+=legs[i].distance.value;dur+=legs[i].duration.value;}
          post({type:'route',km:(dist/1000).toFixed(1),min:Math.round(dur/60)});
        } else {
          document.body.innerHTML='<div id="err">No se pudo trazar la ruta ('+status+').</div>';
          post({type:'error',status:status});
        }
      });
    }
    window.gm_authFailure=function(){ document.body.innerHTML='<div id="err">Error de autenticacion de Google Maps. Revisa la API key y que Maps JS + Directions esten habilitadas.</div>'; post({type:'error',status:'AUTH'}); };
  </script>
  <script async src="https://maps.googleapis.com/maps/api/js?key=${KEY}&callback=initMap"></script>
  </body></html>`;

  return (
    <View style={[styles.wrap, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        onMessage={(e) => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.type === 'route') setInfo({ km: data.km, min: data.min });
            else if (data.type === 'pick' && onPick) onPick({ lat: data.lat, lng: data.lng });
          } catch { /* ignore */ }
        }}
      />
      {info && (
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>🛣️ {info.km} km · ⏱️ {info.min} min aprox.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { borderRadius: 14, overflow: 'hidden', marginBottom: 20, backgroundColor: '#E4EAF2' },
  web: { flex: 1, backgroundColor: 'transparent' },
  badge: { position: 'absolute', left: 10, bottom: 10, backgroundColor: 'rgba(11,31,58,0.85)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  fallback: { borderRadius: 14, backgroundColor: '#E4EAF2', alignItems: 'center', justifyContent: 'center', padding: 16, marginBottom: 20 },
  fallbackTxt: { color: '#667085', textAlign: 'center', fontSize: 13 },
});

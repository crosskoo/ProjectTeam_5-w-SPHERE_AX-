<template>
  <div class="map" ref="mapRef"></div>
</template>

<script setup>
import { ref, onMounted, defineExpose, defineEmits } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// import Cookies from 'js-cookie'
// import axios from 'axios'

import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'

const emit = defineEmits(['setCCTV'])

// 지도
const mapRef = ref(null)
const map = ref(null)

// CCTV 좌표
//const coords = []

const customIcon = L.icon({
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

map.value = null

const createMarkers = (coords) => {
  coords.forEach((coord) => {
    const marker = L.marker([coord.lat, coord.lng], { icon: customIcon }).addTo(
      map.value
    )

    marker.on('click', () => {
      emit('setCCTV', { lat: coord.lat, lng: coord.lng })
    })
  })
}

defineExpose({
  createMarkers,
})

onMounted(async () => {
  map.value = L.map(mapRef.value).setView([35.88894, 128.610289], 13)

  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles © Esri',
    }
  ).addTo(map.value)

  // try {
  //   const response = await axios.get('/api/cctv', {
  //     params: {
  //       region: '6818e2ced43fd1386011c411',
  //     },
  //     headers: {
  //       Authorization: `Bearer ${Cookies.get('authToken')}`,
  //     },
  //   })
  //   items.value = response.data.data.events
  //   console.log('이벤트 목록:', items.value[0].timestamp)
  // } catch (error) {
  //   console.error('Login failed:', error)
  //   alert('이벤트 불러오기 실패')
  // }
})
</script>

<style lang="scss" scoped>
.map {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-top: 28px;
  margin-left: 16px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 5px;
  background: #bdc3c7;
}
</style>

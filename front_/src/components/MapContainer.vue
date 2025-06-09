<template>
  <div class="map" ref="mapRef"></div>
</template>

<script setup>
import { ref, onMounted, defineExpose, defineEmits } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Cookies from 'js-cookie'
import axios from 'axios'

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

const createMarkers = (cctvs) => {
  cctvs.forEach((cctv) => {
    const marker = L.marker([cctv.location.lat, cctv.location.lng], {
      icon: customIcon,
    }).addTo(map.value)

    marker.bindTooltip(cctv.name, {
      permanent: false, // true면 항상 보임
      direction: 'bottom', // 툴팁 방향 (top, bottom, left, right, center 등)
      offset: [0, 10], // 툴팁 위치 미세 조정 (픽셀 단위)
    })

    marker.on('click', () => {
      emit('setCCTV', {
        lat: cctv.location.lat,
        lng: cctv.location.lng,
        name: cctv.name,
        id: cctv.id,
      })
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

  try {
    const response = await axios.get('/api/cctv', {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`,
      },
    })

    const cctvs = response.data.data.cctvs
    if (cctvs.length > 0) {
      map.value.setView([cctvs[0].lat, cctvs[0].lng], 14)
    }

    createMarkers(cctvs)
  } catch (error) {
    console.error('cctv 위치 불러오기 실패:', error)
    alert('cctv 위치 불러오기 실패')
  }
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

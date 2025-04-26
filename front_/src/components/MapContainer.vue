<template>
  <div class="map" ref="mapContainer"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'

// 지도
const mapContainer = ref(null)
const map = ref(null)

onMounted(() => {
  map.value = L.map(mapContainer.value).setView([37.5665, 126.978], 13) // 서울 좌표

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map.value)

  // 예시: 마커 하나 추가
  const customIcon = L.icon({
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  const marker = L.marker([37.5665, 126.978], { icon: customIcon }).addTo(
    map.value
  )

  marker.on('click', () => {
    alert('마커 클릭됨!')
  })
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

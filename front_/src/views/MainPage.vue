<template>
  <div class="container">
    <MainSidebar />

    <div class="main">
      <div class="header">
        <div class="title">자동산불감지시스템</div>
        <div class="right">
          asdf1234님
          <div class="button" @click="toggleMenu">
            <Icon class="icon" icon="charm:menu-kebab" />
          </div>
          <ul v-if="menuOpen" class="dropdown-menu">
            <li @click="goToMain">메인</li>
            <li @click="goToAccount">계정</li>
            <li @click="goToLogin">로그아웃</li>
          </ul>
        </div>
      </div>
      <div class="main-content">
        <div class="left-content">
          <div class="cctv-name">고봉암5</div>
          <div class="cctv">CCTV 영상</div>
          <WeatherInfo ref="weatherRef" />
        </div>
        <MapContainer @setCCTV="setCCTV" ref="mapRef" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import MapContainer from '@/components/MapContainer.vue'
import WeatherInfo from '@/components/WeatherInfo.vue'
import MainSidebar from '@/components/MainSidebar.vue'

// 페이지 이동
const menuOpen = ref(false)
const router = useRouter()

// cctv 좌표 설정
const coords = [
  { lat: 37.583573, lng: 126.954631 },
  { lat: 35.88894, lng: 128.610289 },
  { lat: 35.886307, lng: 128.610096 },
  { lat: 35.88525, lng: 128.614656 },
  { lat: 35.892335, lng: 128.609352 },
]

const mapRef = ref(null)
const weatherRef = ref(null)

// cctv 연결
const setCCTV = (data) => {
  if (weatherRef.value) {
    weatherRef.value.setWeatherData(data.lat, data.lng)
  }
}

const setMarkers = () => {
  if (mapRef.value) {
    mapRef.value.createMarkers(coords)
  }
}

onMounted(() => {
  setMarkers()
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

const goToMain = () => {
  router.push('/main')
}
const goToAccount = () => {
  router.push('/account')
}
const goToLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  display: flex;
  height: 100vh;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 16px;
  .header {
    display: flex;
    justify-content: space-between;
    height: 84px;
    color: white;
    align-items: center;
    .title {
      padding: 8px;
      font-size: 24px;
    }
    .right {
      display: flex;
      align-items: center;
      position: relative;
      .button {
        margin-left: 8px;
        height: 36px;
        width: 36px;
        border-radius: 8px;
        background: $background1;
        display: flex;
        justify-content: center;
        align-items: center;

        .icon {
          height: 20px;
          width: 20px;
          pointer-events: none;
        }
      }
      .button:hover {
        background: $background4;
        cursor: pointer;
      }
      .dropdown-menu {
        position: absolute;
        padding: 4px 0 4px 0;
        top: 36px;
        right: 0;
        background-color: $background1;
        border: 1px solid $background4;
        border-radius: 8px;
        box-shadow: -2px 2px 4px $background4;
        list-style: none;
        margin: 0;
        z-index: 999;
      }
      .dropdown-menu li {
        width: 128px;
        height: 32px;
        font-size: 14px;
        padding-left: 8px;
        align-content: center;
        text-align: left;
        cursor: pointer;
        color: white;
        margin: 0 4px 0 4px;
        border-radius: 4px;
      }

      .dropdown-menu li:hover {
        background-color: $background4;
      }
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 16px;

    .left-content {
      display: flex;
      flex-direction: column;

      .cctv-name {
        text-align: left;
        margin-left: 8px;
        color: $gray2;
      }
      .cctv {
        display: flex;
        width: 928px;
        height: 522px;
        margin-top: 4px;
        margin-bottom: 16px;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        background: #ecf0f1;
        aspect-ratio: 16 / 9;
      }
      .cctv video {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>

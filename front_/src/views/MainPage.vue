<template>
  <div class="container">
    <MainSidebar ref="mainSidebar" @setCCTV="setCCTV" />

    <div class="main">
      <div class="header">
        <div class="title">Auto Wildfire Detection</div>
        <div class="right">
          {{ username }}님
          <div class="button" @click="toggleMenu">
            <Icon class="icon" icon="charm:menu-kebab" />
          </div>
          <ul v-if="menuOpen" class="dropdown-menu">
            <li @click="goToMain">메인</li>
            <li @click="goToAccount">설정</li>
            <li @click="logout">로그아웃</li>
          </ul>
        </div>
      </div>
      <div class="main-content">
        <div class="left-content">
          <div class="cctv-name">{{ cctvName }}</div>
          <div class="cctv">
            <video
              ref="video"
              controls
              autoplay
              muted
              style="width: 100%; aspect-ratio: 16 / 9; object-fit: cover"
            ></video>
          </div>
          <WeatherInfo ref="weatherRef" />
        </div>
        <MapContainer @setCCTV="setCCTV" ref="mapRef" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useLogout } from '@/composables/useLogout'
import Cookies from 'js-cookie'
import Hls from 'hls.js'
import axios from 'axios'
import { ElNotification } from 'element-plus'
import { io } from 'socket.io-client'

import MapContainer from '@/components/MapContainer.vue'
import WeatherInfo from '@/components/WeatherInfo.vue'
import MainSidebar from '@/components/MainSidebar.vue'

import { useUserStore } from '@/stores/user'
const userStore = useUserStore()

const username = userStore.user?.name
const cctvName = ref('')

const { logout } = useLogout()

// 페이지 이동
const menuOpen = ref(false)
const router = useRouter()

const mainSidebar = ref(null)
const video = ref(null)

let socket
let hls

// cctv 좌표 설정
// const coords = [
//   { lat: 37.583573, lng: 126.954631 },
//   { lat: 35.88894, lng: 128.610289 },
//   { lat: 35.886307, lng: 128.610096 },
//   { lat: 35.88525, lng: 128.614656 },
//   { lat: 35.892335, lng: 128.609352 },
// ]

const mapRef = ref(null)
const weatherRef = ref(null)

const startStream = async (id) => {
  try {
    const response = await axios.post(
      `/api/stream/${id}/manage`,
      {
        action: 'start', // or 'stop', 'restart'
      },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get('authToken')}`,
        },
      }
    )

    if (response.data.status === 'success') {
      console.log('스트림 시작 성공:', response.data)
    } else {
      console.warn('응답은 성공했지만 status는 success가 아님:', response.data)
    }
  } catch (error) {
    console.error('스트림 시작 실패:', error)
    console.error('Axios Error:', error.response?.data || error.message)
    alert('스트림 시작 중 오류가 발생했습니다.')
  }
}

// cctv 연결
const setCCTV = async (data) => {
  if (weatherRef.value) {
    try {
      if (!('lat' in data)) {
        console.log(data.id)
        console.log(data.name)
        const response = await axios.get(`/api/cctv/${data.id}/stream`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('authToken')}`,
          },
        })

        data.lat = response.data.data.cctvInfo.location.lat
        data.lng = response.data.data.cctvInfo.location.lng
      }

      console.log(data.lat, data.lng)

      weatherRef.value.setWeatherData(data.lat, data.lng)
    } catch (error) {
      console.error('cctv 정보 불러오기 실패:', error)
    }
  }

  cctvName.value = data?.name

  try {
    await startStream(data.id)

    const response = await axios.get(`/api/stream/${data.id}/status`, {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`,
      },
    })

    console.log('스트림 상태: ', response.data.data.isActive)

    const hlsUrl = `${process.env.VUE_APP_API_URL}${response.data.data.hlsUrl}`

    if (hls) {
      hls.destroy()
      hls = null
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        liveSyncDuration: 3, // 실시간 재생을 위해 지연 시간 최소화
        maxLiveSyncPlaybackRate: 1.5, // 네트워크 느릴 때 빠르게 따라잡기 허용
        liveMaxLatencyDuration: 10, // 최대 지연 허용
        enableWorker: true, // 성능 향상
        lowLatencyMode: true, // 가능한 경우 저지연 모드 사용
        xhrSetup: function (xhr) {
          xhr.setRequestHeader(
            'Authorization',
            `Bearer ${Cookies.get('authToken')}`
          )
        },
      })

      hls.loadSource(hlsUrl)
      hls.attachMedia(video.value)

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data)

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // 네트워크 에러면 재시도
              console.log(
                'Fatal network error encountered, trying to recover...'
              )
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              // 미디어 에러면 복구 시도
              console.log('Fatal media error encountered, trying to recover...')
              hls.recoverMediaError()
              break
            default:
              // 기타 치명적인 에러는 재생 중단
              console.log('Unrecoverable error, destroying hls instance...')
              hls.destroy()
              break
          }
        }
      })
    } else if (video.value.canPlayType('application/vnd.apple.mpegurl')) {
      video.value.src = `${hlsUrl}?token=${Cookies.get('authToken')}`
    }
  } catch (error) {
    console.error('영상 불러오기 실패:', error)
  }
}

// 이벤트 알림 수신
const handleNotificationEvent = (data) => {
  ElNotification({
    title: '화재 발생',
    message: data.cctvName,
    type: 'warning', // success | warning | error | info
    duration: 0, // 5초 후 자동 종료 (0이면 무한)
    position: 'top-left',
    showClose: true,
  })

  mainSidebar?.value.getEventData()
  setCCTV({ id: data.cctvId, name: data.cctvName })
}

onMounted(() => {
  const token = Cookies.get('authToken')
  if (!token) {
    router.push('/login')
  }

  socket = io('http://localhost:10111', {
    auth: {
      token: `${token}`,
    },
    query: {
      client: 'web',
    },
  })

  socket.on('connect', () => {
    console.log('소켓 연결됨:', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('소켓 연결 끊김')
  })

  socket.on('event-detected', (data) => {
    console.log('서버에서 받은 이벤트:', data)
    handleNotificationEvent(data?.data)
  })
  // 이벤트 수신 테스트
  // handleNotificationEvent('부산 CCTV 1')
})

onBeforeUnmount(() => {
  if (socket) {
    socket.disconnect()
    console.log('소켓 연결 종료')
  }

  if (hls) {
    hls.destroy()
  }
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
      font-size: 28px;
      font-weight: 600;
      color: white;
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
        padding: 8px 0 8px 0;
        top: 36px;
        right: 0;
        background-color: $background1;
        border: 1px solid $background2;
        border-radius: 8px;
        box-shadow: 0px 2px 4px $background1;
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
        margin: 0 8px 0 8px;
        border-radius: 4px;
      }

      .dropdown-menu li:hover {
        background-color: $background2;
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
        height: 24px;
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

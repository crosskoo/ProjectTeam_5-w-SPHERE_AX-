<template>
  <div class="weather">
    <div class="weather-item">
      <Icon class="icon" icon="icon-park-solid:wind-turbine" />풍향
      <div class="value">{{ weather.VEC }} deg</div>
    </div>
    <div class="weather-item">
      <Icon class="icon" icon="mingcute:wind-fill" />풍속
      <div class="value">{{ weather.WSD }} m/s</div>
    </div>
    <div class="weather-item">
      <Icon class="icon" icon="mdi:temperature" />기온
      <div class="value">{{ weather.T1H }} °C</div>
    </div>
    <div class="weather-item">
      <Icon class="icon" icon="carbon:humidity" />습도
      <div class="value">{{ weather.REH }} %</div>
    </div>
    <div class="weather-item">
      <Icon class="icon" icon="fluent:weather-fog-48-regular" />강수상태
      <div class="value">{{ convertPty(weather.PTY) }}</div>
    </div>
    <div class="weather-item">
      <Icon class="icon" icon="uil:raindrops" />강수량
      <div class="value">{{ weather.RN1 }} mm</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineExpose } from 'vue'
import { Icon } from '@iconify/vue'
import axios from 'axios'

// 기상 데이터
const weather = ref({})
const loading = ref(true)
const error = ref(null)

const serviceKey =
  'YEEQoQsRDG68cNh610o5CkMOSqqZp4iSEW/9rnn6Lnlb5xVe2eFDp2HSpa2MzJxoY7lJbVRCcXkBZdwnRppvhA=='

function getBaseDateTime() {
  const now = new Date()
  let baseDate = new Date(now)
  let hour = now.getHours()
  const minute = now.getMinutes()

  if (minute < 40) {
    hour -= 1
    if (hour < 0) {
      // 전날 23시로 조정
      hour = 23
      baseDate.setDate(baseDate.getDate() - 1)
    }
  }

  const base_time = String(hour).padStart(2, '0') + '00'

  const y = baseDate.getFullYear()
  const m = String(baseDate.getMonth() + 1).padStart(2, '0')
  const d = String(baseDate.getDate()).padStart(2, '0')
  const base_date = `${y}${m}${d}`

  return {
    base_date,
    base_time,
  }
}

function convertPty(pty) {
  switch (pty) {
    case '0':
      return '없음'
    case '1':
      return '비'
    case '2':
      return '비/눈'
    case '3':
      return '눈'
    case '4':
      return '소나기'
    default:
      return '-'
  }
}

function dfs_xy_conv(lat, lon) {
  const RE = 6371.00877 // 지구 반경 (km)
  const GRID = 5.0 // 격자 간격 (km)
  const SLAT1 = 30.0 // 투영 위도1 (deg)
  const SLAT2 = 60.0 // 투영 위도2 (deg)
  const OLON = 126.0 // 기준점 경도 (deg)
  const OLAT = 38.0 // 기준점 위도 (deg)
  const XO = 43 // 기준점 X좌표 (GRID)
  const YO = 136 // 기준점 Y좌표 (GRID)

  const DEGRAD = Math.PI / 180.0
  // const RADDEG = 180.0 / Math.PI

  let re = RE / GRID
  let slat1 = SLAT1 * DEGRAD
  let slat2 = SLAT2 * DEGRAD
  let olon = OLON * DEGRAD
  let olat = OLAT * DEGRAD

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn)
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5)
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5)
  ro = (re * sf) / Math.pow(ro, sn)

  let rs = {}
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5)
  ra = (re * sf) / Math.pow(ra, sn)
  let theta = lon * DEGRAD - olon
  if (theta > Math.PI) theta -= 2.0 * Math.PI
  if (theta < -Math.PI) theta += 2.0 * Math.PI
  theta *= sn

  rs['nx'] = Math.floor(ra * Math.sin(theta) + XO + 0.5)
  rs['ny'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5)
  return rs
}

const setWeatherData = async (lat, lon) => {
  try {
    // 기상 데이터 가져오기
    const { base_date, base_time } = getBaseDateTime()

    const { nx, ny } = dfs_xy_conv(lat, lon)

    const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst`
    const params = {
      serviceKey: serviceKey,
      pageNo: 1,
      numOfRows: 1000,
      dataType: 'JSON',
      base_date,
      base_time,
      nx,
      ny,
    }

    const res = await axios.get(url, { params })
    const items = res.data.response.body.items.item

    const targets = ['T1H', 'WSD', 'VEC', 'REH', 'PTY', 'RN1']
    const result = {}

    for (const item of items) {
      if (targets.includes(item.category) && !result[item.category]) {
        result[item.category] = item.obsrValue
      }
    }

    weather.value = result
  } catch (err) {
    error.value = err.message
    console.error('실패:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setWeatherData(35.8896, 128.6105)
})

defineExpose({
  setWeatherData,
})
</script>

<style lang="scss" scoped>
.weather {
  display: grid;
  flex-grow: 1;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 16px;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  .weather-item {
    display: flex;
    text-align: center;
    align-items: center;
    font-size: 20px;
    color: $gray1;
    border-radius: 16px;
    border: 2px solid $background4;

    .icon {
      margin-left: 32px;
      margin-right: 24px;
      width: 36px;
      height: 36px;
      color: $gray1;
    }

    .value {
      flex: 1;
      text-align: right;
      margin-right: 32px;
      font-size: 28px;
      color: $gray2;
    }
  }
}
</style>

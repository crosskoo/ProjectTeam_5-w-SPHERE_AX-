<template>
  <div class="container">
    <div class="sidebar">
      <div class="top">
        <div class="fire-event-text">화재 이벤트</div>
        <div class="right">
          <button>
            <Icon
              class="icon"
              icon="iconamoon:search-fill"
              width="24"
              height="24"
            />
          </button>
          <button>
            <Icon
              class="icon"
              icon="solar:calendar-bold"
              width="24"
              height="24"
            />
          </button>
        </div>
      </div>
      <hr />
      <div class="bottom">
        <div class="list">
          <div class="item on">
            오봉산1
            <div class="right">
              <div class="text">
                <div>2024/10/22</div>
                <div>12:42:02</div>
              </div>
              <!-- <div class="line"></div> -->
              <button>
                <Icon
                  class="icon"
                  icon="bxs:message-square-detail"
                  width="24"
                  height="24"
                />
              </button>
            </div>
          </div>
          <div class="item">
            오봉산2
            <div class="right">
              <div>2024/10/23</div>
              <div>09:44:31</div>
            </div>
          </div>
          <div class="item">
            오봉산3
            <div class="right">
              <div>2024/10/24</div>
              <div>21:39:57</div>
            </div>
          </div>
        </div>
        <div class="scrollbar"></div>
      </div>
    </div>

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
        </div>
        <div class="map">2D 지도</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const menuOpen = ref(false)
const router = useRouter()

const weather = ref({})
const loading = ref(true)
const error = ref(null)

const serviceKey =
  'YEEQoQsRDG68cNh610o5CkMOSqqZp4iSEW/9rnn6Lnlb5xVe2eFDp2HSpa2MzJxoY7lJbVRCcXkBZdwnRppvhA=='
const nx = 89
const ny = 91

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

onMounted(async () => {
  try {
    const { base_date, base_time } = getBaseDateTime()

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
    console.log(res.data)
    const items = res.data.response.body.items.item

    const targets = ['T1H', 'WSD', 'VEC', 'REH', 'PTY', 'RN1']
    const result = {}

    for (const item of items) {
      if (targets.includes(item.category) && !result[item.category]) {
        result[item.category] = item.obsrValue
      }
    }
    console.log(result)

    weather.value = result
  } catch (err) {
    error.value = err.message
    console.error('실패:', err)
  } finally {
    loading.value = false
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

.sidebar {
  margin: 32px;
  width: 384px;
  background-color: $background2;
  color: white;
  margin: 16px;
  overflow-y: auto;
  border-radius: 8px;
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    .fire-event-text {
      font-size: 20px;
      margin-left: 8px;
      text-align: left;
    }
    .right {
      justify-content: right;
    }
    button {
      border: none;
      box-shadow: none;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background-color: $background4;
      margin-left: 8px;
      .icon {
        color: $gray2;
      }
    }
    button:hover {
      background: $background3;
      cursor: pointer;
    }
  }
  hr {
    border: none;
    height: 2px;
    margin-right: 16px;
    margin-left: 16px;
    background-color: $background3;
  }
  .bottom {
    display: flex;
    justify-content: space-between;
    margin: 16px;
    .list {
      flex: 1;
      margin-right: 8px;
      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: 16px;
        padding-right: 8px;
        background: $background2;
        border-radius: 12px;
        height: 52px;
        color: $gray2;
        font-size: 16px;
        .right {
          display: flex;
          justify-content: right;
          justify-items: center;
          align-items: center;

          .text {
            text-align: right;
            font-size: 14px;
          }

          .line {
            width: 2px;
            height: 24px;
            border-radius: 2px;
            background: $background4;
            margin-left: 8px;
          }
          button {
            all: unset;
            height: 32px;
            width: 32px;
            border-radius: 8px;
            margin-left: 8px;

            .icon {
              color: $gray1;
            }
          }

          button:hover {
            .icon {
              color: $gray2;
            }
          }
        }
      }
      .item:hover {
        background: $background3;
        cursor: pointer;
      }
      .on {
        background: $background4;
        color: white;
      }
      .on:hover {
        background: $background4;
      }
    }
    .scrollbar {
      background-color: $background4;
      width: 8px;
      border-radius: 8px;
      height: 84vh;
    }
  }
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
    }

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
  }
}
</style>

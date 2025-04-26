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
          <WeatherInfo />
        </div>
        <MapContainer />
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import MapContainer from '@/components/MapContainer.vue'
import WeatherInfo from '@/components/WeatherInfo.vue'

// 페이지 이동
const menuOpen = ref(false)
const router = useRouter()

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
    }
  }
}
</style>

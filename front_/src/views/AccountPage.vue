<template>
  <div class="container">
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
    <div class="main">
      <div class="sidebar">
        <button
          class="item on"
          :class="{ active: activeTab === 1 }"
          @click="activeTab = 1"
        >
          프로필
        </button>
        <button
          class="item"
          :class="{ active: activeTab === 2 }"
          @click="activeTab = 2"
        >
          계정 생성
        </button>
        <button
          class="item"
          :class="{ active: activeTab === 3 }"
          @click="activeTab = 3"
        >
          계정 삭제
        </button>
      </div>
      <div class="content-container">
        <div class="content" v-if="activeTab === 1">
          <div class="input-group">
            <label class="label" for="Phone Number">전화번호</label>
            <input type="text" id="use2rname" required />
          </div>
          <div class="input-group">
            <label class="label" for="email">이메일</label>
            <input type="text" id="u6sername" required />
          </div>
        </div>
        <div class="content" v-else-if="activeTab === 2">
          <div class="input-group">
            <label class="label" for="Phone Number">Id</label>
            <input type="text" id="username" required />
          </div>
          <div class="input-group">
            <label class="label" for="email">Password</label>
            <input type="password" id="username2" required />
          </div>
          <div class="input-group">
            <label class="label" for="Phone Number">지역</label>
            <input type="text" id="usernam3e" required />
          </div>
          <div class="input-group">
            <label class="label" for="email">권한</label>
            <input type="text" id="use4rname" required />
          </div>
          <button class="btn-create">계정 생성</button>
        </div>
        <div class="content" v-else-if="activeTab === 3">
          <div class="input-group">
            <label class="label" for="Phone Number">Id</label>
            <input type="text" id="useadsfrname" required />
          </div>
          <div class="input-group">
            <label class="label" for="email">Password</label>
            <input type="password" id="usfasdername2" required />
          </div>
          <button class="btn-create">계정 삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const activeTab = ref(1)
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
.container {
  height: 100vh;
  background: $background3;
  justify-content: center;
}

.header {
  flex: 1;
  display: flex;
  justify-content: space-between;
  height: 84px;
  color: white;
  align-items: center;
  background: $background1;

  .title {
    margin-left: 32px;
    padding: 8px;
    font-size: 24px;
  }
  .right {
    display: flex;
    align-items: center;
    position: relative;
    margin-right: 16px;

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

.main {
  height: 100%;
  display: flex;
  justify-content: center;
  background: $background2;
  margin: 0 auto;

  .sidebar {
    height: 100%;
    width: 192px;
    padding-top: 64px;

    .item {
      all: unset;
      width: 192px;
      height: 36px;
      color: $gray2;
      text-align: left;
      font-size: 16px;
      align-content: center;
      text-indent: 12px;
      border-radius: 8px;
      cursor: pointer;
    }
    .item:hover {
      background: $background3;
    }
    .item.active {
      background-color: $background4;
    }
  }
  .content-container {
    height: 100%;
    width: 384px;
    padding-top: 64px;

    .content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding-left: 32px;

      button {
        height: 36px;
        font-size: 16px;
        font-family: 'Noto Sans', sans-serif;
        padding-bottom: 4px;
        background: $point1;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        height: 36px;
        margin-top: 16px;
        width: 96px;
      }
      button:hover {
        background: $point2;
      }
      button:active {
        background: $point3;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        text-align: left;

        color: white;
        font-family: 'Noto Sans', sans-serif;

        .label {
          padding-bottom: 8px;
          font-size: 16px;
        }

        input {
          all: unset;
          height: 36px;
          width: 320px;
          margin-bottom: 8px;
          background: $background1;
          border-radius: 8px;
          padding: 0px 16px;
          border: 1px solid $background4;
          color: $gray2;
          font-size: 14px;
        }
        input:focus {
          border: 1px solid $gray1;
        }
      }
    }
  }
}
</style>

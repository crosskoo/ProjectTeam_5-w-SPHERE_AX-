<template>
  <div class="container">
    <div class="login-container">
      <h2 class="text-signin">Auto Wildfire Detection</h2>
      <p class="subtitle">실시간 인공지능 산불 감지 서비스</p>
      <form class="form" @submit.prevent="login">
        <div class="input-group">
          <label class="label" for="id">ID</label>
          <input type="text" id="id" v-model="id" required />
        </div>

        <div class="input-group">
          <label class="label" for="password">Password</label>
          <input type="password" id="password" v-model="password" required />
        </div>

        <button type="submit">LogIn</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import Cookies from 'js-cookie'

const userStore = useUserStore()

const id = ref('')
const password = ref('')

const router = useRouter()

const login = async () => {
  let user

  try {
    const response = await axios.post('/api/auth/login', {
      id: id.value,
      password: password.value,
    })

    document.cookie = `authToken=${response.data.data.token}; path=/; Secure; SameSite=Strict`

    user = response.data.data.user
    user.regions = response.data.data.user.region
      .split(',')
      .map((s) => s.trim())
    userStore.setUser(response.data.data.user)
  } catch (error) {
    console.error('Login failed:', error)
    Cookies.remove('authToken')
    userStore.clearUser()
    alert('로그인 실패: 아이디 또는 비밀번호를 확인해주세요')
  }

  try {
    const response = await axios.get('/api/regions', {
      headers: {
        Authorization: `Bearer ${Cookies.get('authToken')}`,
      },
    })

    const regionIds = response.data.data.regions
      .filter((region) => user.regions.includes(region.name))
      .map((region) => region.id)

    console.log(regionIds)
    userStore.user.regionIds = regionIds

    router.push('/main')
  } catch (error) {
    console.error('데이터 로딩 실패:', error)
    Cookies.remove('authToken')
    userStore.clearUser()
    alert('사용자 정보를 가져올 수 없습니다.')
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 100vh;
  background: $background1;
}

.login-container {
  width: 400px;
  background: $background2;
  border-radius: 16px;
  text-align: center;
  outline-color: $background3;
  border: 1px solid $background3;
  align-content: center;
  // box-shadow: 0 4px 16px $background1;

  .text-signin {
    margin-top: 32px;
    margin-bottom: 0px;
    color: $point1;
    font-size: 30px;
  }

  .subtitle {
    margin-top: 8px;
    font-size: 16px;
    color: $gray1;
  }

  .form {
    margin-top: 24px;
  }

  .input-group {
    text-align: left;
    margin-left: 32px;
    margin-right: 32px;
    margin-top: 16px;

    label {
      font-size: 16px;
      color: $gray2;
      font-family: 'Noto Sans', sans-serif;
    }

    input {
      box-sizing: border-box;
      width: 100%;
      height: 48px;
      font-size: 16px;
      background: $background3;
      border: none;
      border-radius: 8px;
      margin-top: 8px;
      border: 2px solid $background3;
      color: $gray2;
      font-size: 16px;
      padding: 0px 16px;
    }
    input:focus {
      outline: none;
      border: 1px solid $gray2;
    }
  }

  button {
    width: calc(100% - 64px);
    height: 48px;
    margin: 24px 32px 32px 32px;
    font-weight: bold;
    font-size: 20px;
    font-family: 'Noto Sans', sans-serif;
    padding-bottom: 4px;
    background: $point1;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  button:hover {
    background: $point2;
  }
  button:active {
    background: $point3;
  }
}
</style>

<template>
  <div class="container">
    <div class="login-container">
      <h2 class="text-signin">자동산불감지시스템</h2>
      <form class="form" @submit.prevent="goToMain">
        <div class="input-group">
          <label class="label" for="ID">ID</label>
          <input type="text" id="username" v-model="username" required />
        </div>

        <div class="input-group">
          <label class="label" for="password">Password</label>
          <input type="password" id="password" v-model="password" required />
        </div>

        <button type="submit">Sign In</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const router = useRouter()

const goToMain = () => {
  router.push('/main') // 로그인 버튼 클릭 시 /main 페이지로 이동
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: $background3;
}

.login-container {
  width: 480px;
  height: 600px;
  background: $background2;
  border-radius: 32px;
  text-align: center;
  align-content: center;
  box-shadow: 0 4px 16px $background1;

  .text-signin {
    color: white;
    font-size: 28px;
  }

  .form {
    margin-top: 96px;
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
      background: $background1;
      border: none;
      border-radius: 8px;
      margin-top: 8px;
      border: 2px solid $background1;
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
    margin-left: 32px;
    margin-right: 32px;
    margin-top: 48px;
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

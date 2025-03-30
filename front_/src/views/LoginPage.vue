<template>
  <div class="container">
    <div class="login-container">
      <h2>로그인</h2>
      <form @submit.prevent="goToMain">
        <div class="input-group">
          <label for="username">아이디</label>
          <input type="text" id="username" v-model="username" required />
        </div>

        <div class="input-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="password" required />
        </div>

        <button type="submit">로그인</button>
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

<style scoped>
.container {
  display: flex;
  justify-content: center; /* 수평 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  height: 100vh; /* 화면 높이에 맞게 100% */
}

.login-container {
  width: 400px; /* 고정된 너비 */
  height: 300px; /* 고정된 높이 */
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #f9f9f9; /* 폼 배경색 */
  text-align: center;
}

.input-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>

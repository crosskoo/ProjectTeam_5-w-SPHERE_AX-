import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '@/views/LoginPage.vue'
import MainPage from '@/views/MainPage.vue'
import AdminPage from '@/views/AdminPage.vue'
import UserInfoPage from '@/views/UserInfoPage.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/main', component: MainPage },
  { path: '/admin', component: AdminPage },
  { path: '/user-info', component: UserInfoPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

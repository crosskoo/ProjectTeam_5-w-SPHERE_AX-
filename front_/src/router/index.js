import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '@/views/LoginPage.vue'
import MainPage from '@/views/MainPage.vue'
import AccountPage from '@/views/AccountPage.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/main', component: MainPage },
  { path: '/account', component: AccountPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

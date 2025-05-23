import axios from 'axios'
import Cookies from 'js-cookie'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

export function useLogout() {
  const router = useRouter()
  const userStore = useUserStore()

  const logout = async () => {
    try {
      await axios.post(
        '/api/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('authToken')}`,
          },
        }
      )

      Cookies.remove('authToken')
      userStore.clearUser()
      router.push('/login')
    } catch (error) {
      console.error('로그아웃 실패', error)
    }
  }

  return { logout }
}

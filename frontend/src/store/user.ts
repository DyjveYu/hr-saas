import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserInfo {
  id: number
  username: string
  realName: string
  role: string
  tenantId?: number
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem('userInfo') || 'null')
  )

  const isLoggedIn = computed(() => !!token.value)

  const setToken = (t: string) => {
    token.value = t
    localStorage.setItem('token', t)
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return { token, userInfo, isLoggedIn, setToken, setUserInfo, logout }
})

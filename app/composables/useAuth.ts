export const useAuth = () => {
  const config = useRuntimeConfig()
  const token = useState<string>('auth_token', () => {
    if (import.meta.client) return localStorage.getItem('aht_token') || ''
    return ''
  })
  const username = useState<string>('auth_user', () => {
    if (import.meta.client) return localStorage.getItem('aht_user') || ''
    return ''
  })

  const isLoggedIn = computed(() => !!token.value)

  async function login(user: string, pass: string): Promise<string | null> {
    try {
      const res = await $fetch<any>(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body: { username: user, password: pass }
      })
      if (res.success) {
        token.value = res.data.token
        username.value = res.data.username
        localStorage.setItem('aht_token', res.data.token)
        localStorage.setItem('aht_user', res.data.username)
        return null // ok
      }
      return res.message || 'Đăng nhập thất bại'
    } catch {
      return 'Sai tên đăng nhập hoặc mật khẩu'
    }
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem('aht_token')
    localStorage.removeItem('aht_user')
    navigateTo('/login')
  }

  function authHeaders() {
    return { Authorization: `Bearer ${token.value}` }
  }

  return { token, username, isLoggedIn, login, logout, authHeaders }
}
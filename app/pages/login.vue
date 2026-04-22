<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4">
      <div class="w-[380px] bg-white rounded-xl p-10 shadow-2xl">
      <div class="flex items-center gap-2.5 mb-7">
        <div class="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
        <span class="text-xs font-bold text-gray-400 tracking-widest uppercase">Da Nang Airport IT</span>
      </div>

      <h1 class="text-2xl font-extrabold text-gray-800 mb-1">AHT Asset Hub</h1>
      <p class="text-sm text-gray-400 mb-7">Quản lý logo hãng hàng không & thư viện ảnh</p>

      <div class="mb-4">
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Tên đăng nhập</label>
        <input v-model="form.username" type="text" placeholder="username"
          class="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-blue-500 transition-colors"
          @keydown.enter="doLogin" />
      </div>

      <div class="mb-5">
        <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Mật khẩu</label>
        <input v-model="form.password" type="password" placeholder="••••••••"
          class="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-blue-500 transition-colors"
          @keydown.enter="doLogin" />
      </div>

      <p v-if="error" class="text-red-500 text-xs text-center mb-3">{{ error }}</p>

      <button @click="doLogin" :disabled="loading"
        class="w-full py-3 bg-blue-600 text-white font-bold rounded-lg text-sm tracking-wide hover:bg-blue-700 transition-colors disabled:opacity-60">
        {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">









definePageMeta({ layout: 'auth' })

const { login, isLoggedIn } = useAuth()

// Nếu đã đăng nhập thì redirect
if (isLoggedIn.value) navigateTo('/airlines')

const form = reactive({ username: '', password: '' })
const error = ref('')
const loading = ref(false)

async function doLogin() {
  if (!form.username || !form.password) return
  loading.value = true
  error.value = ''
  const err = await login(form.username, form.password)
  if (err) {
    error.value = err
  } else {
    navigateTo('/airlines')
  }
  loading.value = false
}
</script>

<template>
  <div class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <div class="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-base font-extrabold text-gray-800">📡 API Endpoints</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
      </div>
      <div class="p-7">
        <div class="mb-6">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Base URL</div>
          <code class="block bg-gray-900 text-green-400 text-xs font-mono px-4 py-3 rounded-lg">
            {{ config.public.apiBase }}
          </code>
        </div>

        <div class="mb-6">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">🖼 Image Manager</div>
          <div class="flex flex-col gap-1.5">
            <ApiRow method="GET"    path="/images"               note="Lấy tất cả ảnh" />
            <ApiRow method="GET"    path="/images?folder=X&tag=Y" note="Filter theo folder/tag" />
            <ApiRow method="POST"   path="/images/upload"         note="Upload ảnh (auth)" />
            <ApiRow method="PUT"    path="/images/{id}"           note="Cập nhật folder/tags (auth)" />
            <ApiRow method="DELETE" path="/images/{id}"           note="Xóa ảnh (auth)" />
            <ApiRow method="GET"    path="/images/folders"        note="Danh sách folder" />
            <ApiRow method="GET"    path="/images/tags"           note="Danh sách tags" />
          </div>
        </div>

        <div class="mb-6">
          <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">✈ Airline Manager</div>
          <div class="flex flex-col gap-1.5">
            <ApiRow method="GET"    path="/airlines"                     note="Danh sách hãng" />
            <ApiRow method="POST"   path="/airlines"                     note="Thêm hãng (auth)" />
            <ApiRow method="PUT"    path="/airlines/{id}"                note="Sửa hãng (auth)" />
            <ApiRow method="DELETE" path="/airlines/{id}"                note="Xóa hãng (auth)" />
            <ApiRow method="PUT"    path="/airlines/{id}/logos/{fn}"     note="Gán logo (auth)" />
            <ApiRow method="DELETE" path="/airlines/{id}/logos/{fn}"     note="Xóa logo (auth)" />
            <ApiRow method="GET"    path="/airlines/{code}/logo/{fn}"    note="Lấy logo cho client" />
            <ApiRow method="GET"    path="/airlines/{code}/logos"        note="Tất cả logo của hãng" />
          </div>
        </div>

        <div class="bg-blue-50 rounded-xl p-4 text-xs text-blue-700">
          <div class="font-bold mb-1">Tích hợp NuxtJS / FIDs</div>
          <code class="font-mono">GET /airlines/VN/logo/FIDs</code>
          <span class="ml-2">→ trả về imageUrl trực tiếp</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close'])
const config = useRuntimeConfig()
</script>

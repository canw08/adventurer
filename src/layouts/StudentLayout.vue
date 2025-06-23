<!-- src/layouts/StudentLayout.vue -->
<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- 左侧固定导航栏 -->
    <aside class="w-48 bg-white shadow-md flex flex-col items-center py-6">
      <Avatar image="https://placekitten.com/80/80" shape="circle" class="mb-6" />
      <router-link to="/" class="mb-3 w-full px-4">
        <Button label="我的项目" icon="pi pi-folder" class="w-full" outlined />
      </router-link>
      <router-link to="/tasks" class="w-full px-4">
        <Button label="我的任务" icon="pi pi-check-square" class="w-full" outlined />
      </router-link>
    </aside>

    <!-- 右侧内容区域 -->
    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
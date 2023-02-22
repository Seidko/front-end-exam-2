<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { format } from 'timeago.js'

const props = defineProps<{
  id?: number,
  name?: string
  time?: string
  title?: string
  detail?: string
  state?: 'edited' | 'conflict'
}>()
</script>

<template>
  <router-link class="link" :to="`/${id}`">
    <div class="title">{{ title }}</div>
    <div>
      <span>{{ name }}</span>
      <span class="time">{{ format(time , 'zh_CN', { relativeDate: Date.now() - 43202000 }) }}</span>
    </div>
  </router-link>
</template>

<style scoped>
div {
  display: flex;
  justify-content: space-between;
}

.title {
  font-weight: 700;
}

.link {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  padding: 0 7px;
}

.link:hover {
  background-color: #ffffff10
}

</style>
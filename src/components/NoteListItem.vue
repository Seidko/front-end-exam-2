<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { format } from 'timeago.js'

defineProps<{
  id?: number,
  name?: string
  time?: number
  title?: string
  detail?: string
  state?: 'modified' | 'conflict'
}>()

</script>

<template>
  <router-link class="link" :to="`${state === 'conflict' ? '/conflict' : ''}/${id}`">
    <div class="title">
      <span>{{ title }}</span>
      <span v-if="state === 'modified'">M</span>
      <span v-if="state === 'conflict'">C</span>
    </div>
    <div>
      <span class="name">{{ name }}</span>
      <span class="time">{{ format(time, 'zh_CN') }}</span>
    </div>
  </router-link>
</template>

<style scoped>
div {
  display: flex;
  justify-content: space-between;
}

span {
  padding: 1px 0;
}

.title {
  font-weight: bold;
  font-size: 18px;
}

.link {
  background-color: var(--color-background-soft);
  display: flex;
  flex-direction: column;
  margin: 5px 0;
  padding: 3px 10px;
  transition: all 0.1s ease-in;
  border-radius: 4px;
}

.name {
  font-size: 13px;
}

.link:not(.router-link-active):hover {
  background-color: var(--color-background-hover)        
}

.router-link-active {
  background-color: var(--theme-color);
  color: var(--color-background);
}

.router-link-active .time{
  color: #444;
}

.time {
  font-size: smaller;
  color: #666;
}
</style>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useNotesStore } from '@/stores/notes'

const noteStore = useNotesStore()
</script>

<template>
  <aside>
    <router-link v-for="note in noteStore.notes" class="link" :to="`/${note.id}`">{{ note.name }}</router-link>
  </aside>
</template>

<style scoped>
aside {
  resize: horizontal;
  overflow: hidden;
  width: 18vw;
  min-width: 200px;
  background-color: #222;
  height: 100vh;
}

.link {
  display: flex;
  font-size: 14px;
  padding: 0 7px;
}

.link:hover {
  display: block;
  background-color: #ffffff10
}
</style>
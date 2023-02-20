<script setup lang="ts">
import NotesList from './views/NotesListView.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <NotesList />
  
  <RouterView />

</template>

<style scoped>

@media (min-width: 1024px) {
  
}
</style>

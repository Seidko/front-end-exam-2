<script setup lang="ts">
import NotesList from './views/NotesListView.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <notes-list />
  
  <router-view />

</template>

<style scoped>
</style>

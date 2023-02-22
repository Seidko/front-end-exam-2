<script setup lang="ts">
import NoteListItem from '@/components/NoteListItem.vue'
import { useNotesStore } from '@/stores/notes'
const noteStore = useNotesStore()
</script>

<template>
  <aside>
    <note-list-item v-for="note of noteStore.notes.value" v-bind="note"/>
  </aside>
</template>

<style scoped>
aside {
  resize: horizontal;
  overflow-x: hidden;
  width: 18vw;
  min-width: 200px;
  background-color: #222;
  height: 100vh;
  overflow-y: scroll;
}
</style>
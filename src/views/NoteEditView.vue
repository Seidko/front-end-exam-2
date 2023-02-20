<script setup lang="ts">
import { useNotesStore } from '@/stores/notes'
import { computed, onMounted, onUnmounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { editor } from 'monaco-editor'

const noteStore = useNotesStore()
const route = useRoute()

const note = computed(() => noteStore.notes.find(note => `${note.id}` === route.params.id))
const editorRef = ref<HTMLElement>()
const dark = window.matchMedia('(prefers-color-scheme: dark)')
let editorInstanse: editor.IStandaloneCodeEditor

watch(note, note => editorInstanse.setValue(note?.detail))
dark.addEventListener('change', m => editorInstanse?.updateOptions({ theme: m.matches ? 'vs-dark' : 'vs-light' }))

onMounted(() => {
  editorInstanse = editor.create(editorRef.value, {
    language: 'markdown',
    automaticLayout: true,
  })
  editorInstanse.updateOptions({ 
    theme: dark.matches ? 'vs-dark' : 'vs-light',
    unicodeHighlight: { ambiguousCharacters: false },
   })
})

onUnmounted(() => {
  editorInstanse.dispose()
})


</script>

<template>
  <div ref="editorRef"></div>
</template>

<style scoped>
div {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
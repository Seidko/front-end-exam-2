<script setup lang="ts">
import { useNotesStore } from '@/stores/notes'
import { computed, onMounted, onUnmounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { editor } from 'monaco-editor'

const noteStore = useNotesStore()
const route = useRoute()
const router = useRouter()

const note = computed(() => noteStore.getNote(+route.params.id))
const editorRef = ref<HTMLElement>()
const dark = window.matchMedia('(prefers-color-scheme: dark)')
let editorInstanse: editor.IStandaloneCodeEditor

const onSave = async (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()

    noteStore.updateDiff(note.value, { detail: editorInstanse.getValue()})
    if (await noteStore.sync()) {
      router.push('/conflict')
    }
  }
}

watch(note, (newNote, oldNote) => {
  const content = editorInstanse.getValue()
  if (newNote?.detail === content) return
  noteStore.updateDiff(oldNote, { detail: content })
  editorInstanse.setValue(newNote?.detail ?? '')
})
dark.addEventListener('change', m => editorInstanse?.updateOptions({ theme: m.matches ? 'vs-dark' : 'vs-light' }))

onMounted(() => {
  editorInstanse = editor.create(editorRef.value, {
    language: 'markdown',
    automaticLayout: true,
  })
  editorInstanse.setValue(note.value?.detail ?? '')
  editorInstanse.updateOptions({ 
    theme: dark.matches ? 'vs-dark' : 'vs-light',
    unicodeHighlight: { ambiguousCharacters: false },
  })

  document.addEventListener('keydown', onSave, false)
})

onUnmounted(() => {
  noteStore.updateDiff(note.value, { detail: editorInstanse.getValue()})

  editorInstanse.dispose()
  document.removeEventListener('keydown', onSave, false)
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
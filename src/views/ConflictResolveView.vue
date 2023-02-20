<script setup lang="ts">
import { useNotesStore } from '@/stores/notes'
import { editor } from 'monaco-editor'
import { computed, onMounted, onUnmounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const noteStore = useNotesStore()
const route = useRoute()

const conflict = computed(() => noteStore.conflicts.find(c => c.diff.id === +route.params.id))
const editorRef = ref<HTMLElement>()
let editorInstanse: editor.IStandaloneDiffEditor

onMounted(() => {
  editorInstanse = editor.createDiffEditor(editorRef.value, {
		enableSplitViewResizing: false,
  })
  editorInstanse.setModel({
    original: editor.createModel(conflict.value.remote.detail, 'markdown'),
    modified: editor.createModel(conflict.value.diff.detail, 'markdown'),
  })
})

onUnmounted(() => {
  // updateDiff(note.value, { detail: editorInstanse.getValue()})

  // editorInstanse.dispose()
  // document.removeEventListener('keydown', onSave, false)
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
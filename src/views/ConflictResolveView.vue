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

const onConfirm = () => {
  noteStore.resovleConflict({ ...conflict.value.diff, detail: editorInstanse.getModel().modified.getValue() })
}

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

  editorInstanse.dispose()
  document.removeEventListener('keydown', onConfirm, false)
})

</script>

<template>
  <div ref="editorRef"></div>
  <button @click="onConfirm">确认合并</button>
</template>

<style scoped>
div {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

button {
  background-color: #007ACC;
  color: white;
  position: absolute;
  border: transparent;
  height: 30px;
  width: 80px;
  right: 5vw;
  bottom: 5vh;
  border-radius: 2px;
}
</style>
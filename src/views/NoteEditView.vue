<script setup lang="ts">
import { useNotesStore } from '@/stores/notes'
import { computed, onMounted, onUnmounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { editor } from 'monaco-editor'

const noteStore = useNotesStore()
const router = useRouter()
const route = useRoute()

const note = computed(() => noteStore.getNote(+route.params.id))
const editorRef = ref<HTMLElement>()
const dark = window.matchMedia('(prefers-color-scheme: dark)')
let editorInstanse: editor.IStandaloneCodeEditor

const name = computed({
  get: () => note.value?.name,
  set: (value) => noteStore.updateDiff({ ...note.value, name: value })
})

const title = computed({
  get: () => note.value?.title,
  set: (value) => noteStore.updateDiff({ ...note.value, title: value })
})

async function onSave(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()

    noteStore.updateDiff({ ...note.value, detail: editorInstanse.getValue()})
    await noteStore.sync()
  }
}

async function delateNote() {
  await noteStore.deleteNote(note.value)
  router.push('/')
}

watch(note, (newNote, oldNote) => {
  const content = editorInstanse.getValue()
  if (newNote?.detail === content) return
  noteStore.updateDiff({ ...oldNote, detail: content })
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
  noteStore.updateDiff({ ...note.value, detail: editorInstanse.getValue()})

  document.removeEventListener('keydown', onSave, false)
  editorInstanse.dispose()
})

</script>

<template>
  <div id="editor-view">
    <button class="back" @click="router.push('/')">← 返回</button>
    <button class="delete" @click="delateNote">删除此笔记</button>
    <input type="text" v-model="title" class="title">
    <input type="text" v-model="name" class="name">
    <div class="line"></div>
    <div id="editor" ref="editorRef"></div>
  </div>
</template>

<style scoped>
.back {
  margin: 20px 0 0 40px;
  display: none;
  font-size: 19px;
  background-color: var(--color-background-mute);
  padding: 10px 17px;
  border: transparent;
  color: var(--color-text);
  border-radius: 3px;
}

.delete {
  float: right;
  background-color: var(--color-background-mute);
  padding: 10px 17px;
  color: #c43838;
  border: transparent;
  border-radius: 3px;
  margin: 35px 50px 0 0;
}

button:hover {
  background-color: var(--color-background-hover);
}

#editor-view {
  width: calc(100% - 325px);
  height: 100vh;
  background-color: var(--vscode-theme);
}

input {
  display: inline-block;
  outline: none;
  width: calc(100% - 200px);
  background-color: transparent;
  border: 0px;
  padding: 0 0 0 40px;
  color: var(--color-text);
}

.title {
  font-weight: bold;
  height: 40px;
  padding-top: 20px;
  font-size: 30px;
}

.name {
  padding: 20px 0 20px 45px;
  font-size: 16px;
}

#editor {
  width: 100%;
  height: 100%;
  display: inline-block;
  overflow: hidden;
}

@media screen and (max-width: 600px) {
  #editor-view {
    width: 100%;
  }

  .back {
    display: block;
  }

  .title {
    padding-top: 10px;
  }
} 
</style>
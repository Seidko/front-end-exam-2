<script setup lang="ts">
import { useNotesStore } from '@/stores/notes'
import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { editor } from 'monaco-editor'
import type { Note } from '@/stores/notes'
import type { ComputedRef } from 'vue'

const noteStore = useNotesStore()
const router = useRouter()
const route = useRoute()

const note: ComputedRef<Note> = computed(() => noteStore.getNote(+route.params.id) ?? note.value)
const editorRef = ref<HTMLElement>()
const dark = window.matchMedia('(prefers-color-scheme: dark)')
let editorInstanse: editor.IStandaloneCodeEditor
let deleted = false

const name = computed({
  get: () => note.value?.name,
  set: (value) => {
    if (!deleted) noteStore.updateDiff({ ...note.value, title: value })
  }
})

const title = computed({
  get: () => note.value?.title,
  set: (value) => {
    if (!deleted) noteStore.updateDiff({ ...note.value, title: value })
  }
})

async function save() {
  if (!deleted) noteStore.updateDiff({ ...note.value, detail: editorInstanse.getValue()})
  await noteStore.sync()
}

async function onSave(e: KeyboardEvent) {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    await save()
  }
}

async function deleteNote() {
  deleted = true
  await noteStore.deleteNote(note.value)
  await router.push('/')
}

watch(note, (newNote, oldNote) => {
  const content = editorInstanse.getValue()
  if (newNote?.detail === content) return
  if (!deleted) noteStore.updateDiff({ ...oldNote, detail: content })
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

onBeforeUnmount(() => {
  if (!deleted) noteStore.updateDiff({ ...note.value, detail: editorInstanse.getValue() })

  document.removeEventListener('keydown', onSave, false)
  editorInstanse.dispose()
})

</script>

<template>
  <div id="editor-view">
    <div class="narrow">
      <button class="back" @click="router.push('/')">← 返回</button>
      <button class="save" @click="save">保存</button>
    </div>
    <button class="delete" @click="deleteNote">删除此笔记</button>
    <input type="text" v-model="title" class="title">
    <input type="text" v-model="name" class="name">
    <div class="line"></div>
    <div id="editor" ref="editorRef"></div>
  </div>
</template>

<style scoped>
.narrow {
  margin: 20px 40px;
  display: none;
}

.save {
  background-color: var(--color-background-mute);
  padding: 10px 17px;
  border: transparent;
  color: var(--color-text);
  border-radius: 3px;
  float: right;
}

.back {
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

  .narrow {
    display: block;
  }

  .title {
    padding-top: 10px;
  }
} 
</style>
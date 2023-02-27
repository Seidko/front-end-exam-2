<script setup lang="ts"> 
import NoteListItem from '@/components/NoteListItem.vue'
import type { Note } from '@/stores/notes'
import { useNotesStore } from '@/stores/notes'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const noteStore = useNotesStore()
const router = useRouter()
const route = useRoute()

const query = ref('')
const searchedNote = ref<Note[]>([])

watch(query, async query => {
  if (!query.length) return
  searchedNote.value = await noteStore.searchNote(query).then(n => n.sort((a, b) => b.time - a.time))
})

const notes = computed(() => {
  if (!!query.value.length) return searchedNote.value
  return noteStore.notes.sort((a, b) => b.time - a.time)
})

async function newNote() {
  const note = await noteStore.newNote({ title: '新的标题', name: '作者名', detail: '写下你今日的想法吧！' })
  router.push(`/${note.id}`)
}
</script>

<template>
  <div class="list" :class="{ narrow: route.params.id !== undefined}">
    <div class="header">
      <h2 @click="router.push('/')">
        图灵日记本
        <button @click="newNote">+</button>
      </h2>
      <input type="text" placeholder="搜索..." title="搜索日记" v-model="query" />
    </div>
    <aside>
      <note-list-item v-for="note of notes" v-bind="note" :state="noteStore.getState(note.id)" :key="note.id" />
    </aside>
  </div>
</template>

<style scoped>
h2 {
  cursor: pointer;
}

.list {
  height: 100%;
  min-width: 300px;
  overflow-y: scroll;
  padding: 0px 10px 20px 15px;
  display: inline-block;
}

@media screen and (max-width: 600px) {
  .list {
    width: calc(100% - 25px);
  }

  .narrow {
  display: none;
}
} 

.header {
  position: sticky;
  top: 0px;
  background: linear-gradient(to bottom, var(--color-background) 80px, transparent);
  overflow: hidden;
}

input {
  outline: none;
  width: calc(100% - 16px);
  background-color: var(--color-background-mute);
  color: var(--color-text);
  border: 0px;
  height: 30px;
  border-radius: 3px;
  margin-bottom: 15px;
  padding: 0 8px;
}

.list::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
}

.list::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-border-hover);
}

.list::-webkit-scrollbar {
  background-color: transparent;
  width: 10px;
}

aside {
  border-radius: 3px;
}

button {
  float: right;
  background-color: var(--color-background-mute);
  padding: 5px 11px;
  color: var(--color-text);
  border: transparent;
  border-radius: 3px;
  margin-top: 6px;
  font-size: 18px;
}


button:hover {
  background-color: var(--color-background-hover);
}

</style>

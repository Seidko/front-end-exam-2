import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { isEqual, pick } from 'lodash'
import axios from 'axios'

export interface Note {
  id?: number,
  name?: string
  time?: number
  title?: string
  detail?: string
}

export type NoteState = 'modified'

export interface Conflict {
  remote: Note
  diff: Note
}

export function transformTime(raw: Note): Note {
  const note = raw
  note.time = new Date(raw.time).getTime()
  return note
}

export const useNotesStore = defineStore('notes', () => {
  const localNotes = ref<Note[]>([])
  const diffs = ref<Note[]>([])

  remoteNote().then(n => localNotes.value = n)

  const notes = computed(() => localNotes)

  async function newNote(note: Note): Promise<Note> {
    const { data } = await axios({
      method: 'POST',
      url: '/dairy/addDairy',
      params: pick(note, ['title', 'name', 'detail']),
    })

    if (!data.success || !data.data?.item) {
      throw new Error(`Error in updating note "${note.title}", code: ${data.code}`)
    }

    const newNote = transformTime(data.data.item)
    localNotes.value.push(newNote)
    return newNote
  }

  async function deleteNote(note: Note) {
    const { data } = await axios({
      method: 'DELETE',
      url: '/dairy/deleteDairy',
      params: { id: note.id },
    })

    if (!data.success) {
      throw new Error(`Error in updating note "[${note.id}] ${note.title}", code: ${data.code}`)
    }

    localNotes.value.splice(localNotes.value.findIndex(n => n.id === note.id), 1)
  }

  async function remoteNote(): Promise<Note[]> {
    const { data } = await axios({
      method: 'GET',
      url: '/dairy/selectDairy',
    })
    return data?.data.items.map((n: Note) => transformTime(n)) ?? []
  }

  async function sync() {
    for (const diff of diffs.value) {
      const { data } = await axios({
        method: 'POST',
        url: '/dairy/updateDairy',
        params: pick(diff, ['title', 'name', 'detail', 'id']),
      })

      if (!data.success || !data.data?.item) {
        throw new Error(`Error in updating note "[${diff.id}] ${diff.title}", code: ${data.code}`)
      }
      
      const index = localNotes.value.findIndex(local => local.id === diff.id)
      localNotes.value[index] = transformTime(data.data.item)
      continue
    }

    diffs.value = []
  }

  function getNote(id: number): Note {
    return diffs.value.find(d => d.id === id) ?? localNotes.value.find(n => n.id === id)
  }

  function getState(id: number): NoteState {
    if (diffs.value.find(d => d.id === id)) return 'modified'
  }

  function updateDiff(note: Note) {
    if (note.id === undefined) return
    const lIndex = localNotes.value.findIndex(l => l.id === note.id)
    if (isEqual(localNotes.value[lIndex], note)) return
    const dIndex = diffs.value.findIndex(d => d.id === note.id)
    if (dIndex === -1) diffs.value.push({ ...localNotes.value[lIndex], ...note })
    else diffs.value[dIndex] = { ...localNotes.value[lIndex], ...note }
  }

  return { 
    getNote,
    newNote,
    deleteNote,
    sync,
    updateDiff,
    getState,
    diffs,
    notes,
  }
})

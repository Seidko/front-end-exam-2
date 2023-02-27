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


function dedupe<T = any>(arr: T[], primary: (item: T) => string | number | symbol): T[] {
  // @ts-ignore
  return Object.values(arr.reduce((p, c) => ({...p, [primary(c)]: c}), {}))
}

function transformTime(raw: Note): Note {
  const note = raw
  note.time = new Date(raw.time).getTime()
  return note
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const diffs = ref<Note[]>([])

  remoteNote().then(n => notes.value = n)

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
    notes.value.push(newNote)
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

    notes.value.splice(notes.value.findIndex(n => n.id === note.id), 1)
    diffs.value.splice(diffs.value.findIndex(d => d.id === note.id), 1)
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
      
      const index = notes.value.findIndex(n => n.id === diff.id)
      notes.value[index] = transformTime(data.data.item)
      continue
    }

    diffs.value = []
  }

  function getNote(id: number): Note {
    return diffs.value.find(d => d.id === id) ?? notes.value.find(n => n.id === id)
  }

  function getState(id: number): NoteState {
    if (diffs.value.find(d => d.id === id)) return 'modified'
  }

  function search(condition: string, type: number) {
    return axios({
      method: 'POST',
      url: '/dairy/selectDairyByCondition',
      params: { type, condition }
    })
  }

  async function searchNote(query: string): Promise<Note[]> {
    const res = await Promise.all([
      search(query, 1),
      search(query, 2),
      search(query, 3),
    ])
    
    // @ts-ignore
    return dedupe(res.map(r => r.data.data?.items.map((n: Note) => transformTime(n))).flat(), n => n.id)
  }

  function updateDiff(note: Note) {
    if (note.id === undefined) return
    const lIndex = notes.value.findIndex(l => l.id === note.id)
    if (isEqual(notes.value[lIndex], note)) return
    const dIndex = diffs.value.findIndex(d => d.id === note.id)
    if (dIndex === -1) diffs.value.push({ ...notes.value[lIndex], ...note })
    else diffs.value[dIndex] = { ...notes.value[lIndex], ...note }
  }

  return { 
    getNote,
    newNote,
    deleteNote,
    searchNote,
    sync,
    updateDiff,
    getState,
    diffs,
    notes,
  }
})

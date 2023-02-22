import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { isEqual, pick } from 'lodash'
import axios from 'axios'

export interface Note {
  id?: number,
  name?: string
  time?: string
  title?: string
  detail?: string
  state?: 'edited' | 'conflict'
}

export interface Conflict {
  local: Note
  remote: Note
  diff: Note
}

export const useNotesStore = defineStore('notes', () => {
  const localNotes = ref<Note[]>([])
  const diffs = reactive<Note[]>([])
  const conflicts = reactive<Conflict[]>([])

  remoteNote().then(n => localNotes.value = n)

  const notes = computed(() => localNotes)

  async function newNote(note: Note) {
    const { data } = await axios({
      method: 'POST',
      url: '/dairy/addDairy',
      params: pick(note, ['title', 'name', 'detail']),
    })

    if (!data.success || !data.data?.item) throw new Error(`Error in updating note "${note.title}", code: ${data.code}`)

    localNotes.value.push(data.data.item)
  }

  async function remoteNote(): Promise<Note[]> {
    const { data } = await axios({
      method: 'GET',
      url: '/dairy/selectDairy',
    })
    return data?.data.items ?? []
  }

  async function sync(): Promise<boolean> {
    for (const diff of diffs) {
      const remote = await remoteNote().then(remotes => remotes.find(remote => remote.id === diff.id))
      const local = localNotes.value.find(local => local.id === diff.id)

      if (isEqual(local, remote)) {
        const { data } = await axios({
          method: 'POST',
          url: '/dairy/updateDairy',
          params: pick(diff, ['title', 'name', 'detail', 'id']),
        })

        if (!data.success || !data.data?.item) throw new Error(`Error in updating note "[${diff.id}] ${diff.title}", code: ${data.code}`)
        
        const index = localNotes.value.findIndex(local => local.id === diff.id)
        localNotes.value[index] = data.data.item

        continue
      }
      conflicts.push({ local, remote, diff })
    }

    diffs.splice(0)

    return !!conflicts.length
  }

  function getNote(id: number): Note {
    return diffs.find(n => n.id === id) ?? localNotes.value.find(n => n.id === id)
  }

  function updateDiff(previous: Note, current: Note) {
    if (previous === undefined || current === undefined || previous.detail === current.detail) return
    const index = diffs.findIndex(d => d.id === current.id)
    if (index === -1) diffs.push({ ...previous, detail: current.detail })
    else diffs[index] = current
  }

  async function resovleConflict(note: Note) {
    const { data } = await axios({
      method: 'POST',
      url: '/dairy/updateDairy',
      params: pick(note, ['title', 'name', 'detail', 'id']),
    })

    if (!data.success || !data.data?.item) throw new Error(`Error in updating note "[${note.id}] ${note.title}", code: ${data.code}`)
        
    const cIndex = conflicts.findIndex(c => c.local.id === note.id)
    const lIndex = localNotes.value.findIndex(local => local.id === note.id)
    conflicts.splice(cIndex, 1)
    localNotes.value[lIndex] = data.data.item
  }

  return { getNote, newNote, sync, updateDiff, resovleConflict, diffs, notes, conflicts }
})

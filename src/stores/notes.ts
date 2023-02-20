import { computed, reactive } from 'vue'
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
  const localNotes = reactive<Note[]>([])
  const diffs = reactive<Note[]>([])
  const conflicts = reactive<Conflict[]>([])

  ;(async () => {
    localNotes.splice(0)
    localNotes.push(...await remoteNote())
  })()

  async function newNote(note: Note) {
    const { data } = await axios({
      method: 'POST',
      url: '/dairy/addDairy',
      params: pick(note, ['title', 'name', 'detail']),
    })

    if (!data.success) throw new Error(`Error in updating note "${note.title}", code: ${data.code}`)

    localNotes.push(data.data.item)
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
      const local = localNotes.find(local => local.id === diff.id)

      if (isEqual(local, remote)) {
        const { data } = await axios({
          method: 'POST',
          url: '/dairy/updateDairy',
          params: pick(diff, ['title', 'name', 'detail', 'id']),
        })

        if (!data.success) throw new Error(`Error in updating note "[${diff.id}] ${diff.title}", code: ${data.code}`)
        
        const index = localNotes.findIndex(local => local.id === diff.id)
        localNotes[index] = data.data.item

        continue
      }
      conflicts.push({ local, remote, diff })
    }

    diffs.splice(0)

    return Boolean(conflicts.length)
  }

  function getNote(id: number): Note {
    return diffs.find(n => n.id === id) ?? localNotes.find(n => n.id === id)
  }

  const notes = computed(() => localNotes)

  return { getNote, newNote, sync, diffs, notes, conflicts }
})

import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { isEqual, pick } from 'lodash'
import axios from 'axios'

export interface Note {
  id?: number,
  name?: string
  time?: string
  title?: string
  detail?: string
}

export interface Conflict {
  local: Note
  remote: Note
  diff: Note
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const diffs = reactive<Note[]>([])

  async function getNotes() {
    if (!notes.value.length) notes.value = await getNoteFromRemote()
    return notes
  }

  function setNote(note: Note) {
    diffs.push(note)
  }

  async function newNote(note: Note) {
    await axios({
      method: 'POST',
      url: 'http://pve.lycoris.site:9780/dairy/addDairy',
      params: pick(note, ['title', 'name', 'detail']),
    })
    notes.value = await getNoteFromRemote()
  }

  async function getNoteFromRemote(): Promise<Note[]> {
    const { data } = await axios({
      method: 'GET',
      url: 'http://pve.lycoris.site:9780/dairy/selectDairy',
    })
    return data
  }

  async function sync(): Promise<Conflict[]> {
    const conflicts: Conflict[] = []

    for (const diff of diffs) {
      const remote = await getNoteFromRemote().then(remotes => remotes.find(remote => remote.id === diff.id))
      const local = await getNotes().then(note => note.value.find(local => local.id === diff.id))

      if (isEqual(local, remote)) {
        const { data } = await axios({
          method: 'POST',
          url: 'http://pve.lycoris.site:9780/dairy/updateDairy',
          params: pick(diff, ['title', 'name', 'detail', 'id']),
        })

        if (!data.success) throw new Error(`Error in updating note "[${diff.id}] ${diff.title}"`)

        continue
      }
      conflicts.push({ local, remote, diff })
    }

    notes.value = await getNoteFromRemote()
    diffs.splice(0)

    if (conflicts.length) return conflicts
  }

  return { getNotes, setNote, newNote, sync, diffs }
})

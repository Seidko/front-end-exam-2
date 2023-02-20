import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { isEqual } from 'lodash'
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
    const { detail, name, title } = note
    await axios({
      method: 'POST',
      url: 'http://pve.lycoris.site:9780/dairy/addDairy',
      params: { detail, name, title },
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
    const updated: Note[] = []

    for (const diff of diffs) {
      const remote = await getNoteFromRemote().then(remotes => remotes.find(remote => remote.id === diff.id))
      const local = await getNotes().then(note => note.value.find(local => local.id === diff.id))

      if (isEqual(local, remote)) {
        const { id, detail, name, title } = diff
        const { data } = await axios({
          method: 'POST',
          url: 'http://pve.lycoris.site:9780/dairy/updateDairy',
          params: { id, detail, name, title },
        })

        if (!data.success) throw new Error(`Error in updating note "[${id}] ${title}"`)
        updated.push(local)

        continue
      }
      conflicts.push({ local, remote, diff })
    }

    const remotes = await getNoteFromRemote()
    for (const local of updated) {
      const remote = remotes.find(remote => remote.id === local.id)

      ;({ id: local.id } = remote)
    }

    if (conflicts.length) return conflicts
  }

  return { getNotes, setNote, diffs, sync }
})

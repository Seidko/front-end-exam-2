import { createRouter, createWebHistory } from 'vue-router'
import { useNotesStore } from '@/stores/notes'

const EmptyView = () => import('@/views/EmptyView.vue')
const NoteEditView = () => import('@/views/NoteEditView.vue')
const ConflictResolveView = () => import('@/views/ConflictResolveView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'empty',
      component: EmptyView
    },
    {
      path: '/:id(\\d+)',
      name: 'note',
      component: NoteEditView
    },
    {
      path: '/conflict/:id(\\d+)',
      name: 'conflict',
      beforeEnter(to) {
        const notesStore = useNotesStore()
        if (!notesStore.conflicts.find(c => c.diff.id === +to.params.id)) router.back()
      },
      component: ConflictResolveView
    },
    {
      path: '/conflict',
      redirect() {
        const notesStore = useNotesStore()
        if (!notesStore.conflicts.length) {
          router.back()
          return
        }
        return `/conflict/${notesStore.conflicts[0].diff.id}`
      },
    },
  ]
})

export default router

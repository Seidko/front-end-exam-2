import { createRouter, createWebHistory } from 'vue-router'

const EmptyView = () => import('@/views/EmptyView.vue')
const NoteEditView = () => import('@/views/NoteEditView.vue')

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
  ]
})

export default router

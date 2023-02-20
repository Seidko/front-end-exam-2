import { createRouter, createWebHistory } from 'vue-router'
import EmptyView from '@/views/EmptyView.vue'

const NoteEditViewVue = () => import('@/views/NoteEditView.vue')

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
      component: NoteEditViewVue
    }
  ]
})

export default router

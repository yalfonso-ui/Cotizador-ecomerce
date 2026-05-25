import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import TravelWizard from '@/components/TravelWizard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TravelWizard
    },
    {
      path: '/cotizacion',
      name: 'quote',
      component: TravelWizard
    }
  ]
})

export default router
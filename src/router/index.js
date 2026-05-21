import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import QuoteFlowWizard from '@/components/quote-flow/QuoteFlowWizard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/cotizacion',
      name: 'quote',
      component: QuoteFlowWizard
    }
  ]
})

export default router
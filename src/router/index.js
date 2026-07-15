import { createRouter, createWebHistory } from 'vue-router'
import { useWizardStore } from '@/stores/useWizardStore.js'
import HomeView from '@/views/HomeView.vue'
import TravelWizard from '@/components/TravelWizard.vue'
import EmployeesView from '@/views/EmployeesView.vue'
import ConfirmationPayment from '@/views/ConfirmationPayment.vue'

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
    },
    {
      path: '/confirmacion-pago',
      name: 'payment-confirmation',
      component: ConfirmationPayment
    },
    {
      path: '/employees',
      name: 'employees',
      component: EmployeesView
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { left: 0, top: 0 }
  }
})

const WIZARD_PATHS = ['/', '/cotizacion']

router.beforeEach((to) => {
  if (!WIZARD_PATHS.includes(to.path)) return
  try {
    const wizardStore = useWizardStore()
    const raw = to.query.step
    if (raw !== undefined && raw !== null && raw !== '') {
      const step = parseInt(raw, 10)
      if (!isNaN(step) && step >= 0) {
        wizardStore.showWizardView()
        wizardStore.goToStep(step)
      }
    } else {
      wizardStore.showLandingView()
      wizardStore.goToStep(0)
    }
  } catch {
    // Pinia not yet initialized — initial state applies
  }
})

export default router
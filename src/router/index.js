import { createRouter, createWebHistory } from 'vue-router'
import { useWizardStore } from '@/stores/useWizardStore.js'
import HomeView from '@/views/HomeView.vue'
import TravelWizard from '@/components/TravelWizard.vue'
import EmployeesView from '@/views/EmployeesView.vue'
import ConfirmationPayment from '@/views/ConfirmationPayment.vue'

// Módulo de reembolsos — layout independiente del wizard
const ReembolsosView = () => import('@/views/reembolsos/ReembolsosView.vue')
const ReembolsosHome = () => import('@/views/reembolsos/ReembolsosHome.vue')
const ReembolsosCreate = () => import('@/views/reembolsos/ReembolsosCreate.vue')
const ReembolsosConsult = () => import('@/views/reembolsos/ReembolsosConsult.vue')

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
      path: '/reembolsos',
      component: ReembolsosView,
      children: [
        {
          path: '',
          name: 'reembolsos-home',
          component: ReembolsosHome
        },
        {
          path: 'crear',
          name: 'reembolsos-crear',
          component: ReembolsosCreate
        },
        {
          path: 'consultar',
          name: 'reembolsos-consultar',
          component: ReembolsosConsult
        }
      ]
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
const SESSION_KEY = 'lemonade_wizard_session_started'

router.beforeEach((to) => {
  if (!WIZARD_PATHS.includes(to.path)) return
  try {
    const wizardStore = useWizardStore()
    const raw = to.query.step

    // Detección de carga inicial: si la app todavía no marcó el inicio
    // de la sesión del wizard, significa que el usuario acaba de abrir
    // la app (link compartido, primera visita, recargar la pestaña, etc.).
    // En ese caso, ignoramos el ?step= y siempre llevamos a la landing.
    const isInitialLoad = typeof sessionStorage !== 'undefined' &&
      !sessionStorage.getItem(SESSION_KEY)

    if (isInitialLoad) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(SESSION_KEY, '1')
      }
      wizardStore.showLandingView()
      wizardStore.goToStep(0)
      // Si la URL trae ?step=X (link compartido), la limpiamos para
      // que la persona siempre aterrice en "/".
      if (raw !== undefined && raw !== null && raw !== '') {
        return { path: to.path, query: {}, replace: true }
      }
      return
    }

    // Navegación interna del wizard: respetar el ?step= para que el
    // back/forward del navegador funcione correctamente.
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
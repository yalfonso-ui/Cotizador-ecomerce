// router-snippet.js
// ─────────────────────────────────────────────────────────────────
// Snippet listo para pegar en src/router/index.js de tu proyecto.
// Asume que tienes vue-router 4 configurado con createWebHistory.

import { createRouter, createWebHistory } from 'vue-router'

// Lazy-load de las vistas del módulo (code-splitting automático)
const ReembolsosView    = () => import('@/views/reembolsos/ReembolsosView.vue')
const ReembolsosHome    = () => import('@/views/reembolsos/ReembolsosHome.vue')
const ReembolsosCreate  = () => import('@/views/reembolsos/ReembolsosCreate.vue')
const ReembolsosConsult = () => import('@/views/reembolsos/ReembolsosConsult.vue')

const routes = [
  // ...tus otras rutas existentes
  // { path: '/',          component: HomeView },
  // { path: '/cotizacion', component: TravelWizard },
  // { path: '/employees',  component: EmployeesView },

  // ── Módulo de reembolsos ──
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { left: 0, top: 0 }
  }
})

export default router

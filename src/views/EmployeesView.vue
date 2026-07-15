<script setup>
import { ref, computed } from 'vue'
import { EMPLOYEES, SEDES, ESTADOS } from '@/data/employees.js'
import EmployeePanel from '@/components/EmployeesView/EmployeePanel.vue'

const SEDE_FILTERS = [
  { code: 'ALL', name: 'Todas las Sedes' },
  ...SEDES
]

const ESTADO_FILTERS = [
  { code: 'ALL', name: 'Todos los estados' },
  ...ESTADOS
]

const selectedEmployee = ref(null)
const panelOpen = ref(false)

function openPanel(employee) {
  selectedEmployee.value = employee
  panelOpen.value = true
}

function closePanel() {
  panelOpen.value = false
}

const activeSede = ref('ALL')
const activeEstado = ref('ALL')
const searchQuery = ref('')

const filtered = computed(() => {
  return EMPLOYEES.filter(emp => {
    if (activeSede.value !== 'ALL' && emp.sede !== activeSede.value) return false
    if (activeEstado.value !== 'ALL' && emp.estado !== activeEstado.value) return false
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const haystack = `${emp.name} ${emp.email} ${emp.identificacion} ${emp.cargo} ${emp.proceso}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
})

const stats = computed(() => {
  const total = filtered.value.length
  const bySede = SEDES.map(s => ({
    ...s,
    count: filtered.value.filter(e => e.sede === s.code).length
  }))
  return { total, bySede }
})

function sedeName(code) {
  return SEDES.find(s => s.code === code)?.name || code
}

function estadoName(code) {
  return ESTADOS.find(e => e.code === code)?.name || code
}

function estadoClass(code) {
  const map = {
    activo: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    inactivo: 'bg-slate-100 text-slate-600 ring-slate-200',
    vacaciones: 'bg-amber-50 text-amber-700 ring-amber-200'
  }
  return map[code] || 'bg-slate-100 text-slate-600 ring-slate-200'
}

function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <RouterLink
              to="/"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[color:var(--ds-primary)] transition-colors focus:outline-none focus-visible:underline"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Volver al flujo
            </RouterLink>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-2">
            <div>
              <p class="ds-eyebrow">Administración</p>
              <h1 class="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mt-1">
                Gestión de <span style="color: #43D3FF;">Empleados</span>
              </h1>
              <p class="text-sm text-slate-500 mt-1.5">
                {{ stats.total }} {{ stats.total === 1 ? 'colaborador' : 'colaboradores' }}
                <span v-if="activeSede !== 'ALL' || activeEstado !== 'ALL' || searchQuery">
                  (filtrado de {{ EMPLOYEES.length }})
                </span>
              </p>
            </div>

            <!-- Sede stats -->
            <div class="flex items-center gap-1.5 text-xs">
              <span
                v-for="s in stats.bySede"
                :key="s.code"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 font-semibold"
                :style="{ backgroundColor: s.code === 'COL' ? '#FCD11615' : s.code === 'MEX' ? '#00684715' : '#1A1F7115', color: s.code === 'COL' ? '#7A5C00' : s.code === 'MEX' ? '#003D2A' : '#0D1142', borderColor: s.code === 'COL' ? '#FCD11640' : s.code === 'MEX' ? '#00684740' : '#1A1F7140' }"
              >
                <img :src="`https://flagcdn.com/w40/${s.flag}.png`" :alt="s.name" class="w-3.5 h-3.5 rounded-sm object-cover" />
                {{ s.code }}
                <span class="text-slate-500 font-normal">{{ s.count }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Toolbar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div class="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 space-y-3">
        <!-- Sede segmented control -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex items-center gap-2 shrink-0">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sede</span>
          </div>

          <div
            role="tablist"
            aria-label="Filtrar por sede"
            class="inline-flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl"
          >
            <button
              v-for="sede in SEDE_FILTERS"
              :key="sede.code"
              type="button"
              role="tab"
              :aria-selected="activeSede === sede.code"
              @click="activeSede = sede.code"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-primary)] focus-visible:ring-offset-2"
              :class="activeSede === sede.code
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'"
            >
              <img
                v-if="sede.code !== 'ALL'"
                :src="`https://flagcdn.com/w40/${sede.flag}.png`"
                :alt="sede.name"
                class="w-3.5 h-3.5 rounded-sm object-cover"
              />
              <span>{{ sede.code === 'ALL' ? sede.name : sede.code }}</span>
            </button>
          </div>

          <span class="hidden sm:block w-px h-6 bg-slate-200 shrink-0" aria-hidden="true" />

          <!-- Estado segmented control -->
          <div class="flex items-center gap-2 shrink-0">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</span>
          </div>

          <div
            role="tablist"
            aria-label="Filtrar por estado"
            class="inline-flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl"
          >
            <button
              v-for="estado in ESTADO_FILTERS"
              :key="estado.code"
              type="button"
              role="tab"
              :aria-selected="activeEstado === estado.code"
              @click="activeEstado = estado.code"
              class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-primary)] focus-visible:ring-offset-2"
              :class="activeEstado === estado.code
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'"
            >
              {{ estado.name }}
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar por nombre, cédula, cargo o proceso…"
            aria-label="Buscar empleados"
            class="w-full sm:max-w-md sm:ml-7 h-10 pl-9 pr-4 text-sm bg-white border border-slate-200/80 rounded-xl placeholder:text-slate-400 transition-all focus:outline-none focus:border-[color:var(--ds-focus)] focus:ring-2 focus:ring-[color:var(--ds-focus-ring)]"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="mt-5 bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50/50">
                <th scope="col" class="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3 whitespace-nowrap">
                  Colaborador
                </th>
                <th scope="col" class="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3 whitespace-nowrap">
                  Sede
                </th>
                <th scope="col" class="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3 whitespace-nowrap">
                  No. Identificación
                </th>
                <th scope="col" class="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3 whitespace-nowrap">
                  Proceso / Área
                </th>
                <th scope="col" class="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3 whitespace-nowrap">
                  Cargo
                </th>
                <th scope="col" class="text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3 whitespace-nowrap">
                  Estado
                </th>
                <th scope="col" class="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 px-5 py-3 whitespace-nowrap">
                  Ingreso
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="emp in filtered"
                :key="emp.id"
                @click="openPanel(emp)"
                :class="[
                  'cursor-pointer hover:bg-slate-50/80 transition-colors',
                  selectedEmployee?.id === emp.id ? 'bg-slate-50' : ''
                ]"
              >
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      :style="{ backgroundColor: emp.sede === 'COL' ? '#00184C' : emp.sede === 'MEX' ? '#006847' : '#1A1F71' }"
                      aria-hidden="true"
                    >
                      {{ emp.name.split(' ').map(n => n[0]).slice(0, 2).join('') }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-900 truncate">{{ emp.name }}</p>
                      <p class="text-xs text-slate-500 truncate">{{ emp.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-3">
                  <span
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ring-1"
                    :style="{
                      backgroundColor: emp.sede === 'COL' ? '#FCD11615' : emp.sede === 'MEX' ? '#00684715' : '#1A1F7115',
                      color: emp.sede === 'COL' ? '#7A5C00' : emp.sede === 'MEX' ? '#003D2A' : '#0D1142',
                      borderColor: 'transparent'
                    }"
                    :title="sedeName(emp.sede)"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :style="{ backgroundColor: emp.sede === 'COL' ? '#FCD116' : emp.sede === 'MEX' ? '#006847' : '#1A1F71' }"
                      aria-hidden="true"
                    />
                    {{ emp.sede }}
                  </span>
                </td>
                <td class="px-5 py-3 text-slate-700 font-mono text-xs whitespace-nowrap">
                  {{ emp.identificacion }}
                </td>
                <td class="px-5 py-3 text-slate-700 text-xs">
                  {{ emp.proceso }}
                </td>
                <td class="px-5 py-3 text-slate-600 text-xs">
                  {{ emp.cargo }}
                </td>
                <td class="px-5 py-3">
                  <span
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ring-1"
                    :class="estadoClass(emp.estado)"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="emp.estado === 'activo' ? 'bg-emerald-500' : emp.estado === 'vacaciones' ? 'bg-amber-500' : 'bg-slate-400'"
                      aria-hidden="true"
                    />
                    {{ estadoName(emp.estado) }}
                  </span>
                </td>
                <td class="px-5 py-3 text-right text-slate-500 text-xs whitespace-nowrap tabular-nums">
                  {{ formatDate(emp.fechaIngreso) }}
                </td>
              </tr>
              <tr v-if="filtered.length === 0">
                <td colspan="7" class="px-5 py-12 text-center">
                  <div class="inline-flex flex-col items-center gap-2 text-slate-400">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p class="text-sm font-medium">No se encontraron empleados con esos filtros.</p>
                    <p class="text-xs">Prueba ajustar la sede, el estado o la búsqueda.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500">
          <p>
            Mostrando
            <span class="font-semibold text-slate-700 tabular-nums">{{ filtered.length }}</span>
            de
            <span class="font-semibold text-slate-700 tabular-nums">{{ EMPLOYEES.length }}</span>
            colaboradores
          </p>
          <p v-if="activeSede !== 'ALL' || activeEstado !== 'ALL' || searchQuery" class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[color:var(--ds-secondary)]" aria-hidden="true" />
            Filtros activos
          </p>
        </div>
      </div>
    </div>

    <EmployeePanel
      :employee="selectedEmployee"
      :open="panelOpen"
      @close="closePanel"
    />
  </div>
</template>
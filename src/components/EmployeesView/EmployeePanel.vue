<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import { SEDES } from '@/data/employees.js'
import { getEmployeeAccess, setEmployeeAccess } from '@/data/employeeAccess.js'

const props = defineProps({
  employee: { type: Object, default: null },
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const access = ref(null)
const editState = ref({ genesys: false, avaya: false, issabel: false })
const extensionDraft = ref({ genesys: '', avaya: '', issabel: '' })

const SEDE_BADGE = computed(() => {
  if (!props.employee) return null
  return SEDES.find(s => s.code === props.employee.sede)
})

function loadAccess() {
  if (!props.employee) {
    access.value = null
    return
  }
  access.value = getEmployeeAccess(props.employee)
  extensionDraft.value = {
    genesys: access.value.telefonia.genesys.extension || '',
    avaya: access.value.telefonia.avaya.extension || '',
    issabel: access.value.telefonia.issabel.extension || ''
  }
}

watch(() => [props.employee?.id, props.open], () => {
  if (props.open) loadAccess()
}, { immediate: true })

function persist() {
  if (!props.employee || !access.value) return
  setEmployeeAccess(props.employee.id, JSON.parse(JSON.stringify(access.value)))
}

function toggle(field, value) {
  if (!access.value) return
  if (field === 'dominio' || field === 'vpn') {
    access.value[field] = value
    persist()
    return
  }
  if (field === 'sia' || field === 'eva') {
    access.value.sistemas[field].activo = value
    persist()
    return
  }
  if (['genesys', 'avaya', 'issabel'].includes(field)) {
    access.value.telefonia[field].activo = value
    if (value && !extensionDraft.value[field]) {
      extensionDraft.value[field] = access.value.telefonia[field].extension || ''
    }
    persist()
  }
}

function startEditExtension(field) {
  editState.value[field] = true
  nextTick(() => {
    document.getElementById(`ext-input-${field}`)?.focus()
  })
}

function commitExtension(field) {
  if (!access.value) return
  const trimmed = (extensionDraft.value[field] || '').trim()
  access.value.telefonia[field].extension = trimmed
  if (trimmed && !access.value.telefonia[field].activo) {
    access.value.telefonia[field].activo = true
  }
  editState.value[field] = false
  persist()
}

function cancelExtension(field) {
  extensionDraft.value[field] = access.value.telefonia[field].extension || ''
  editState.value[field] = false
}

function onExtensionKey(field, e) {
  if (e.key === 'Enter') {
    e.preventDefault()
    commitExtension(field)
  } else if (e.key === 'Escape') {
    cancelExtension(field)
  }
}

function close() {
  emit('close')
}

function onBackdrop(e) {
  if (e.target === e.currentTarget) close()
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.open) close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

watch(() => props.open, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

function sedeAccent(sede) {
  const map = { COL: '#FCD116', MEX: '#006847', USAEX: '#1A1F71' }
  return map[sede] || '#94A3B8'
}
function sedeText(sede) {
  const map = { COL: '#7A5C00', MEX: '#003D2A', USAEX: '#0D1142' }
  return map[sede] || '#475569'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="open && employee"
        class="fixed inset-0 z-[110] flex justify-end"
        @click.self="onBackdrop"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`panel-title-${employee.id}`"
      >
        <div
          class="absolute inset-0 bg-[#00184C]/30 backdrop-blur-sm"
          aria-hidden="true"
        />

        <aside
          class="relative h-full w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden"
        >
          <!-- Header -->
          <header class="shrink-0 px-6 pt-6 pb-5 border-b border-slate-100">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  :style="{ backgroundColor: sedeAccent(employee.sede) }"
                  aria-hidden="true"
                >
                  {{ employee.name.split(' ').map(n => n[0]).slice(0, 2).join('') }}
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Detalle del colaborador
                  </p>
                  <h2
                    :id="`panel-title-${employee.id}`"
                    class="text-lg font-bold text-slate-900 truncate"
                  >
                    {{ employee.name }}
                  </h2>
                  <p class="text-xs text-slate-500 truncate">{{ employee.cargo }}</p>
                </div>
              </div>
              <button
                type="button"
                @click="close"
                class="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-primary)] focus-visible:ring-offset-2"
                aria-label="Cerrar panel"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                :style="{ backgroundColor: sedeAccent(employee.sede) + '15', color: sedeText(employee.sede) }"
              >
                <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: sedeAccent(employee.sede) }" />
                {{ employee.sede }}
              </span>
              <span class="text-slate-300" aria-hidden="true">·</span>
              <span class="font-mono text-slate-500">{{ employee.identificacion }}</span>
              <span class="text-slate-300" aria-hidden="true">·</span>
              <span class="text-slate-500 truncate">{{ employee.proceso }}</span>
            </div>
          </header>

          <!-- Scrollable content -->
          <div v-if="access" class="flex-1 overflow-y-auto">
            <!-- INFRAESTRUCTURA Y RED -->
            <section class="px-6 py-5">
              <h3 class="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-3">
                Infraestructura y red
              </h3>
              <div class="space-y-4">
                <ToggleSwitch
                  :modelValue="access.dominio"
                  label="Usuario de Dominio"
                  description="Cuenta de Active Directory corporativa"
                  @update:modelValue="toggle('dominio', $event)"
                />
                <ToggleSwitch
                  :modelValue="access.vpn"
                  label="Acceso VPN corporativo"
                  description="Conexión remota a la red interna"
                  @update:modelValue="toggle('vpn', $event)"
                />
              </div>
            </section>

            <div class="border-t border-slate-100" />

            <!-- TELEFONÍA & CONTACT CENTER -->
            <section class="px-6 py-5">
              <h3 class="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-1">
                Telefonía &amp; contact center
              </h3>
              <p class="text-xs text-slate-500 mb-4">
                Activa el sistema para mostrar o editar la extensión asignada.
              </p>

              <div class="space-y-5">
                <!-- Genesys -->
                <div>
                  <ToggleSwitch
                    :modelValue="access.telefonia.genesys.activo"
                    label="Genesys Cloud"
                    @update:modelValue="toggle('genesys', $event)"
                  />
                  <div class="mt-2 ml-1 flex items-center gap-2">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-16 shrink-0">Ext.</span>
                    <input
                      v-if="editState.genesys"
                      :id="`ext-input-genesys`"
                      v-model="extensionDraft.genesys"
                      @blur="commitExtension('genesys')"
                      @keydown="onExtensionKey('genesys', $event)"
                      maxlength="6"
                      placeholder="4101"
                      class="w-24 h-8 px-2.5 text-sm font-mono tabular-nums bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[color:var(--ds-focus)] focus:ring-2 focus:ring-[color:var(--ds-focus-ring)]"
                    />
                    <button
                      v-else
                      type="button"
                      @click="startEditExtension('genesys')"
                      :disabled="!access.telefonia.genesys.activo"
                      class="h-8 px-2.5 text-sm font-mono tabular-nums rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-primary)]"
                      :class="access.telefonia.genesys.activo
                        ? 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 cursor-text'
                        : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'"
                    >
                      {{ access.telefonia.genesys.extension || '—' }}
                    </button>
                    <span
                      v-if="editState.genesys"
                      class="text-[11px] text-slate-400"
                    >Enter ↵ para guardar · Esc para cancelar</span>
                  </div>
                </div>

                <!-- Avaya -->
                <div>
                  <ToggleSwitch
                    :modelValue="access.telefonia.avaya.activo"
                    label="Extension Avaya"
                    @update:modelValue="toggle('avaya', $event)"
                  />
                  <div class="mt-2 ml-1 flex items-center gap-2">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-16 shrink-0">Ext.</span>
                    <input
                      v-if="editState.avaya"
                      :id="`ext-input-avaya`"
                      v-model="extensionDraft.avaya"
                      @blur="commitExtension('avaya')"
                      @keydown="onExtensionKey('avaya', $event)"
                      maxlength="6"
                      placeholder="4102"
                      class="w-24 h-8 px-2.5 text-sm font-mono tabular-nums bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[color:var(--ds-focus)] focus:ring-2 focus:ring-[color:var(--ds-focus-ring)]"
                    />
                    <button
                      v-else
                      type="button"
                      @click="startEditExtension('avaya')"
                      :disabled="!access.telefonia.avaya.activo"
                      class="h-8 px-2.5 text-sm font-mono tabular-nums rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-primary)]"
                      :class="access.telefonia.avaya.activo
                        ? 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 cursor-text'
                        : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'"
                    >
                      {{ access.telefonia.avaya.extension || '—' }}
                    </button>
                    <span
                      v-if="editState.avaya"
                      class="text-[11px] text-slate-400"
                    >Enter ↵ para guardar · Esc para cancelar</span>
                  </div>
                </div>

                <!-- Issabel -->
                <div>
                  <ToggleSwitch
                    :modelValue="access.telefonia.issabel.activo"
                    label="Issabel"
                    @update:modelValue="toggle('issabel', $event)"
                  />
                  <div class="mt-2 ml-1 flex items-center gap-2">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-16 shrink-0">Ext.</span>
                    <input
                      v-if="editState.issabel"
                      :id="`ext-input-issabel`"
                      v-model="extensionDraft.issabel"
                      @blur="commitExtension('issabel', $event)"
                      @keydown="onExtensionKey('issabel', $event)"
                      maxlength="6"
                      placeholder="4103"
                      class="w-24 h-8 px-2.5 text-sm font-mono tabular-nums bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[color:var(--ds-focus)] focus:ring-2 focus:ring-[color:var(--ds-focus-ring)]"
                    />
                    <button
                      v-else
                      type="button"
                      @click="startEditExtension('issabel')"
                      :disabled="!access.telefonia.issabel.activo"
                      class="h-8 px-2.5 text-sm font-mono tabular-nums rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-primary)]"
                      :class="access.telefonia.issabel.activo
                        ? 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 cursor-text'
                        : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'"
                    >
                      {{ access.telefonia.issabel.extension || '—' }}
                    </button>
                    <span
                      v-if="editState.issabel"
                      class="text-[11px] text-slate-400"
                    >Enter ↵ para guardar · Esc para cancelar</span>
                  </div>
                </div>
              </div>
            </section>

            <div class="border-t border-slate-100" />

            <!-- SISTEMAS CORE -->
            <section class="px-6 py-5">
              <h3 class="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-3">
                Sistemas core
              </h3>
              <div class="space-y-4">
                <ToggleSwitch
                  :modelValue="access.sistemas.sia.activo"
                  label="SIA"
                  description="Sistema de Información Aseguradora"
                  @update:modelValue="toggle('sia', $event)"
                />
                <ToggleSwitch
                  :modelValue="access.sistemas.eva.activo"
                  label="EVA / Herramientas Administrativas"
                  description="Plataforma de back-office y reportería"
                  @update:modelValue="toggle('eva', $event)"
                />
              </div>
            </section>

            <div class="h-6" />
          </div>

          <!-- Footer -->
          <footer class="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <button
              type="button"
              @click="close"
              class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ds-primary)] focus-visible:ring-offset-2"
            >
              Cerrar
            </button>
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.28s ease;
}
.drawer-enter-active > aside,
.drawer-leave-active > aside {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from > aside,
.drawer-leave-to > aside {
  transform: translateX(100%);
}
</style>
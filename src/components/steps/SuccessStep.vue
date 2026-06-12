<template>
  <div class="w-full max-w-2xl mx-auto overflow-hidden border border-slate-100 mt-6">
    <div class="bg-[#0B1A3D] p-8 text-center border-b-4 border-yellow-400 relative overflow-hidden">
      <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#00D1FF 1px, transparent 1px); background-size: 20px 20px;"></div>
      <div class="relative z-10 flex flex-col items-center">
        <div class="bg-yellow-400 text-[#0B1A3D] rounded-full p-4 mb-5 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-black text-white tracking-tight mb-2">¡TU VIAJE ESTÁ PROTEGIDO!</h1>
        <p class="text-cyan-100 font-medium text-sm">Tu asistencia está activa. Disfruta tu aventura con tranquilidad.</p>
      </div>
    </div>

    <div class="bg-slate-50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-dashed border-slate-300">
      <div class="text-center sm:text-left">
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Código de Voucher</p>
        <span class="text-2xl sm:text-3xl font-black text-[#0B1A3D] font-mono tracking-wider">CA-B4ZADX-US</span>
      </div>
      <div class="hidden sm:block text-slate-200">
        <svg class="h-16 w-32" fill="currentColor" viewBox="0 0 100 40"><path d="M0 0h4v40H0zM6 0h2v40H6zM10 0h8v40h-8zM20 0h2v40h-2zM24 0h6v40h-6zM32 0h4v40h-4zM38 0h2v40h-2zM42 0h8v40h-8zM52 0h2v40h-2zM56 0h6v40h-6zM64 0h4v40h-4zM70 0h2v40h-2zM74 0h8v40h-8zM84 0h2v40h-2zM88 0h6v40h-6zM96 0h4v40h-4z"/></svg>
      </div>
    </div>

    <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50">
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 class="text-xs font-bold text-[#00D1FF] uppercase tracking-wider mb-5">Destino</h3>
        <p class="font-semibold text-slate-800 text-lg">{{ formatDestination(formData?.destination) }}</p>
        <div class="mt-5 pt-5 border-t border-slate-100">
          <h3 class="text-xs font-bold text-[#00D1FF] uppercase tracking-wider mb-2">Fechas</h3>
          <p class="font-semibold text-slate-800">{{ formatDateSafe(formData?.dates?.start) }} al {{ formatDateSafe(formData?.dates?.end) }}</p>
        </div>
        <div class="mt-5 pt-5 border-t border-slate-100">
          <h3 class="text-xs font-bold text-[#00D1FF] uppercase tracking-wider mb-2">Viajeros</h3>
          <p class="font-semibold text-slate-800">{{ travelerCount() }} viajero{{ travelerCount() > 1 ? 's' : '' }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <h3 class="text-xs font-bold text-[#00D1FF] uppercase tracking-wider mb-2">Plan</h3>
          <p class="text-2xl font-black text-slate-800 mb-1 capitalize">{{ selectedPlan?.name || 'Plan Seleccionado' }}</p>
          <p class="text-sm text-slate-500">Asistencia internacional completa</p>
        </div>
        <div class="bg-[#0B1A3D] rounded-xl p-5 text-center shadow-inner mt-6">
          <p class="text-[10px] text-[#00D1FF] font-bold tracking-wider uppercase mb-1">Total Pagado</p>
          <p class="text-4xl font-black text-white">${{ selectedPlan?.price || '0' }} <span class="text-lg font-medium text-slate-400">USD</span></p>
        </div>
      </div>
    </div>

    <div class="p-6 sm:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-4">
      <button class="w-full sm:w-1/2 bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
        Descargar PDF
      </button>
      <button @click="$emit('restart-flow')" class="w-full sm:w-1/2 bg-yellow-400 text-slate-900 font-extrabold py-4 rounded-xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 shadow-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        Regresar al inicio
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  formData: { type: Object, default: () => ({}) },
  selectedPlan: { type: Object, default: () => ({}) }
})
defineEmits(['restart-flow'])

function formatDestination(dest) {
  if (!dest) return 'Internacional'
  if (Array.isArray(dest)) {
    return dest.map(d => d.name || d).join(', ')
  }
  if (typeof dest === 'object' && dest.name) return dest.name
  return String(dest)
}

function formatDateSafe(dateVal) {
  if (!dateVal) return '--'
  try {
    const [y, m, d] = dateVal.split('-').map(Number)
    if (!y || !m || !d) return '--'
    const date = new Date(y, m - 1, d)
    if (isNaN(date.getTime())) return '--'
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '--'
  }
}

function travelerCount() {
  const ages = props.formData?.travelerAges
  if (ages && ages.length > 0) return ages.length
  const counts = { solo: 1, pareja: 2, familia: 4, grupo: 6 }
  return counts[props.formData?.travelers] || 1
}
</script>

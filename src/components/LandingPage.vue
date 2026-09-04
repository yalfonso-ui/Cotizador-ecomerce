<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppSpinner from './ui/AppSpinner.vue'

const emit = defineEmits(['start'])

// Estado de loading para la micro-interacción fintech.
// Cuando el usuario hace click en "Cotizar tu viaje" / "Cotizar ahora":
// 1) El hero se desvanece (opacity 0.3)
// 2) Aparece el spinner overlay con copy "Calculando..."
// 3) Después de 1500ms se emite @start → TravelWizard navega al step 0
const isLoading = ref(false)
let loadingTimeout = null

function handleStart() {
  if (isLoading.value) return
  isLoading.value = true

  // Respeta prefers-reduced-motion: skip del spinner y emit directo.
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    emit('start')
    return
  }

  loadingTimeout = setTimeout(() => {
    emit('start')
  }, 1500)
}

onBeforeUnmount(() => {
  if (loadingTimeout) clearTimeout(loadingTimeout)
  if (observer) observer.disconnect()
})

// Datos de las tarjetas de planes (Revolut-style con etiqueta, monto y tarjeta flotante interna).
const benefits = [
  {
    id: 'family',
    title: 'Viajes en familia',
    tag: 'Plan Essencial',
    description: 'Cobertura esencial para los más pequeños, asistencia médica y equipaje protegido.',
    coverage: '$15.000 USD',
    priceFrom: 45,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=600&fit=crop&q=80',
    active: true,
    glass: false
  },
  {
    id: 'frequent',
    title: 'Nómadas / Viajeros Frecuentes',
    tag: 'Más popular',
    description: 'Ideal para estancias largas, asistencia médica 24/7 y cobertura global.',
    coverage: '$50.000 USD',
    priceFrom: 60,
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&h=600&fit=crop&q=80',
    active: true,
    glass: true
  },
  {
    id: 'extreme',
    title: 'Deportes extremos y esquí',
    tag: 'Aventura',
    description: 'Cobertura ampliada para nieve, montaña y actividades de alto riesgo.',
    coverage: '$100.000 USD',
    priceFrom: 90,
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=900&h=600&fit=crop&q=80',
    active: true,
    glass: false
  }
]

/*
 * Animación de entrada de tarjetas de planes (IntersectionObserver).
 * - Cuando la sección entra al viewport, agregamos la clase
 *   `section-visible` al contenedor padre. Los estilos CSS
 *   (`.section-visible .animate-slide-up`) activan la animación
 *   `slide-up` con retraso por índice inline (`index * 150ms`).
 * - Respeta prefers-reduced-motion: si el usuario lo prefiere,
 *   la clase se aplica inmediatamente y las tarjetas se ven
 *   estáticas (opacity: 1 por defecto).
 */
const benefitsSection = ref(null)
const isSectionVisible = ref(false)
let observer = null

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function setupObserver() {
  // Si el usuario prefiere reducir movimiento, mostramos todo sin animar.
  if (prefersReducedMotion()) {
    isSectionVisible.value = true
    return
  }

  if (typeof IntersectionObserver === 'undefined' || !benefitsSection.value) {
    // Fallback: si el navegador no soporta IntersectionObserver,
    // mostramos todo inmediatamente.
    isSectionVisible.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          isSectionVisible.value = true
          observer.disconnect()
          break
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  )

  observer.observe(benefitsSection.value)
}

/*
 * Estado de animación de entrada del Hero.
 * Se activa en onMounted (después de un frame) para que el navegador
 * pinte el estado inicial (opacity:0, translateY:20) antes del keyframe.
 * Las animaciones se disparan vía clases CSS (.hero-fade-{element})
 * con delays escalonados (título → descripción → CTA → tarjeta fintech).
 */
const isHeroVisible = ref(false)

/*
 * Parallax de la imagen de fondo del Hero.
 * Calcula el offset vertical según el scroll del usuario.
 * Usa rAF para fluidez y `passive: true` para no bloquear el scroll.
 */
const heroImageOffset = ref(0)
let scrollRAF = null

function onScroll() {
  if (scrollRAF) return
  scrollRAF = requestAnimationFrame(() => {
    heroImageOffset.value = window.scrollY * 0.15
    scrollRAF = null
  })
}

onMounted(() => {
  setupObserver()

  // Dispara la animación de entrada del Hero después de un frame.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isHeroVisible.value = true
    })
  })

  // Parallax solo si el usuario no prefiere reducir movimiento.
  if (!prefersReducedMotion()) {
    window.addEventListener('scroll', onScroll, { passive: true })
  }
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  if (loadingTimeout) clearTimeout(loadingTimeout)
  if (scrollRAF) cancelAnimationFrame(scrollRAF)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background-color: #0F2B55;">
    <!-- ════════════════════ HEADER ════════════════════ -->
    <header
      class="sticky top-0 z-40 backdrop-blur-md border-b border-white/10"
      style="background-color: rgba(15, 43, 85, 0.92);"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2.5 shrink-0">
          <span
            class="w-8 h-8 rounded-full flex items-center justify-center font-black text-base"
            style="background-color: #43D3FF; color: #00184C;"
          >
            C
          </span>
          <span class="font-bold text-base hidden sm:inline">
            <span class="text-white">Continental</span>
            <span style="color: #43D3FF;">&nbsp;Assist</span>
          </span>
        </a>

        <!-- Nav desktop -->
        <nav class="hidden md:flex items-center gap-7 text-sm font-medium">
          <a href="#asistencia" class="text-white/90 hover:text-white transition-colors">Asistencia</a>
          <a href="#beneficios" class="text-white/90 hover:text-white transition-colors">Destinos</a>
          <a href="#empresas" class="text-white/90 hover:text-white transition-colors">Empresas</a>
          <a href="#ayuda" class="text-white/90 hover:text-white transition-colors">Ayuda 24/7</a>
        </nav>

        <!-- Botones de acción -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            class="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white border border-white/25 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#43D3FF]"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            @click="handleStart"
            :disabled="isLoading"
            class="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 text-sm font-bold rounded-full transition-all hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-80 disabled:cursor-wait"
            style="background-color: #FDB714; color: #00184C;"
          >
            <span>Cotizar tu viaje</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 transform rotate-45">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- ════════════════════ HERO (dividido) ════════════════════ -->
    <section id="asistencia" class="relative overflow-hidden">
      <!-- Background decorations -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-5 blur-3xl" style="background-color: #43D3FF;"></div>
        <div class="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-5 blur-3xl" style="background-color: #FDB714;"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <!-- Lado izquierdo: texto -->
        <div
          class="lg:col-span-7 flex flex-col transition-opacity duration-500 ease-out"
          :class="isLoading ? 'opacity-30' : 'opacity-100'"
        >
          <div
            class="hero-fade hero-fade-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border"
            style="background-color: rgba(67, 211, 255, 0.10); border-color: rgba(67, 211, 255, 0.30);"
          >
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: #43D3FF;"></span>
              <span class="relative inline-flex rounded-full h-2 w-2" style="background-color: #43D3FF;"></span>
            </span>
            <span class="text-xs font-semibold tracking-wide" style="color: #43D3FF;">
              Cobertura en +190 países
            </span>
          </div>

          <h1
            class="hero-fade hero-fade-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
            :class="{ 'hero-visible': isHeroVisible }"
          >
            Asistencia total.<br />
            <span style="color: #43D3FF;">Estés donde estés.</span>
          </h1>

          <p
            class="hero-fade hero-fade-desc text-lg text-white/85 leading-relaxed mb-8 max-w-lg"
            :class="{ 'hero-visible': isHeroVisible }"
          >
            Viaja tranquilo. Pase lo que pase, te acompañamos.
          </p>

          <div
            class="hero-fade hero-fade-cta flex flex-wrap items-center gap-4"
            :class="{ 'hero-visible': isHeroVisible }"
          >
            <button
              type="button"
              @click="handleStart"
              :disabled="isLoading"
              class="inline-flex items-center gap-2.5 px-7 py-3.5 text-base font-bold rounded-full transition-all hover:-translate-y-0.5 hover:brightness-95 hover:shadow-2xl active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-80 disabled:cursor-wait"
              style="background-color: #FDB714; color: #00184C; box-shadow: 0 8px 24px rgba(253, 183, 20, 0.25);"
            >
              <span>Cotizar ahora</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 transform rotate-45">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </button>
            <a
              href="#beneficios"
              class="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-white/85 hover:text-white transition-colors"
            >
              Ver beneficios
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          <!-- Trust badges -->
          <div
            class="hero-fade hero-fade-trust flex flex-wrap items-center gap-x-6 gap-y-3 mt-10 pt-8 border-t border-white/10"
            :class="{ 'hero-visible': isHeroVisible }"
          >
            <div class="flex items-center gap-2 text-white/70">
              <svg class="w-4 h-4" style="color: #43D3FF;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span class="text-xs font-medium">Aseguradora certificada</span>
            </div>
            <div class="flex items-center gap-2 text-white/70">
              <svg class="w-4 h-4" style="color: #43D3FF;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span class="text-xs font-medium">4.9/5 calificación</span>
            </div>
            <div class="flex items-center gap-2 text-white/70">
              <svg class="w-4 h-4" style="color: #43D3FF;" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="text-xs font-medium">+500 mil viajeros</span>
            </div>
          </div>
        </div>

        <!-- Lado derecho: imagen + mockup fintech superpuesto -->
        <div
          class="hero-fade hero-fade-image lg:col-span-5 relative"
          :class="{ 'hero-visible': isHeroVisible }"
        >
          <div
            class="hero-image-scale relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
            :style="{ transform: `translate3d(0, ${heroImageOffset}px, 0)` }"
          >
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=1200&fit=crop&q=80"
              alt="Persona viajera contemplando el horizonte"
              class="w-full h-full object-cover will-change-transform"
              loading="eager"
            />
            <div
              class="absolute inset-0"
              style="background: linear-gradient(180deg, rgba(15,43,85,0) 0%, rgba(15,43,85,0.4) 100%);"
            ></div>

            <!-- Mockup fintech flotante: posicionamiento absoluto estricto -->
            <div class="absolute bottom-6 right-6 w-80 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl">
              <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                      style="background-color: rgba(67, 211, 255, 0.18); color: #00184C;"
                    >
                      C
                    </span>
                    <span class="text-xs font-bold text-slate-900">Póliza activa</span>
                  </div>
                  <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Activa
                  </span>
                </div>
                <div class="flex items-baseline justify-between mb-3">
                  <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cobertura disponible</p>
                    <p class="text-2xl font-black text-slate-900 tabular-nums mt-0.5">
                      $50.000 <span class="text-xs font-medium text-slate-400">USD</span>
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</p>
                    <p class="text-sm font-bold text-slate-900 mt-0.5">Explorer</p>
                  </div>
                </div>
                <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div class="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Próximo viaje: 16 Ago</span>
                  </div>
                  <button class="text-[10px] font-bold" style="color: #00184C;">Ver detalle →</button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading overlay: spinner overlay con copy explicativo (usa AppSpinner reutilizado) -->
      <Transition name="loading-fade">
        <div
          v-if="isLoading"
          class="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
        >
          <div
            class="flex flex-col items-center gap-4 px-6 py-5 rounded-2xl backdrop-blur-md"
            style="background-color: rgba(15, 43, 85, 0.65);"
          >
            <AppSpinner size="2xl" class="text-white" />
            <p class="text-white text-sm md:text-base font-semibold tracking-wide text-center">
              Calculando la mejor cobertura para ti...
            </p>
          </div>
        </div>
      </Transition>
    </section>

    <!-- ════════════════════ SECCIÓN DE BENEFICIOS (Revolut-style) ════════════════════ -->
    <section
      id="beneficios"
      ref="benefitsSection"
      class="py-16 sm:py-20"
      :class="{ 'section-visible': isSectionVisible }"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-xs font-bold uppercase tracking-[0.2em]" style="color: #43D3FF;">
            Planes
          </span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white mt-3 leading-tight">
            Un nuevo mundo de opciones<br class="hidden sm:block" />
            <span style="color: #43D3FF;">para tu viaje</span>
          </h2>
          <p class="text-base text-white/75 mt-4 leading-relaxed">
            Encuentra el plan que se adapta a tu próximo destino.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article
            v-for="(benefit, index) in benefits"
            :key="benefit.id"
            class="animate-slide-up group relative rounded-2xl bg-white overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
            :style="{ animationDelay: `${index * 150}ms` }"
          >
            <!-- Imagen de fondo con etiqueta + tarjeta flotante interna -->
            <div class="relative h-56 overflow-hidden">
              <img
                :src="benefit.image"
                :alt="benefit.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div
                class="absolute inset-0"
                style="background: linear-gradient(180deg, rgba(15,43,85,0) 40%, rgba(15,43,85,0.85) 100%);"
              ></div>

              <!-- Etiqueta del plan (Esquina superior izquierda) -->
              <span
                class="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                :class="benefit.tag === 'Más popular'
                  ? 'bg-[#FFD13B] text-[#00184C]'
                  : 'bg-white/95 text-[#00184C]'"
              >
                {{ benefit.tag }}
              </span>

              <!-- Tarjeta flotante interna (estado + precio base) -->
              <div
                class="absolute bottom-4 left-4 right-4 rounded-xl p-3 transition-transform duration-300 group-hover:scale-105"
                :class="benefit.glass
                  ? 'backdrop-blur-md bg-white/20 border border-white/30 text-white shadow-xl'
                  : 'bg-white shadow-xl border border-slate-100 text-slate-900'"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="benefit.glass ? 'bg-[#FFD13B]' : 'bg-emerald-500'"
                    ></span>
                    <span
                      class="text-[10px] font-bold uppercase tracking-wider"
                      :class="benefit.glass ? 'text-white/80' : 'text-slate-500'"
                    >
                      Activo
                    </span>
                  </div>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider"
                    :class="benefit.glass ? 'text-white/80' : 'text-slate-500'"
                  >
                    Desde
                  </span>
                </div>
                <div class="mt-1.5 flex items-baseline justify-between gap-2">
                  <span
                    class="text-xs font-semibold truncate"
                    :class="benefit.glass ? 'text-white' : 'text-slate-900'"
                  >
                    Cobertura {{ benefit.coverage }}
                  </span>
                  <span
                    class="font-extrabold text-base tabular-nums shrink-0"
                    style="color: #FFD13B;"
                  >
                    ${{ benefit.priceFrom }}<span
                      class="text-[10px] font-medium ml-0.5"
                      :class="benefit.glass ? 'text-white/70' : 'text-slate-500'"
                    >USD</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Contenido inferior -->
            <div class="p-5 flex-1 flex flex-col">
              <h3 class="text-base font-extrabold text-slate-900 leading-tight">
                {{ benefit.title }}
              </h3>
              <p class="text-xs text-slate-500 mt-2 leading-relaxed flex-1">
                {{ benefit.description }}
              </p>

              <!-- Botón circular "Elegir" al final -->
              <div class="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  @click="handleStart"
                  :disabled="isLoading"
                  class="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD13B] focus-visible:ring-offset-2 disabled:opacity-80"
                  style="background-color: #FFD13B; color: #00184C;"
                  :aria-label="`Elegir ${benefit.title}`"
                >
                  <span>Elegir</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 transform rotate-45">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="text-xs font-semibold text-slate-500 hover:text-[#00184C] transition-colors"
                >
                  Ver detalle →
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- Botón central: Ver todos los planes -->
        <div class="text-center mt-12">
          <button
            type="button"
            @click="handleStart"
            :disabled="isLoading"
            class="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-80 disabled:cursor-wait"
            style="background-color: #FFD13B; color: #00184C;"
          >
            <span>Ver todos los planes</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ════════════════════ FOOTER ════════════════════ -->
    <footer id="ayuda" class="mt-auto border-t border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <!-- Columna izquierda: logo + tagline -->
          <div>
            <a href="/" class="flex items-center gap-2.5">
              <span
                class="w-8 h-8 rounded-full flex items-center justify-center font-black text-base"
                style="background-color: #43D3FF; color: #00184C;"
              >
                C
              </span>
              <span class="font-bold text-base">
                <span class="text-white">Continental</span>
                <span style="color: #43D3FF;">&nbsp;Assist</span>
              </span>
            </a>
            <p class="text-sm text-white/70 mt-4 leading-relaxed max-w-xs">
              Asistencia al viajero internacional con cobertura en +190 países. Contigo donde vayas.
            </p>
          </div>

          <!-- Columna central: enlaces -->
          <nav class="md:justify-self-center">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-3">Legal</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="text-white/70 hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" class="text-white/70 hover:text-white transition-colors">Política de privacidad</a></li>
              <li><a href="#" class="text-white/70 hover:text-white transition-colors">Preguntas frecuentes</a></li>
              <li><a href="#" class="text-white/70 hover:text-white transition-colors">Contáctanos</a></li>
            </ul>
          </nav>

          <!-- Columna derecha: redes + tagline -->
          <div class="md:justify-self-end">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-3">Síguenos</h4>
            <div class="flex items-center gap-3">
              <a href="#" aria-label="Instagram" class="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 01-1.38-.9 3.72 3.72 0 01-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 00-2.13 1.38A5.9 5.9 0 00.63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.73 1.46 1.38 2.13a5.9 5.9 0 002.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 002.13-1.38 5.9 5.9 0 001.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 00-1.38-2.13A5.9 5.9 0 0019.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook" class="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.68 0H1.32C.59 0 0 .59 0 1.32v21.36C0 23.41.59 24 1.32 24h11.5v-9.3H9.69v-3.62h3.13V8.41c0-3.1 1.89-4.79 4.66-4.79 1.32 0 2.46.1 2.79.14v3.24l-1.92.001c-1.5 0-1.79.71-1.79 1.76v2.31h3.59l-.47 3.62h-3.12V24h6.13c.73 0 1.32-.59 1.32-1.32V1.32C24 .59 23.41 0 22.68 0z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" class="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 11-.001-4.12A2.06 2.06 0 015.34 7.43zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
                </svg>
              </a>
            </div>
            <p class="text-sm font-bold text-white mt-4">Contigo, globalmente.</p>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-white/10 text-center">
          <p class="text-xs text-white/50">© 2026 Continental Assist. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.4s ease;
}
.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

/*
 * Hero: micro-animaciones de entrada premium.
 * Cada elemento (pill → title → desc → cta → image → trust)
 * inicia invisible y aparece con fade + slide-up al activarse
 * la clase .hero-visible en el contenedor padre.
 * Duración 600–900ms, easing ease-out, delays escalonados sutiles.
 */

.hero-fade {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 700ms ease-out,
    transform 700ms ease-out;
  will-change: opacity, transform;
}

.hero-fade.hero-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Delays escalonados por elemento (todo sutil, no llamativo) */
.hero-fade-pill   { transition-delay: 0ms;   transition-duration: 600ms; }
.hero-fade-title  { transition-delay: 80ms;  transition-duration: 750ms; }
.hero-fade-desc   { transition-delay: 200ms; transition-duration: 700ms; }
.hero-fade-cta    { transition-delay: 320ms; transition-duration: 700ms; }
.hero-fade-trust  { transition-delay: 440ms; transition-duration: 700ms; }
.hero-fade-image  { transition-delay: 120ms; transition-duration: 900ms; }

/*
 * Scale muy leve continuo en la imagen de fondo del Hero.
 * Loop infinito muy sutil (1.0 → 1.03 → 1.0) en 12s.
 */
@keyframes hero-bg-breathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.03); }
}

.hero-image-scale img {
  animation: hero-bg-breathe 12s ease-in-out infinite;
}

/*
 * Animación de entrada simple para tarjetas de planes.
 * - Clase `.animate-slide-up` con retraso por índice en línea
 *   (`:style="{ animationDelay: `${index * 150}ms` }"`).
 * - `opacity: 1` por defecto: si el usuario tiene desactivadas las
 *   animaciones (prefers-reduced-motion), las tarjetas se ven sin animar.
 * - La animación solo corre cuando la sección entra al viewport
 *   (clase `section-visible` activada por IntersectionObserver).
 */

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  opacity: 1;
  animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-play-state: paused;
}

.section-visible .animate-slide-up {
  animation-play-state: running;
}

/* Accesibilidad: respeta prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .hero-fade,
  .animate-slide-up {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    animation: none !important;
  }
  .hero-image-scale img {
    animation: none !important;
  }
  .transition-opacity,
  .duration-500,
  .group-hover\:scale-110,
  .hover\:-translate-y-1,
  .hover\:-translate-y-2 {
    transition: none !important;
    transform: none !important;
  }
}
</style>

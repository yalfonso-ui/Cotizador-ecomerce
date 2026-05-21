<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import AppBadge from '@/components/AppBadge.vue'
import AppCard from '@/components/AppCard.vue'
import AppButton from '@/components/AppButton.vue'

const router = useRouter()
const showUrgencyBanner = ref(true)

const destinations = [
  { name: 'Europa', image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&h=400&fit=crop', price: 'Desde $25', tag: 'Popular' },
  { name: 'Caribe', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop', price: 'Desde $20', tag: 'Playa' },
  { name: 'Estados Unidos', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=400&fit=crop', price: 'Desde $30', tag: 'Urbano' },
  { name: 'Asia', image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&h=400&fit=crop', price: 'Desde $35', tag: 'Exótico' }
]

const testimonials = [
  {
    name: 'María González',
    location: 'Buenos Aires, Argentina',
    text: 'Mi viaje a Europa fue interrumpido por una emergencia médica. Continental Assist cubrió todo.',
    rating: 5,
    plan: 'Plan Explorer',
    image: 'https://images.unsplash.com/photo-1524634122224-8d91f3d1f14a?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Carlos Mendoza',
    location: 'Ciudad de México, México',
    text: 'Perdí mi equipaje en el vuelo a Nueva York. En menos de 24 horas tenía mi reembolso.',
    rating: 5,
    plan: 'Plan Premium',
    image: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=100&h=100&fit=crop&crop=face'
  },
  {
    name: 'Ana Rodríguez',
    location: 'Bogotá, Colombia',
    text: 'La cobertura por COVID me salvó cuando tuve que cancelar mi viaje. Me reembolsaron el 100%.',
    rating: 5,
    plan: 'Plan Essential',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25528?w=100&h=100&fit=crop&crop=face'
  }
]

const trustIndicators = [
  { icon: 'shield-check', label: 'Aseguradora' },
  { icon: 'clock', label: '24/7' },
  { icon: 'users', label: '+500K' },
  { icon: 'star', label: '4.9/5' }
]

const coverage = [
  { icon: 'heart-pulse', title: 'Emergencias Médicas', desc: 'Hasta $50,000 USD', color: 'secondary', free: true },
  { icon: 'plane', title: 'Asistencia de Viaje', desc: 'Repatriación y vuelos', color: 'secondary', free: true },
  { icon: 'luggage', title: 'Equipaje', desc: 'Búsqueda y compensación', color: 'accent', free: true },
  { icon: 'scale', title: 'Asistencia Legal', desc: 'Apoyo legal abroad', color: 'primary', free: true }
]

const stats = [
  { value: '20+', label: 'Años' },
  { value: '500K+', label: 'Viajeros' },
  { value: '190+', label: 'Países' }
]

const freeInclusions = [
  { icon: 'phone', text: 'Teleconsulta 24/7' },
  { icon: 'alert-circle', text: 'Emergencias sin límite' },
  { icon: 'headphones', text: 'Soporte en español' }
]

const paymentBadges = [
  { icon: 'lock', text: 'SSL Seguro' },
  { icon: 'credit-card', text: 'Visa / MC / Amex' },
  { icon: 'shield', text: 'Datos protegidos' }
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- URGENCY BANNER -->
    <div v-if="showUrgencyBanner" class="w-full bg-accent/10 border-b border-accent/20 py-2">
      <div class="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 text-sm">
        <AppIcon name="clock" :size="14" class="text-accent animate-pulse" />
        <span class="text-primary font-medium">Oferta limitada:</span>
        <span class="text-gray-600">20% OFF en tu primera asistencia —</span>
        <span class="text-accent font-bold">Válido solo hoy</span>
        <button @click="showUrgencyBanner = false" class="ml-2 text-gray-400 hover:text-gray-600">
          <AppIcon name="x" :size="14" />
        </button>
      </div>
    </div>

    <!-- HERO SECTION -->
    <section class="w-full relative min-h-[520px] flex items-center overflow-hidden bg-[#00184C]">
      <div class="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&h=1080&fit=crop" alt="Viajero" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-[#00184C]/60"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-[#00184C]/90 via-transparent to-transparent"></div>
      </div>
      
      <div class="relative z-10 w-full py-12 md:py-16 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <div class="max-w-2xl">
            <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span class="text-xs text-white/90 font-medium">Potenciado con IA</span>
            </div>

            <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-4 leading-[1.15]">
              Viaja con <span class="text-accent">confianza</span>, vuelve con <span class="text-secondary">historias</span>
            </h1>

            <p class="text-base md:text-lg text-white/80 mb-3 max-w-lg">
              <strong class="text-accent">¿Sabías que una emergencia médica en EE.UU. puede costar más de $50,000?</strong>
            </p>
            <p class="text-base md:text-lg text-gray-200 mb-6 max-w-lg">
              Protege tu aventura desde solo <strong class="text-accent">$25 USD</strong> — menos que tu café diario.
            </p>

            <div class="flex flex-col sm:flex-row gap-3 mb-8">
              <AppButton to="/cotizacion" variant="accent" size="lg">
                <AppIcon name="zap" :size="16" />
                ¡Comenzar ahora! →
              </AppButton>
              <AppButton href="#como-funciona" variant="outline" size="lg" class="!border-white !text-white hover:!bg-white/10">
                <AppIcon name="play-circle" :size="16" />
                ¿Cómo funciona?
              </AppButton>
            </div>

            <div class="space-y-3">
              <div class="flex flex-wrap gap-4 md:gap-6">
                <div v-for="indicator in trustIndicators" :key="indicator.label" class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <AppIcon :name="indicator.icon" :size="16" class="text-white" />
                  </div>
                  <span class="text-sm text-white/90 font-medium">{{ indicator.label }}</span>
                </div>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-2">
                <div v-for="badge in paymentBadges" :key="badge.text" class="flex items-center gap-1.5 text-white/80 text-xs">
                  <AppIcon :name="badge.icon" :size="12" />
                  <span>{{ badge.text }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile: Hide decorative right side on small screens -->
          <div class="hidden lg:flex justify-end">
            <!-- Decorative card could go here -->
          </div>
        </div>
      </div>
    </section>

    <!-- STATS SECTION -->
    <section class="w-full py-6 bg-white -mt-1">
      <div class="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div class="max-w-7xl mx-auto grid grid-cols-3 gap-2 max-w-xl mx-auto text-center">
          <div v-for="stat in stats" :key="stat.label" class="py-2">
            <div class="text-2xl md:text-3xl font-bold text-primary">{{ stat.value }}</div>
            <div class="text-xs text-gray-500">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- DESTINATIONS -->
    <section id="cotizador" class="w-full py-10 bg-gray-50/50">
      <div class="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <AppBadge variant="secondary" class="mb-2">Destinos</AppBadge>
              <h2 class="text-2xl md:text-3xl font-semibold text-primary">
                Tu próximo destino <span class="font-accent text-accent">te espera</span>
              </h2>
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <RouterLink 
              v-for="dest in destinations"
              :key="dest.name"
              to="/cotizacion"
              class="group relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer h-48 block"
            >
              <img :src="dest.image" :alt="dest.name" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
              <div class="absolute top-2 left-2">
                <span class="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-semibold text-primary">
                  {{ dest.tag }}
                </span>
              </div>
              <div class="absolute bottom-0 left-0 right-0 p-3">
                <h3 class="text-sm font-semibold text-white mb-0.5">{{ dest.name }}</h3>
                <p class="text-white/80 text-xs">{{ dest.price }}</p>
              </div>
              <div class="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <AppIcon name="arrow-up-right" :size="14" class="text-primary" />
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- COVERAGE SECTION -->
    <section class="w-full py-10 bg-gradient-to-br from-primary-50 to-secondary-50/30">
      <div class="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <AppBadge variant="secondary" class="mb-3">Coberturas</AppBadge>
            <h2 class="text-2xl md:text-3xl font-semibold text-primary mb-5">
              Tranquilidad para cada <span class="font-accent text-accent">aventura</span>
            </h2>

            <div class="space-y-3">
              <div v-for="item in coverage" :key="item.title" class="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  item.color === 'secondary' && 'bg-secondary/10',
                  item.color === 'accent' && 'bg-accent/10',
                  item.color === 'primary' && 'bg-primary/10'
                ]">
                  <AppIcon :name="item.icon" :size="18" :class="[
                    item.color === 'secondary' && 'text-secondary',
                    item.color === 'accent' && 'text-accent',
                    item.color === 'primary' && 'text-primary'
                  ]" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="font-semibold text-primary text-sm">{{ item.title }}</h4>
                    <span v-if="item.free" class="px-1.5 py-0.5 bg-secondary/10 text-secondary text-[10px] font-medium rounded">GRATIS</span>
                  </div>
                  <p class="text-xs text-gray-500">{{ item.desc }}</p>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3 mt-5">
              <span v-for="incl in freeInclusions" :key="incl.text" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs text-gray-600 shadow-sm">
                <AppIcon :name="incl.icon" :size="14" class="text-secondary" />
                {{ incl.text }}
              </span>
            </div>
          </div>

          <div class="relative">
            <AppCard variant="elevated" class="p-5 relative overflow-visible">
              <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                <span class="px-3 py-1 bg-accent text-primary text-xs font-semibold rounded-full shadow">
                  Más popular
                </span>
              </div>

              <div class="text-center pt-3 mb-4">
                <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <AppIcon name="sparkles" :size="22" class="text-white" />
                </div>
                <h3 class="text-lg font-bold text-primary mb-0.5">Plan Explorer</h3>
                <p class="text-gray-500 text-xs">Cobertura completa</p>
              </div>

              <div class="text-center mb-4">
                <span class="text-4xl font-bold text-primary">$40</span>
                <span class="text-gray-500 text-xs ml-1">USD / viaje</span>
              </div>

              <ul class="space-y-2 mb-4">
                <li v-for="feature in ['Cobertura médica $50,000 USD', 'Cancelación de viaje', 'Equipaje protegido', 'COVID-19 incluido', 'Asistencia 24/7']" :key="feature" class="flex items-center gap-2">
                  <div class="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <AppIcon name="check" :size="10" class="text-secondary" />
                  </div>
                  <span class="text-gray-600 text-xs">{{ feature }}</span>
                </li>
              </ul>

              <AppButton to="/cotizacion" variant="accent" size="md" class="w-full">
                Elegir este plan
              </AppButton>
            </AppCard>

            <div class="absolute -z-10 top-6 right-6 w-full h-full bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS -->
    <section class="w-full py-8 bg-primary">
      <div class="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          <div class="flex items-center gap-1">
            <AppIcon v-for="n in 5" :key="n" name="star" :size="18" class="text-accent fill-accent" />
            <span class="text-white/70 text-sm ml-2">4.9/5 de +500K viajeros</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex -space-x-2">
              <img v-for="t in testimonials.slice(0,3)" :key="t.name" :src="t.image" :alt="t.name" class="w-8 h-8 rounded-full border-2 border-white/50 object-cover" />
            </div>
            <p class="text-white/80 text-xs max-w-xs">"La cobertura COVID me salvó cuando cancelé mi viaje. 100% reembolso." <strong>— Ana R.</strong></p>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section id="como-funciona" class="w-full py-12 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/5 to-transparent pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

      <div class="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div class="max-w-7xl mx-auto max-w-xl mx-auto text-center">
          <div class="w-14 h-14 mx-auto mb-5 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
            <AppIcon name="heart-handshake" :size="28" class="text-secondary" />
          </div>

          <h2 class="text-2xl md:text-3xl font-semibold text-primary mb-2">
            ¿<span class="font-accent text-accent">Listo</span> para tu próxima aventura?
          </h2>
          <p class="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            Cotiza tu asistencia en menos de 1 minuto con nuestro asistente inteligente.
          </p>

          <div class="flex flex-col sm:flex-row gap-2.5 justify-center">
            <AppButton to="/cotizacion" variant="accent" size="md">
              <AppIcon name="zap" :size="14" />
              Cotizar ahora
            </AppButton>
          </div>

          <div class="flex items-center justify-center gap-4 mt-5 text-xs text-gray-400">
            <div class="flex items-center gap-1.5">
              <AppIcon name="lock" :size="12" />
              <span>Datos protegidos</span>
            </div>
            <div class="flex items-center gap-1.5">
              <AppIcon name="x-circle" :size="12" />
              <span>Cancelación gratis</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
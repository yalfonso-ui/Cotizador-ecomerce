<!--
  ============================================================
  COMPONENT EXAMPLES — Sistema de Diseño E-commerce
  ============================================================
  8 componentes completos usando Vue 3 + @vueuse/motion
  para animaciones declarativas.
  ============================================================
-->
<script setup>
import { ref } from 'vue'
import { useMotion } from '@vueuse/motion'

// ============================================================
// 1. HERO SECTION
// ============================================================
const heroRef = ref(null)
const heroMotion = useMotion(heroRef, {
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 800, ease: [0.16, 1, 0.3, 1] } }
})

// Stats para el hero
const stats = [
  { value: '12,000+', label: 'Clientes satisfechos' },
  { value: '50+', label: 'Marcas disponibles' },
  { value: '99%', label: 'Tiempo de entrega' }
]

// ============================================================
// 2. FEATURE CARDS
// ============================================================
const features = [
  {
    icon: 'truck',
    title: 'Envío rápido',
    description: 'Recibe tu pedido en 24-48 horas en todo el país.'
  },
  {
    icon: 'shield-check',
    title: 'Compra segura',
    description: 'Pagos 100% seguros con encriptación SSL.'
  },
  {
    icon: 'refresh-cw',
    title: 'Devolución fácil',
    description: '30 días para cambiar o devolver tus productos.'
  },
  {
    icon: 'headphones',
    title: 'Soporte 24/7',
    description: 'Estamos aquí para ayudarte cuando lo necesites.'
  }
]

const featureCards = ref([])
featureCards.forEach((_, i) => {
  featureCards.value[i] = ref(null)
})

// ============================================================
// 3. CTA SECTION
// ============================================================
const ctaRef = ref(null)
const ctaMotion = useMotion(ctaRef, {
  initial: { opacity: 0, scale: 0.95 },
  enter: { opacity: 1, scale: 1, transition: { duration: 600, ease: [0.16, 1, 0.3, 1] } }
})

// ============================================================
// 4. CONTACT FORM
// ============================================================
const formRef = ref(null)
const formMotion = useMotion(formRef, {
  initial: { opacity: 0, x: -30 },
  enter: { opacity: 1, x: 0, transition: { duration: 500, ease: [0.16, 1, 0.3, 1] } }
})

const contactForm = ref({
  name: '',
  email: '',
  message: ''
})

const formStatus = ref('idle') // idle | sending | success | error

function handleSubmit() {
  formStatus.value = 'sending'
  setTimeout(() => {
    formStatus.value = 'success'
    contactForm.value = { name: '', email: '', message: '' }
  }, 1500)
}

// ============================================================
// 5. OFFICE GRID / LOCATIONS
// ============================================================
const offices = [
  { city: 'Bogotá', address: 'Carrera 7 # 72-01', phone: '+57 601 234 5678' },
  { city: 'Medellín', address: 'Calle 50 # 45-12', phone: '+57 604 345 6789' },
  { city: 'Cali', address: 'Avenida Roosevelt # 23-45', phone: '+57 602 456 7890' },
  { city: 'Barranquilla', address: 'Calle 80 # 45-67', phone: '+57 605 567 8901' }
]

const officeCards = ref([])
offices.forEach((_, i) => {
  officeCards.value[i] = ref(null)
})

// ============================================================
// 6. STATISTICS SECTION
// ============================================================
const statsSection = ref(null)
const statsMotion = useMotion(statsSection, {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 600 } },
  visible: { opacity: 1, transition: { duration: 800 } }
})

const metrics = [
  { value: '150K+', label: 'Productos vendidos' },
  { value: '45K+', label: 'Clientes activos' },
  { value: '$2.5M', label: 'Ahorro en devoluciones' },
  { value: '4.9/5', label: 'Calificación promedio' }
]

// ============================================================
// 7. PRICING / PLANES
// ============================================================
const plans = [
  {
    name: 'Básico',
    price: '$29.900',
    period: '/mes',
    features: ['Hasta 100 productos', '2 categorías', 'Reportes básicos', 'Soporte por email'],
    cta: 'Comenzar',
    highlighted: false
  },
  {
    name: 'Profesional',
    price: '$59.900',
    period: '/mes',
    features: ['Productos ilimitados', 'Categorías ilimitadas', 'Reportes avanzados', 'Soporte prioritario', 'Integraciones'],
    cta: 'Comenzar',
    highlighted: true
  },
  {
    name: 'Empresarial',
    price: 'Custom',
    period: '',
    features: ['Todo lo de Pro', 'Cuenta dedicada', 'API access', 'SLA 99.9%', 'Manager dedicado'],
    cta: 'Contactar',
    highlighted: false
  }
]

const planCards = ref([])
plans.forEach((_, i) => {
  planCards.value[i] = ref(null)
})

// ============================================================
// 8. CONTACT METHODS
// ============================================================
const contactMethods = [
  { icon: 'message-circle', label: 'Chat en vivo', value: 'Disponible 24/7', action: 'Abrir chat' },
  { icon: 'phone', label: 'Línea gratuita', value: '01 8000 123 456', action: 'Llamar' },
  { icon: 'mail', label: 'Email', value: 'soporte@tienda.com', action: 'Enviar email' },
  { icon: 'map-pin', label: 'Tiendas', value: '4 ubicaciones', action: 'Ver mapa' }
]

const contactItems = ref([])
contactMethods.forEach((_, i) => {
  contactItems.value[i] = ref(null)
})
</script>

<template>
  <div class="design-system-examples">

    <!-- ====================================================== -->
    <!-- 1. HERO SECTION                                          -->
    <!-- ====================================================== -->
    <section
      ref="heroRef"
      class="relative min-h-[600px] flex items-center justify-center overflow-hidden"
      style="background: linear-gradient(135deg, #00184C 0%, #0040A0 50%, #00184C 100%);"
    >
      <!-- Decorative circles -->
      <div class="absolute top-20 left-10 w-64 h-64 rounded-full opacity-10 bg-secondary-300 blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-10 bg-accent-300 blur-3xl"></div>

      <div class="container relative z-10 text-center text-white">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <span class="w-2 h-2 rounded-full bg-accent-300 animate-pulse"></span>
          Nueva colección disponible
        </div>

        <!-- Heading -->
        <h1 class="font-heading text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 leading-tight" v-motion>
          Encuentra tu estilo,
          <span class="text-secondary-300">viste tu confianza</span>
        </h1>

        <!-- Subheading -->
        <p class="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed" v-motion>
          Las mejores marcas de moda en un solo lugar. Envío gratis en pedidos mayores a $100.000.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12" v-motion>
          <button class="btn btn-lg" style="background: linear-gradient(135deg, #43D3FF 0%, #1BA8D4 100%); color: #00184C;">
            Ver colección
          </button>
          <button class="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-500">
            Contactar vendedor
          </button>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-4 max-w-xl mx-auto" v-motion>
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-2xl md:text-3xl font-heading font-semibold text-secondary-300">{{ stat.value }}</div>
            <div class="text-sm text-white/60">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- 2. FEATURE CARDS                                        -->
    <!-- ====================================================== -->
    <section class="py-16 md:py-24 bg-gray-50">
      <div class="container">
        <div class="text-center mb-12">
          <h2 class="font-heading text-3xl md:text-4xl font-semibold text-primary-500 mb-4">
            ¿Por qué elegirnos?
          </h2>
          <p class="text-gray-600 max-w-xl mx-auto">
            Más de 10 años respaldando tu estilo con las mejores condiciones del mercado.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(feature, index) in features"
            :key="feature.title"
            :ref="el => featureCards[index] = el"
            class="card p-6 text-center group hover:shadow-lg transition-shadow duration-300"
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: index * 100, ease: [0.16, 1, 0.3, 1] } }"
          >
            <!-- Icon placeholder -->
            <div
              class="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
              style="background: linear-gradient(135deg, #43D3FF 0%, #1BA8D4 100%);"
            >
              <span class="text-xl">{{ index === 0 ? '🚚' : index === 1 ? '🛡️' : index === 2 ? '🔄' : '🎧' }}</span>
            </div>

            <h3 class="font-heading text-lg font-semibold text-primary-500 mb-2">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- 3. CTA SECTION                                          -->
    <!-- ====================================================== -->
    <section
      ref="ctaRef"
      class="py-16 md:py-24 relative overflow-hidden"
      style="background: linear-gradient(135deg, #43D3FF 0%, #F9D35A 100%);"
    >
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary-500 blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary-700 blur-3xl"></div>
      </div>

      <div class="container relative z-10 text-center">
        <p class="font-accent text-2xl md:text-3xl mb-2" style="color: #A67D1A;">
          Última oportunidad
        </p>
        <h2 class="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-500 mb-4">
          30% OFF en toda la colección de verano
        </h2>
        <p class="text-gray-600 max-w-lg mx-auto mb-8">
          Usa el código VERANO30 al momento del checkout. Válido hasta el 31 de diciembre.
        </p>
        <button class="btn btn-xl" style="background: linear-gradient(135deg, #00184C 0%, #002B8A 100%); color: white;">
          Aprovechar oferta
        </button>
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- 4. CONTACT FORM                                         -->
    <!-- ====================================================== -->
    <section class="py-16 md:py-24">
      <div class="container">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Left: Info -->
          <div>
            <h2 class="font-heading text-3xl md:text-4xl font-semibold text-primary-500 mb-4">
              ¿Tienes preguntas?
            </h2>
            <p class="text-gray-600 mb-8">
              Nuestro equipo está listo para ayudarte. Escríbenos y te responderemos en menos de 24 horas.
            </p>

            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary-100">
                  <span>📍</span>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Oficina principal</p>
                  <p class="font-medium text-gray-800">Carrera 7 # 72-01, Bogotá</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-secondary-100">
                  <span>📞</span>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Teléfono</p>
                  <p class="font-medium text-gray-800">+57 601 234 5678</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Form -->
          <div ref="formRef" class="card p-6 md:p-8">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="input-label" for="name">Nombre completo</label>
                <input
                  id="name"
                  v-model="contactForm.name"
                  type="text"
                  class="input"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div>
                <label class="input-label" for="email">Correo electrónico</label>
                <input
                  id="email"
                  v-model="contactForm.email"
                  type="email"
                  class="input"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label class="input-label" for="message">Mensaje</label>
                <textarea
                  id="message"
                  v-model="contactForm.message"
                  class="input"
                  style="height: 120px; padding-top: 12px;"
                  placeholder="¿En qué podemos ayudarte?"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg w-full"
                :disabled="formStatus === 'sending'"
                style="background: linear-gradient(135deg, #00184C 0%, #002B8A 100%);"
              >
                <span v-if="formStatus === 'idle'">Enviar mensaje</span>
                <span v-else-if="formStatus === 'sending'" class="flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Enviando...
                </span>
                <span v-else-if="formStatus === 'success'">✓ Mensaje enviado</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- 5. OFFICE GRID / LOCATIONS                              -->
    <!-- ====================================================== -->
    <section class="py-16 md:py-24 bg-gray-50">
      <div class="container">
        <div class="text-center mb-12">
          <h2 class="font-heading text-3xl md:text-4xl font-semibold text-primary-500 mb-4">
            Nuestras tiendas
          </h2>
          <p class="text-gray-600">
            Visítanos en cualquiera de nuestras 4 sedes en Colombia.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(office, index) in offices"
            :key="office.city"
            :ref="el => officeCards[index] = el"
            class="card p-6 hover:shadow-lg transition-shadow duration-300"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 400, delay: index * 80, ease: [0.16, 1, 0.3, 1] } }"
          >
            <div
              class="w-10 h-10 rounded-lg mb-4 flex items-center justify-center text-lg"
              style="background: linear-gradient(135deg, #F9D35A 0%, #D4A82A 100%);"
            >
              📍️
            </div>
            <h3 class="font-heading text-lg font-semibold text-primary-500 mb-2">
              {{ office.city }}
            </h3>
            <p class="text-sm text-gray-600 mb-1">{{ office.address }}</p>
            <p class="text-sm text-secondary-500 font-medium">{{ office.phone }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- 6. STATISTICS SECTION                                   -->
    <!-- ====================================================== -->
    <section ref="statsSection" class="py-16" style="background: linear-gradient(180deg, #00184C 0%, #000F30 100%);">
      <div class="container">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div
            v-for="(metric, index) in metrics"
            :key="metric.label"
            class="text-center text-white"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{ opacity: 1, y: 0, transition: { duration: 500, delay: index * 100 } }"
          >
            <div class="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-secondary-300 mb-2">
              {{ metric.value }}
            </div>
            <div class="text-sm md:text-base text-white/70">{{ metric.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- 7. PRICING / PLANES                                     -->
    <!-- ====================================================== -->
    <section class="py-16 md:py-24">
      <div class="container">
        <div class="text-center mb-12">
          <h2 class="font-heading text-3xl md:text-4xl font-semibold text-primary-500 mb-4">
            Planes para cada negocio
          </h2>
          <p class="text-gray-600 max-w-xl mx-auto">
            Elige el plan que mejor se adapte a tu tienda online.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div
            v-for="(plan, index) in plans"
            :key="plan.name"
            :ref="el => planCards[index] = el"
            class="card p-6 relative"
            :class="{ 'ring-2 ring-secondary-300 shadow-lg': plan.highlighted }"
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: index * 100, ease: [0.16, 1, 0.3, 1] } }"
          >
            <!-- Highlight badge -->
            <div
              v-if="plan.highlighted"
              class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold rounded-full text-primary-500"
              style="background: linear-gradient(135deg, #43D3FF 0%, #1BA8D4 100%);"
            >
              Más popular
            </div>

            <div class="text-center mb-6">
              <h3 class="font-heading text-lg font-semibold text-primary-500 mb-2">
                {{ plan.name }}
              </h3>
              <div class="flex items-baseline justify-center gap-1">
                <span class="text-3xl font-heading font-bold text-primary-500">{{ plan.price }}</span>
                <span v-if="plan.period" class="text-sm text-gray-500">{{ plan.period }}</span>
              </div>
            </div>

            <ul class="space-y-3 mb-6">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="flex items-start gap-2 text-sm text-gray-600"
              >
                <span class="text-success mt-0.5">✓</span>
                {{ feature }}
              </li>
            </ul>

            <button
              class="btn w-full"
              :class="plan.highlighted ? 'btn-secondary' : 'btn-outline'"
            >
              {{ plan.cta }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ====================================================== -->
    <!-- 8. CONTACT METHODS                                     -->
    <!-- ====================================================== -->
    <section class="py-16 md:py-24 bg-gray-50">
      <div class="container">
        <div class="text-center mb-12">
          <h2 class="font-heading text-3xl md:text-4xl font-semibold text-primary-500 mb-4">
            Canales de atención
          </h2>
          <p class="text-gray-600">
            Estamos disponibles por múltiples canales para tu comodidad.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="(method, index) in contactMethods"
            :key="method.label"
            :ref="el => contactItems[index] = el"
            class="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { duration: 400, delay: index * 80 } }"
          >
            <div
              class="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
              style="background: linear-gradient(135deg, #43D3FF 0%, #1BA8D4 100%);"
            >
              {{ index === 0 ? '💬' : index === 1 ? '📞' : index === 2 ? '✉️' : '🗺️' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500">{{ method.label }}</p>
              <p class="font-medium text-primary-500 truncate">{{ method.value }}</p>
            </div>
            <span class="text-xs text-secondary-500 font-medium">{{ method.action }}</span>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
/* Override Tailwind classes with design tokens where needed */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
  outline: none;
  white-space: nowrap;
}

.btn:focus-visible {
  box-shadow: 0 0 0 3px var(--color-primary-200);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--gradient-primary);
  color: var(--color-white);
}

.btn-secondary {
  background: var(--gradient-secondary);
  color: var(--color-primary-500);
}

.btn-accent {
  background: var(--gradient-accent);
  color: var(--color-primary-500);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary-500);
  border: 2px solid var(--color-primary-500);
}

.btn-ghost {
  background: transparent;
  color: var(--color-primary-500);
  border: 2px solid transparent;
}

.btn-danger {
  background: var(--color-error);
  color: var(--color-white);
}

.btn-lg {
  height: 48px;
  padding: 0 48px;
  font-size: 1.125rem;
}

.btn-xl {
  height: 56px;
  padding: 0 64px;
  font-size: 1.25rem;
}

.card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.10);
}

.input {
  display: block;
  width: 100%;
  height: 44px;
  padding: 0 24px;
  font-family: var(--font-body);
  font-size: 1rem;
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.input::placeholder {
  color: var(--color-gray-400);
}

.input:focus {
  border-color: var(--color-secondary-300);
  box-shadow: 0 0 0 3px rgba(67, 211, 255, 0.2);
}

.input-label {
  display: block;
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
  margin-bottom: 8px;
}

.container {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 32px;
  padding-right: 32px;
}

@media (min-width: 768px) {
  .container {
    padding-left: 48px;
    padding-right: 48px;
  }
}
</style>

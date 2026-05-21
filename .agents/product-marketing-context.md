# Product Marketing Context - Continental Assist

## Product Overview

**Company**: Continental Assist
**Type**: Travel Insurance / Assistance e-commerce
**Core Product**: AI-powered travel assistance and insurance policies
**Market**: Latin America (primary), Spanish-speaking travelers
**Platform**: Web e-commerce (Vue 3 + Tailwind CSS)

---

## Brand Identity

### Color Palette
- **Primary (Azul Corporativo)**: `#00184C` - Azul oscuro, transmite confianza y solidez
- **Secondary (Cyan)**: Usado para elementos interactivos y highlights
- **Accent (Amarillo/Dorado)**: CTAs, badges de "popular", urgencia
- **Background**: Blanco con secciones en gris claro

### Typography
- Sistema de fuentes personalizadas (Galano Grotesque + Freestyle Script)
- Tono profesional pero accesible

### Logo/Branding
- "Continental Assist" - énfasis en "Assist" (asistencia, ayuda)
- Tagline implícito: Protección de viaje con IA conversacional

---

## Product Structure

### Planes de Asistencia

| Plan | Precio | Cobertura Médica | Características Principales |
|------|--------|------------------|------------------------------|
| **Essential** | $25 USD | $30,000 USD | Básica + equipaje + odontología |
| **Explorer** | $40 USD | $50,000 USD | + Cancelación + COVID + Deportes |
| **Premium** | $65 USD | $100,000 USD | + Concierge + Mascotas + Deportes extremos |

### Flujos de Usuario

1. **Flujo Híbrido (Actual)**:
   - Chat inicial → Selección de plan → Datos personales → Pago → Éxito
   - Combina conversación con formularios estructurados

2. **Flujo 100% Chat (En desarrollo)**:
   - Conversación pura con IA
   - Mismo proceso, sin formularios explícitos
   - Validación inline y escape hatch para problemas

### Destinos Populares
- Europa (🗼)
- Caribe (🏝️)
- Estados Unidos (🗽)
- Latinoamérica
- Asia (🌍)

---

## Target Audience

### User Personas

**Persona Principal: "El Viajero Cauteloso"**
- 25-45 años
- Viaja internacionalmente 1-3 veces al año
- Busca protección sin pagar demasiado
- Conciencia de riesgos (noticias, experiencias de otros)
- Prefiere procesos simples y rápidos
- Hispanohablante,可能在拉丁美洲任何国家

**Persona Secundaria: "El Viajero Frecuente"**
- 35-55 años
- Viaja por trabajo o familia frecuentemente
- Mayor poder adquisitivo
- Busca cobertura completa (Premium)
- Valora la tranquilidad sobre el costo

### Viajes Típicos
- Vacaciones familiares (Caribe, Europa)
- Viajes de negocios (EE.UU.)
- Viajes de aventura (Asia, LATAM)
- Emergencias médicas reales pueden costar $50,000+ USD en EE.UU.

---

## Competitive Landscape

### Posicionamiento
- **Diferenciador principal**: AI conversacional ("Asist") hace el proceso más humano
- **Ventaja**: Proceso más rápido y simple que competidores tradicionales
- **Precio**: Competitivo (Essential $25 vs. competencia $30-40)

### Competidores Típicos
- Assist Card, World Nomads, Allianz, Generali
- Diferencia: Nuestra IA conversacional vs. sus formularios tradicionales

---

## Marketing & психологические принципы

### Loss Aversion (Ya aplicado)
- Hero pregunta: "¿Sabías que una emergencia médica en EE.UU. puede costar más de $50,000?"
- Refuerza: "No travel uninsured" - miedo a perder protección

### Social Proof (Ya aplicado)
- Testimonios reales con fotos
- Stats: 500K+ viajeros, 4.9/5 rating
- "Verificado" badges en testimonios

### Urgency/Scarcity (Ya aplicado)
- Urgency banner con countdown
- "Popular" badges en destinos
- "Mejor valor" / "Más popular" en planes

### Anchoring (Ya aplicado)
- Precios originales tachados ($30 → $25)
- Plan Explorer a $40 vs Premium a $65 hace el Explorer parecer "sweet spot"

### Reciprocity
- Chat inicial gratuito con "Asist"
- Free teleconsulta incluida en todos los planes

### Authority
- Trust indicators: "Aseguradora", "20+ años", "+500K viajeros"
- Badges SSL, pago seguro

### Commitment & Consistency
- Pequeños pasos: seleccionar destino → duración → viajeros → plan
- Cada click es un mini-compromiso que empuja hacia checkout

---

## Key Messaging

### Hero Headline
"Viaja con confianza, vuelve con historias"

### Subheadline (Loss Aversion)
"¿Sabías que una emergencia médica en EE.UU. puede costar más de $50,000?"
"Protege tu aventura desde solo $25 USD — menos que tu café diario"

### CTAs Principales
- "¡Comenzar ahora!" (primario)
- "¿Cómo funciona?" (secundario)
- "Cotizar ahora" (conversión)

### Trust Signals
- Aseguradora confiable
- 24/7 asistencia
- +500K viajeros protegidos
- 4.9/5 rating

---

## Conversion Flow

```
Landing (HomeView)
    ↓
Urgency Banner → click → /cotizar (QuoteView)
    ↓
Chat (Hybrid o Full Chat)
    ↓
Destination → Duration → Travelers
    ↓
Plan Selection (QuotationStep)
    ↓
Personal Data (form)
    ↓
Payment (form)
    ↓
Success (confetti + policy number)
```

---

## Known Pain Points

1. **Formularios extensos** → Solución: Flujo 100% Chat
2. **Miedo a estafas** → Solución: Trust badges, SSL, pago seguro
3. **No entender qué cubre** → Solución: Cobertura clara en cards
4. **Precio vs. valor** → Solución: Anchoring, anchor prices
5. **Proceso largo** → Solución: 3 pasos, progress stepper

---

## A/B Test Opportunities

1. **FullChatFlow vs HybridFlow** - ¿Cuál convierte mejor?
2. **Pricing anchor** - ¿$25 o "desde $25"?
3. **Urgency banner** - ¿Funciona o causa fatiga?
4. **Chat bot name** - "Asist" vs. otro nombre

---

## Métricas Clave

- **Conversión**: Quote initiation → Payment completion
- **Chat completion rate**: % que terminan el chat
- **Plan selection**: % que eligen Explorer vs otros
- **Time to purchase**: ¿Cuánto tardan en comprar?
- **Churn signals**: ¿Dónde abandonan?

---

## Archivos Relevantes

- `src/views/HomeView.vue` - Landing page
- `src/views/QuoteView.vue` - Flujo de cotización
- `src/components/FullChatFlow.vue` - Flujo conversacional completo
- `src/components/quote/ChatInterface.vue` - Chat híbrido
- `src/components/quote/QuotationStep.vue` - Selección de planes
- `src/components/quote/SuccessStep.vue` - Página de éxito
<script setup>
import { defineAsyncComponent, computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 24
  },
  strokeWidth: {
    type: Number,
    default: 1.5
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})

const iconImports = {
  'search': () => import('lucide-vue-next').then(m => m.Search),
  'cart': () => import('lucide-vue-next').then(m => m.ShoppingCart),
  'user': () => import('lucide-vue-next').then(m => m.User),
  'menu': () => import('lucide-vue-next').then(m => m.Menu),
  'x': () => import('lucide-vue-next').then(m => m.X),
  'chevron-left': () => import('lucide-vue-next').then(m => m.ChevronLeft),
  'chevron-right': () => import('lucide-vue-next').then(m => m.ChevronRight),
  'chevron-down': () => import('lucide-vue-next').then(m => m.ChevronDown),
  'arrow-right': () => import('lucide-vue-next').then(m => m.ArrowRight),
  'arrow-left': () => import('lucide-vue-next').then(m => m.ArrowLeft),
  'arrow-up-right': () => import('lucide-vue-next').then(m => m.ArrowUpRight),
  'home': () => import('lucide-vue-next').then(m => m.Home),
  'heart': () => import('lucide-vue-next').then(m => m.Heart),
  'star': () => import('lucide-vue-next').then(m => m.Star),
  'tag': () => import('lucide-vue-next').then(m => m.Tag),
  'percent': () => import('lucide-vue-next').then(m => m.Percent),
  'gift': () => import('lucide-vue-next').then(m => m.Gift),
  'truck': () => import('lucide-vue-next').then(m => m.Truck),
  'package': () => import('lucide-vue-next').then(m => m.Package),
  'credit-card': () => import('lucide-vue-next').then(m => m.CreditCard),
  'shield-check': () => import('lucide-vue-next').then(m => m.ShieldCheck),
  'refresh-cw': () => import('lucide-vue-next').then(m => m.RefreshCw),
  'headphones': () => import('lucide-vue-next').then(m => m.Headphones),
  'shopping-bag': () => import('lucide-vue-next').then(m => m.ShoppingBag),
  'instagram': () => import('lucide-vue-next').then(m => m.Instagram),
  'facebook': () => import('lucide-vue-next').then(m => m.Facebook),
  'twitter': () => import('lucide-vue-next').then(m => m.Twitter),
  'mail': () => import('lucide-vue-next').then(m => m.Mail),
  'phone': () => import('lucide-vue-next').then(m => m.Phone),
  'map-pin': () => import('lucide-vue-next').then(m => m.MapPin),
  'message-circle': () => import('lucide-vue-next').then(m => m.MessageCircle),
  'plus': () => import('lucide-vue-next').then(m => m.Plus),
  'minus': () => import('lucide-vue-next').then(m => m.Minus),
  'check': () => import('lucide-vue-next').then(m => m.Check),
  'check-circle': () => import('lucide-vue-next').then(m => m.CheckCircle),
  'alert-circle': () => import('lucide-vue-next').then(m => m.AlertCircle),
  'info': () => import('lucide-vue-next').then(m => m.Info),
  'loader': () => import('lucide-vue-next').then(m => m.Loader),
  'eye': () => import('lucide-vue-next').then(m => m.Eye),
  'eye-off': () => import('lucide-vue-next').then(m => m.EyeOff),
  'lock': () => import('lucide-vue-next').then(m => m.Lock),
  'external-link': () => import('lucide-vue-next').then(m => m.ExternalLink),
  'rotate-ccw': () => import('lucide-vue-next').then(m => m.RotateCcw),
  'settings': () => import('lucide-vue-next').then(m => m.Settings),
  'logout': () => import('lucide-vue-next').then(m => m.LogOut),
  'help-circle': () => import('lucide-vue-next').then(m => m.HelpCircle),
  'zap': () => import('lucide-vue-next').then(m => m.Zap),
  'trending-up': () => import('lucide-vue-next').then(m => m.TrendingUp),
  'clock': () => import('lucide-vue-next').then(m => m.Clock),
  'calendar': () => import('lucide-vue-next').then(m => m.Calendar),
  'globe': () => import('lucide-vue-next').then(m => m.Globe),
  'filter': () => import('lucide-vue-next').then(m => m.Filter),
  'sliders': () => import('lucide-vue-next').then(m => m.Sliders),
  'image': () => import('lucide-vue-next').then(m => m.Image),
  'trash-2': () => import('lucide-vue-next').then(m => m.Trash2),
  'edit': () => import('lucide-vue-next').then(m => m.Edit3),
  'copy': () => import('lucide-vue-next').then(m => m.Copy),
  'building': () => import('lucide-vue-next').then(m => m.Building2),
  'landmark': () => import('lucide-vue-next').then(m => m.Landmark),
  'plane': () => import('lucide-vue-next').then(m => m.Plane),
  'map': () => import('lucide-vue-next').then(m => m.Map),
  'compass': () => import('lucide-vue-next').then(m => m.Compass),
  'luggage': () => import('lucide-vue-next').then(m => m.Luggage),
  'tent': () => import('lucide-vue-next').then(m => m.Tent),
  'mountain': () => import('lucide-vue-next').then(m => m.Mountain),
  'sun': () => import('lucide-vue-next').then(m => m.Sun),
  'umbrella': () => import('lucide-vue-next').then(m => m.Umbrella),
  'camera': () => import('lucide-vue-next').then(m => m.Camera),
  'award': () => import('lucide-vue-next').then(m => m.Award),
  'badge-check': () => import('lucide-vue-next').then(m => m.BadgeCheck),
  'users': () => import('lucide-vue-next').then(m => m.Users),
  'user-check': () => import('lucide-vue-next').then(m => m.UserCheck),
  'thumb-up': () => import('lucide-vue-next').then(m => m.ThumbUp),
  'heart-handshake': () => import('lucide-vue-next').then(m => m.HeartHandshake),
  'shield': () => import('lucide-vue-next').then(m => m.Shield),
  'sparkles': () => import('lucide-vue-next').then(m => m.Sparkles),
  'baby': () => import('lucide-vue-next').then(m => m.Baby),
  'palm-tree': () => import('lucide-vue-next').then(m => m.PalmTree),
  'utensils': () => import('lucide-vue-next').then(m => m.UtensilsCrossed),
  'bed': () => import('lucide-vue-next').then(m => m.Bed),
  'wine': () => import('lucide-vue-next').then(m => m.Wine),
  'video': () => import('lucide-vue-next').then(m => m.Video),
  'scale': () => import('lucide-vue-next').then(m => m.Scale),
  'calendar-x': () => import('lucide-vue-next').then(m => m.CalendarX),
  'play-circle': () => import('lucide-vue-next').then(m => m.PlayCircle),
  'x-circle': () => import('lucide-vue-next').then(m => m.XCircle),
  'check-square': () => import('lucide-vue-next').then(m => m.CheckSquare),
  'heart-pulse': () => import('lucide-vue-next').then(m => m.HeartPulse),
  'stethoscope': () => import('lucide-vue-next').then(m => m.Stethoscope),
  'pill': () => import('lucide-vue-next').then(m => m.Pill),
  'thermometer': () => import('lucide-vue-next').then(m => m.Thermometer),
  'activity': () => import('lucide-vue-next').then(m => m.Activity),
  'plane-takeoff': () => import('lucide-vue-next').then(m => m.PlaneTakeoff),
  'plane-landing': () => import('lucide-vue-next').then(m => m.PlaneLanding),
  'ticket': () => import('lucide-vue-next').then(m => m.Ticket),
  'passport': () => import('lucide-vue-next').then(m => m.Passport),
  'file-check': () => import('lucide-vue-next').then(m => m.FileCheck),
  'wallet': () => import('lucide-vue-next').then(m => m.Wallet),
  'banknote': () => import('lucide-vue-next').then(m => m.Banknote),
  'send': () => import('lucide-vue-next').then(m => m.Send),
  'plus-circle': () => import('lucide-vue-next').then(m => m.PlusCircle),
  'file-search': () => import('lucide-vue-next').then(m => m.FileSearch),
  'file-text': () => import('lucide-vue-next').then(m => m.FileText),
  'download': () => import('lucide-vue-next').then(m => m.Download),
  'share-2': () => import('lucide-vue-next').then(m => m.Share2),
  'printer': () => import('lucide-vue-next').then(m => m.Printer),
  'briefcase': () => import('lucide-vue-next').then(m => m.Briefcase),
  'log-in': () => import('lucide-vue-next').then(m => m.LogIn),
  'user-plus': () => import('lucide-vue-next').then(m => m.UserPlus),
  'clipboard-list': () => import('lucide-vue-next').then(m => m.ClipboardList)
}

const asyncComponent = computed(() => {
  const importer = iconImports[props.name]
  if (!importer) {
    console.warn(`[AppIcon] Icon "${props.name}" no encontrado.`)
    return defineAsyncComponent(() => import('lucide-vue-next').then(m => m.HelpCircle))
  }
  return defineAsyncComponent(importer)
})
</script>

<template>
  <Suspense>
    <component
      :is="asyncComponent"
      :size="size"
      :stroke-width="strokeWidth"
      :color="color"
    />
  </Suspense>
</template>
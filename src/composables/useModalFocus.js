import { ref, watch, onUnmounted } from 'vue'

const openCount = ref(0)
let prevOverflow = null

function lockBodyScroll() {
  if (openCount.value === 0 && typeof document !== 'undefined') {
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  openCount.value++
}

function unlockBodyScroll() {
  openCount.value = Math.max(0, openCount.value - 1)
  if (openCount.value === 0 && typeof document !== 'undefined' && prevOverflow !== null) {
    document.body.style.overflow = prevOverflow
    prevOverflow = null
  }
}

export function useModalFocus(isOpen, onClose) {
  watch(isOpen, (val) => {
    if (val) lockBodyScroll()
    else unlockBodyScroll()
  }, { immediate: true })

  onUnmounted(() => {
    if (isOpen.value) unlockBodyScroll()
  })

  function trapFocus(event) {
    if (event.key !== 'Tab' || !isOpen.value) return
    const root = event.currentTarget
    if (!root) return
    const focusables = root.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function handleKeydown(e) {
    if (!isOpen.value) return
    if (e.key === 'Escape') {
      e.preventDefault()
      if (typeof onClose === 'function') onClose()
      return
    }
    if (e.key === 'Tab') {
      const modal = document.querySelector('[role="dialog"]:not([style*="display: none"])')
      if (modal) trapFocus({ ...e, currentTarget: modal })
    }
  }

  return { trapFocus, handleKeydown }
}

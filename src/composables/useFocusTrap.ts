import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select, [tabindex]:not([tabindex="-1"])'

/** Garde le focus dans un panneau ouvert et le rend à l'élément d'origine à la fermeture. */
export function useFocusTrap(open: Ref<boolean>, container: Ref<HTMLElement | undefined>, onEscape: () => void) {
  let returnTo: HTMLElement | null = null

  function onKey(e: KeyboardEvent) {
    if (!open.value || !container.value) return
    if (e.key === 'Escape') {
      e.preventDefault()
      onEscape()
      return
    }
    if (e.key !== 'Tab') return
    const nodes = [...container.value.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null)
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(open, async (isOpen) => {
    if (isOpen) {
      returnTo = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', onKey)
      document.documentElement.style.overflow = 'hidden'
      await nextTick()
      const auto = container.value?.querySelector<HTMLElement>('[data-autofocus]') ?? container.value
      auto?.focus({ preventScroll: true })
    } else {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
      if (returnTo && document.contains(returnTo)) returnTo.focus({ preventScroll: true })
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKey)
    document.documentElement.style.overflow = ''
  })
}

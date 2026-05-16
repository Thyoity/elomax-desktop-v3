/**
 * Suppresses the tippy tooltip on a trigger element for the duration of an
 * external UI flow (typically a modal). Hides + disables the tippy
 * immediately and returns a function that re-enables it — but only after the
 * cursor genuinely leaves the trigger.
 *
 * Why this is needed: when a modal opens, its overlay covers the trigger,
 * causing the browser to fire `mouseleave` on the trigger. When the modal
 * closes, the overlay disappears and the browser fires `mouseenter` again.
 * Tippy treats that mouseenter as a fresh hover and re-shows the tooltip,
 * which looks like a stuck/zombie tooltip to the user. By keeping the
 * instance disabled until the cursor truly moves away, we eat that spurious
 * mouseenter without breaking real subsequent hovers.
 */
export function suppressTippy(trigger: EventTarget | null | undefined): () => void {
  const el = trigger as HTMLElement | null
  const tippy = (el as any)?._tippy as { hide: () => void; enable: () => void; disable: () => void } | undefined

  if (!el || !tippy) return () => undefined

  tippy.hide()
  tippy.disable()

  return () => {
    // If the cursor is no longer over the trigger, re-enable now — the next
    // hover will be a clean mouseenter and the tooltip will show normally.
    if (!el.matches(':hover')) {
      tippy.enable()
      return
    }
    // Cursor is still over the trigger (modal was dismissed without moving
    // the mouse). Wait for the user to actually leave before re-enabling.
    const reenable = () => {
      el.removeEventListener('mouseleave', reenable)
      tippy.enable()
    }
    el.addEventListener('mouseleave', reenable)
  }
}

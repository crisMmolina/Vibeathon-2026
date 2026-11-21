// Clicking an alliance point on the map: go to the Alianzas tab (shell listens to huella:tab) and open that card
// (Alianzas listens to huella:alianza). The card event waits a tick so the Alianzas screen has mounted.
export function openAlliance(id: string, delayMs = 60): void {
  window.dispatchEvent(new CustomEvent('huella:tab', { detail: 'alianzas' }))
  setTimeout(() => window.dispatchEvent(new CustomEvent('huella:alianza', { detail: id })), delayMs)
}

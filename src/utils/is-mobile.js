export default function isMobile() {
  return window.navigator.maxTouchPoints || 'ontouchstart' in document;
}

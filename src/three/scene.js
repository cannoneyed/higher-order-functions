import * as THREE from 'three'
import TWEEN from 'tween.js'

import PixelManager from './pixel-manager'
import sceneManager from 'core/scene'
import hash, { getPixelFromHash } from 'utils/hash'

// Constants
const ZOOM = {
  min: 10,
  max: 1450,
  point: 30,
}

const ZOOM_IN_OUT_TIME = 3000
const ZOOM_BETWEEN_TIME = 2000
const SWING = 500

const tweens = {
  zoom: null,
}

// Closure variables
let camera, scene, renderer, raycaster, pixelManager

export function animate() {
  requestAnimationFrame(animate)
  render()
}

export function init(container, initialHash) {
  const ratio = window.innerWidth / window.innerHeight
  camera = new THREE.PerspectiveCamera(45, ratio, 1, 30000)

  camera.position.z = ZOOM.min

  raycaster = new THREE.Raycaster()
  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer({ antialias: false })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  pixelManager = new PixelManager(renderer, camera)
  pixelManager.addPixelsToScene(scene)

  // Add a dummy plane to the scene to fix a clearing bug in safari
  addDummyPlane()

  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)

  if (initialHash) {
    const initialPixel = getPixelFromHash(initialHash)
    if (initialPixel) {
      zoomToInitialPixel(initialPixel)
    }
  }

  animate()
}

function addDummyPlane() {
  const geometry = new THREE.PlaneGeometry(
    window.innerWidth * 100,
    window.innerHeight * 100,
  )
  const material = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0 })
  const plane = new THREE.Mesh(geometry, material)
  plane.position.z = -2001
  scene.add(plane)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

// Animation state machine
let start

const zoomParam = { z: ZOOM.min, x: 0, y: 0 }
const rotateParam = { x: 0, y: 0 }
const timeParam = { t: 0.00004 }
const swingParam = { s: 1, stop: false }

function render() {
  TWEEN.update()

  pixelManager.updatePixelSize()

  if (sceneManager.isIntroAnimationActive) {
    const now = Date.now()
    const elapsed = now - start

    let time = (elapsed + sceneManager.INTRO_ANIMATION_OFFSET) * timeParam.t

    const pixelGroups = pixelManager.pixelGroups
    for (let i = 0; i < pixelGroups.length; i++) {
      const pixelGroup = pixelGroups[i]
      const s = swingParam.stop ? 0 : swingParam.s
      pixelGroup.position.z = Math.sin(time * i) * SWING * s
    }

    // Add in a quick override of the swing tween, since it ought to
    // stop at approximately 80% of the animation time
    if (
      elapsed > sceneManager.INTRO_ANIMATION_TIME * 0.85 &&
      !swingParam.stop
    ) {
      swingParam.stop = true
      sceneManager.isInteractive = true
    }

    if (elapsed >= sceneManager.INTRO_ANIMATION_TIME) {
      sceneManager.finishIntroAnimation()
    }
  }

  camera.position.x = zoomParam.x
  camera.position.y = zoomParam.y
  camera.position.z = zoomParam.z

  transitionCameraPan()

  renderer.render(scene, camera)
}

function transitionCameraPan() {
  const zoomRange = ZOOM.max - ZOOM.min
  const zoomPercent = (zoomParam.z - ZOOM.min) / zoomRange
  const xRotation = 0.01 * rotateParam.y * zoomPercent
  const yRotation = 0.01 * rotateParam.x * zoomPercent
  const r = new THREE.Euler(xRotation, yRotation, 0)
  camera.setRotationFromEuler(r)
}

export function click(event, router) {
  if (!sceneManager.isInteractive) {
    return
  }

  const mouse = new THREE.Vector2()
  mouse.x = event.clientX / window.innerWidth * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  camera.updateMatrixWorld()
  raycaster.setFromCamera(mouse, camera)

  let intersects = raycaster.intersectObjects(pixelManager.pixelGroups)

  if (!sceneManager.isInteractive) {
    return
  }

  if (intersects.length > 0) {
    const { point } = intersects[0]
    const pixel = pixelManager.getPixelFromCoordinates(point.x, point.y)

    // We'll want to zoom out / return when clicking a black pixel
    if (pixel.colorIndex === 13) {
      return zoomOut()
    }

    const hashStr = hash(pixel)
    router.navigate('hash', { hash: hashStr })

    // const point = object.geometry.vertices[index]
    zoomToPixel(pixel)
  } else {
    router.navigate('default')
  }
}

let hoverSlug = null

export function mousemove(event) {
  const mouse = new THREE.Vector2()
  mouse.x = event.clientX / window.innerWidth * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  // Handle the pan / tilt even when the scene is not interactive
  rotateParam.x = mouse.x
  rotateParam.y = mouse.y

  if (!sceneManager.isInteractive) {
    return
  }

  camera.updateMatrixWorld()
  raycaster.setFromCamera(mouse, camera)

  let intersects = raycaster.intersectObjects(pixelManager.pixelGroups)

  if (!sceneManager.isInteractive) {
    return
  }

  if (intersects.length > 0) {
    const { point } = intersects[0]
    const pixel = pixelManager.getPixelFromCoordinates(point.x, point.y)
    const slug = pixel.colorIndex === 13 ? null : `${pixel.row}:${pixel.col}`

    // We want to reset the mouseover when over a black tile
    if (hoverSlug !== slug) {
      if (pixel.colorIndex === 13) {
        hoverSlug = null
        document.body.style.cursor = 'default'
        sceneManager.setHoveredPixel(null)
        return
      }
      hoverSlug = slug
      document.body.style.cursor = 'pointer'
      sceneManager.setHoveredPixel(pixel)
    }
  } else {
    hoverSlug = null
    document.body.style.cursor = 'default'
    sceneManager.setHoveredPixel(null)
  }
}

export function zoomOut() {
  if (!sceneManager.isZoomedIn) {
    return
  }

  sceneManager.isInteractive = false
  sceneManager.deselectPixel()

  if (tweens.zoom) {
    tweens.zoom.stop()
  }

  tweens.zoom = new TWEEN.Tween(zoomParam)
    .to({ x: 0, y: 0, z: ZOOM.max }, ZOOM_IN_OUT_TIME)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()
    .onComplete(() => {
      sceneManager.isInteractive = true
      sceneManager.isZoomedIn = false
      pixelManager.updateBufferGeometry()
    })
}

function zoomToInitialPixel(pixel, colorIndex) {
  const { x, y } = pixelManager.getCoordinatesFromPixel(pixel)

  sceneManager.selectPixel(pixel)
  sceneManager.isInteractive = true
  sceneManager.isZoomedIn = true

  zoomParam.x = x
  zoomParam.y = y
  zoomParam.z = ZOOM.point
  camera.position.z = ZOOM.point

  pixelManager.updateBufferGeometry()
}

export function zoomToPixel(pixel) {
  document.body.style.cursor = 'default'
  if (tweens.zoom) {
    tweens.zoom.stop()
  }

  const { x, y } = pixelManager.getCoordinatesFromPixel(pixel)

  sceneManager.isInteractive = false
  sceneManager.selectPixel(pixel)

  const zoomTime = sceneManager.isZoomedIn
    ? ZOOM_BETWEEN_TIME
    : ZOOM_IN_OUT_TIME

  tweens.zoom = new TWEEN.Tween(zoomParam)
    .to({ x, y, z: ZOOM.point }, zoomTime)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()
    .onComplete(() => {
      sceneManager.isInteractive = true
      sceneManager.isZoomedIn = true
      pixelManager.updateBufferGeometry()
    })
}

export function activateIntroAnimation() {
  sceneManager.isIntroAnimationActive = true
  start = Date.now()

  tweens.zoom = new TWEEN.Tween(zoomParam)
    .to({ z: ZOOM.max }, sceneManager.INTRO_ANIMATION_TIME * 0.95)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()

  tweens.time = new TWEEN.Tween(timeParam)
    .to({ t: timeParam.t * 1.5 }, sceneManager.INTRO_ANIMATION_TIME)
    .easing(TWEEN.Easing.Quadratic.In)
    .start()

  tweens.swing = new TWEEN.Tween(swingParam)
    .to({ s: 0 }, sceneManager.INTRO_ANIMATION_TIME)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()
}

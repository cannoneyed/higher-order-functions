import * as THREE from 'three'
import TWEEN from 'tween.js'
// import MakeOrbitControls from 'three-orbit-controls'
// const OrbitControls = MakeOrbitControls(THREE)

import particleManager from './particle-manager'
import sceneManager from 'core/scene'
import { getPixelFromHash } from 'utils/hash'

// Constants
const ZOOM = {
  min: 2,
  max: 800,
  point: 20,
}
const ANIMATION_OFFSET = 800

const ANIMATION_TIME = 30000
const ZOOM_TIME = 3000
const SWING = 500

// Closure variables
let camera, scene, renderer, raycaster

export function animate() {
  requestAnimationFrame(animate)
  render()
}

export function init(container, initialHash) {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    30000,
  )
  camera.position.z = ZOOM.min
  // controls = new OrbitControls(camera)

  raycaster = new THREE.Raycaster()
  scene = new THREE.Scene()

  particleManager.addParticlesToScene(scene)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
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

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

// Animation state machine
let start

const zoomParam = { z: ZOOM.min, x: 0, y: 0 }
const timeParam = { t: 0.00004 }
const swingParam = { s: 1, stop: false }

function render() {
  TWEEN.update()

  if (sceneManager.isAnimationActive) {
    const now = Date.now()
    const elapsed = now - start

    let time = (elapsed + ANIMATION_OFFSET) * timeParam.t

    const particles = particleManager.particles
    for (let i = 0; i < particles.length; i++) {
      const object = particles[i]
      const s = swingParam.stop ? 0 : swingParam.s
      object.position.z = Math.sin(time * i) * SWING * s
    }

    // Add in a quick override of the swing tween, since it ought to
    // stop at approximately 80% of the animation time
    if (elapsed > ANIMATION_TIME * 0.85 && !swingParam.stop) {
      swingParam.stop = true
      sceneManager.isInteractive = true
    }

    if (elapsed >= ANIMATION_TIME) {
      sceneManager.isAnimationActive = false
      sceneManager.isAnimationFinished = true
    }
  }

  camera.position.x = zoomParam.x
  camera.position.y = zoomParam.y
  camera.position.z = zoomParam.z

  renderer.render(scene, camera)
}

export function click(event) {
  if (!sceneManager.isInteractive) {
    return
  }

  const mouse = new THREE.Vector2()
  mouse.x = event.clientX / window.innerWidth * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.params.Points.threshold = sceneManager.isZoomedIn ? 2 : 6
  camera.updateMatrixWorld()
  raycaster.setFromCamera(mouse, camera)

  let intersects = raycaster.intersectObjects(particleManager.particles)

  if (intersects.length > 0) {
    const intersect = intersects[0]
    const { index, object } = intersect

    // We'll want to zoom out / return when clicking a black pixel
    if (object.colorIndex === 13) {
      return zoomOut()
    }

    const point = object.geometry.vertices[index]
    zoomToPoint(point, object.colorIndex)
  } else {
    zoomOut()
  }
}

function zoomOut() {
  if (!sceneManager.isZoomedIn) {
    return
  }

  sceneManager.isInteractive = false
  sceneManager.deselectPixel()

  new TWEEN.Tween(zoomParam)
    .to({ x: 0, y: 0, z: ZOOM.max }, ZOOM_TIME)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()
    .onComplete(() => {
      sceneManager.isInteractive = true
      sceneManager.isZoomedIn = false
    })
}

function zoomToInitialPixel(pixel, colorIndex) {
  sceneManager.selectPixel(pixel)
  const point = particleManager.getPointFromPixel(pixel)

  sceneManager.isInteractive = true
  sceneManager.isZoomedIn = true
  zoomParam.x = point.x
  zoomParam.y = point.y
  zoomParam.z = ZOOM.point
}

function zoomToPoint(point) {
  if (!sceneManager.isInteractive) {
    return
  }

  const { x, y } = point
  const pixel = particleManager.getPixelFromCoordinates(x, y)

  sceneManager.isInteractive = false
  sceneManager.selectPixel(pixel)

  new TWEEN.Tween(zoomParam)
    .to({ x, y, z: ZOOM.point }, ZOOM_TIME)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()
    .onComplete(() => {
      sceneManager.isInteractive = true
      sceneManager.isZoomedIn = true
    })
}

export function activate() {
  sceneManager.isAnimationActive = true
  start = Date.now()

  new TWEEN.Tween(zoomParam)
    .to({ z: ZOOM.max }, ANIMATION_TIME * 0.95)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()

  new TWEEN.Tween(timeParam)
    .to({ t: timeParam.t * 1.5 }, ANIMATION_TIME)
    .easing(TWEEN.Easing.Quadratic.In)
    .start()

  new TWEEN.Tween(swingParam)
    .to({ s: 0 }, ANIMATION_TIME)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()
}

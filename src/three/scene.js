import * as THREE from 'three'
import TWEEN from 'tween.js'
// import MakeOrbitControls from 'three-orbit-controls'
// const OrbitControls = MakeOrbitControls(THREE)

import particleManager from './particle-manager'

const CAMERA_MIN = 2
const CAMERA_MAX = 400

let camera, scene, renderer, raycaster

export function animate() {
  requestAnimationFrame(animate)
  render()
}

export function init(container) {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    30000,
  )
  camera.position.z = CAMERA_MIN
  // controls = new OrbitControls(camera)

  raycaster = new THREE.Raycaster()
  // raycaster.params.Points.threshold = 0.1

  scene = new THREE.Scene()

  particleManager.addParticlesToScene(scene)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)

  animate()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

let isAnimationActive = false
let isAnimationFinished = false
let start
const TIME_OFFSET = 800

const ANIMATION_TIME = 3000
const ZOOM_TIME = 3000
const SWING = 500

const zoomParam = { z: CAMERA_MIN, x: 0, y: 0 }
const timeParam = { t: 0.00004 }
const swingParam = { s: 1 }

function render() {
  TWEEN.update()

  if (isAnimationActive) {
    const now = Date.now()
    const elapsed = now - start

    let time = (elapsed + TIME_OFFSET) * timeParam.t

    for (let i = 0; i < scene.children.length; i++) {
      let object = scene.children[i]

      if (object instanceof THREE.Points) {
        object.position.z = Math.sin(time * i) * SWING * swingParam.s
      }
    }

    if (elapsed >= ANIMATION_TIME) {
      isAnimationActive = false
      isAnimationFinished = true

      // Make sure we zero everything out
      for (let i = 0; i < scene.children.length; i++) {
        let object = scene.children[i]
        if (object instanceof THREE.Points) {
          object.position.z = Math.sin(time * i) * SWING * swingParam.s
        }
      }
    }
  }

  camera.position.x = zoomParam.x
  camera.position.y = zoomParam.y
  camera.position.z = zoomParam.z

  renderer.render(scene, camera)
}

window.addEventListener('click', function(ev) {
  const mouse = new THREE.Vector2()
  mouse.x = event.clientX / window.innerWidth * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.params.Points.threshold = 2
  camera.updateMatrixWorld()
  raycaster.setFromCamera(mouse, camera)

  let intersects = raycaster.intersectObjects(particleManager.particles)

  if (intersects.length > 0) {
    const { index, object } = intersects[0]
    const point = object.geometry.vertices[index]
    zoomToPoint(point)
  }
})

function zoomOut() {
  new TWEEN.Tween(zoomParam)
    .to({ x: 0, y: 0, z: CAMERA_MAX }, ZOOM_TIME)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()
}

function zoomToPoint(point) {
  if (!isAnimationFinished) {
    return
  }

  if (zoomParam.z < 100) {
    zoomOut()
  }

  const { x, y } = point

  new TWEEN.Tween(zoomParam)
    .to({ x, y, z: CAMERA_MIN * 10 }, ZOOM_TIME)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()
}

export function activate() {
  isAnimationActive = true
  start = Date.now()

  new TWEEN.Tween(zoomParam)
    .to({ z: CAMERA_MAX }, ANIMATION_TIME * 0.95)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()

  new TWEEN.Tween(timeParam)
    .to({ t: 0.00006 }, ANIMATION_TIME)
    .easing(TWEEN.Easing.Quadratic.In)
    .start()

  new TWEEN.Tween(swingParam)
    .to({ s: 0 }, ANIMATION_TIME)
    .easing(TWEEN.Easing.Quintic.InOut)
    .start()
}

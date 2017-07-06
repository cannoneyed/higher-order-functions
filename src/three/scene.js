import * as THREE from 'three'
import TWEEN from 'tween.js'
import MakeOrbitControls from 'three-orbit-controls'
const OrbitControls = MakeOrbitControls(THREE)

import particleManager from './particle-manager'

const CAMERA_MIN = 2
const CAMERA_MAX = 800

let camera, scene, renderer, controls

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
  controls = new OrbitControls(camera)

  scene = new THREE.Scene()
  // scene.fog = new THREE.FogExp2(0x000000, 0.0007)

  particleManager.addParticlesToScene(scene)

  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
  // windowHalfX = window.innerWidth / 2
  // windowHalfY = window.innerHeight / 2

  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

let isActive = false
let start
const TIME_OFFSET = 800

const ANIMATION_TIME = 30000
const SWING = 500

const zoomParam = { z: CAMERA_MIN }
const timeParam = { t: 0.00004 }
const swingParam = { s: 1 }

function render() {
  if (isActive) {
    const now = Date.now()
    const elapsed = now - start

    TWEEN.update()

    let time = (elapsed + TIME_OFFSET) * timeParam.t

    camera.position.z = zoomParam.z
    for (let i = 0; i < scene.children.length; i++) {
      let object = scene.children[i]

      if (object instanceof THREE.Points) {
        object.position.z = Math.sin(time * i) * SWING * swingParam.s
      }
    }

    if (elapsed >= ANIMATION_TIME) {
      console.log(elapsed, ANIMATION_TIME)
      isActive = false
    }
  }

  renderer.render(scene, camera)
}

export function activate() {
  isActive = true
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

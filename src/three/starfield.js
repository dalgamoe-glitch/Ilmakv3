import * as THREE from 'three'
import { starVertex, starFragment } from './shaders.js'

// Distant twinkling starfield behind the morphing particle field.
export function createStarfield(pixelRatio, count = 1600) {
  const N = count
  const pos = new Float32Array(N * 3)
  const size = new Float32Array(N)
  const phase = new Float32Array(N)
  const tint = new Float32Array(N)

  for (let i = 0; i < N; i++) {
    // shell of stars far behind the action
    const r = 45 + Math.random() * 75
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(Math.random() * 2 - 1)
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th)
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7
    pos[i * 3 + 2] = -20 - Math.abs(r * Math.cos(ph))
    size[i] = 0.6 + Math.random() * 1.6 + (Math.random() < 0.04 ? 3 : 0)
    phase[i] = Math.random()
    tint[i] = Math.random()
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
  geo.setAttribute('aTint', new THREE.BufferAttribute(tint, 1))

  const mat = new THREE.ShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geo, mat)
  points.renderOrder = 0
  return points
}

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  genTorus,
  genStrands,
  genFunnel,
  genMesh,
  genHelix,
  genTerrain,
  genBlackHole,
  genGalaxy,
  genSharedAttributes,
} from './particles.js'
import {
  particleVertex,
  particleFragment,
  holeVertex,
  holeFragment,
} from './shaders.js'
import { createStarfield } from './starfield.js'
import { progressToScene } from '../scrollMap.js'

export default function ParticleScene({ progress }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    })
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      300,
    )
    camera.position.set(0, 0, 18)

    const isSmall =
      window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4
    const N = isSmall ? 26000 : 55000

    // bake all eight formations as vertex attributes
    const torus = genTorus(N)
    const strands = genStrands(N)
    const funnel = genFunnel(N)
    const mesh = genMesh(N)
    const helix = genHelix(N)
    const terrain = genTerrain(N)
    const hole = genBlackHole(N)
    const galaxy = genGalaxy(N)
    const { aRand, aSize } = genSharedAttributes(N)

    const colA = new Float32Array(N * 3)
    const colB = new Float32Array(N * 3)
    const colC = new Float32Array(N * 2)
    for (let i = 0; i < N; i++) {
      colA[i * 3] = torus.col[i]
      colA[i * 3 + 1] = strands.col[i]
      colA[i * 3 + 2] = funnel.col[i]
      colB[i * 3] = mesh.col[i]
      colB[i * 3 + 1] = helix.col[i]
      colB[i * 3 + 2] = terrain.col[i]
      colC[i * 2] = hole.col[i]
      colC[i * 2 + 1] = galaxy.col[i]
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(torus.pos, 3))
    geo.setAttribute('aPos1', new THREE.BufferAttribute(strands.pos, 3))
    geo.setAttribute('aPos2', new THREE.BufferAttribute(funnel.pos, 3))
    geo.setAttribute('aPos3', new THREE.BufferAttribute(mesh.pos, 3))
    geo.setAttribute('aPos4', new THREE.BufferAttribute(helix.pos, 3))
    geo.setAttribute('aPos5', new THREE.BufferAttribute(terrain.pos, 3))
    geo.setAttribute('aPos6', new THREE.BufferAttribute(hole.pos, 3))
    geo.setAttribute('aPos7', new THREE.BufferAttribute(galaxy.pos, 3))
    geo.setAttribute('aColA', new THREE.BufferAttribute(colA, 3))
    geo.setAttribute('aColB', new THREE.BufferAttribute(colB, 3))
    geo.setAttribute('aColC', new THREE.BufferAttribute(colC, 2))
    geo.setAttribute('aRand', new THREE.BufferAttribute(aRand, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60)

    const mat = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uTime: { value: 0 },
        uScene: { value: 0 },
        uSize: { value: isSmall ? 3.4 : 3.0 },
        uDrift: { value: reducedMotion ? 0.04 : 0.22 },
        uPixelRatio: { value: pixelRatio },
        uAlpha: { value: 1 },
        uVel: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geo, mat)
    points.renderOrder = 1
    points.frustumCulled = false
    scene.add(points)

    const stars = createStarfield(pixelRatio)
    scene.add(stars)

    // black-hole occluder disc, drawn over the additive particles
    const holeMat = new THREE.ShaderMaterial({
      vertexShader: holeVertex,
      fragmentShader: holeFragment,
      uniforms: { uOpacity: { value: 0 } },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
    const holeMesh = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 8.2), holeMat)
    holeMesh.position.set(0, 0, 2)
    holeMesh.renderOrder = 2
    scene.add(holeMesh)

    // gentle mouse parallax
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    const onPointer = (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onPointer, { passive: true })

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let raf = 0
    // inertial scene value: the swarm chases the scroll target with a short
    // time constant, so scrubbing feels like moving mass, not a slider
    let sceneSmooth = null
    let velSmooth = 0
    let lastT = 0
    const tick = () => {
      const t = clock.getElapsedTime()
      const dt = Math.min(Math.max(t - lastT, 1e-4), 0.05)
      lastT = t
      const p = typeof progress?.get === 'function' ? progress.get() : 0
      const target = progressToScene(p)
      if (sceneSmooth === null) sceneSmooth = target
      const prev = sceneSmooth
      if (reducedMotion) {
        sceneSmooth = target
      } else {
        sceneSmooth += (target - sceneSmooth) * (1 - Math.exp(-dt / 0.11))
      }
      const vel = Math.abs(sceneSmooth - prev) / dt
      velSmooth +=
        (Math.min(vel * 0.9, 2.2) - velSmooth) * (1 - Math.exp(-dt / 0.18))
      const sceneF = sceneSmooth

      mat.uniforms.uTime.value = t
      mat.uniforms.uScene.value = sceneF
      mat.uniforms.uVel.value = reducedMotion ? 0 : velSmooth
      stars.material.uniforms.uTime.value = t

      // occluder appears only around the black-hole scene (6)
      holeMat.uniforms.uOpacity.value = THREE.MathUtils.clamp(
        1 - Math.abs(sceneF - 6) * 2.2,
        0,
        1,
      )
      const pulse = 1 + Math.sin(t * 1.4) * 0.015
      holeMesh.scale.setScalar(pulse)

      if (!reducedMotion) {
        mouse.x += (mouse.tx - mouse.x) * 0.04
        mouse.y += (mouse.ty - mouse.y) * 0.04
        camera.position.x = mouse.x * 0.9
        camera.position.y = -mouse.y * 0.6
        camera.lookAt(0, 0, 0)
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      geo.dispose()
      mat.dispose()
      stars.geometry.dispose()
      stars.material.dispose()
      holeMesh.geometry.dispose()
      holeMat.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [progress])

  return <div ref={mountRef} className="webgl-mount" aria-hidden="true" />
}

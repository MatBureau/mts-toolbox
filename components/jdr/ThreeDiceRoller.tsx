'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'

interface Props {
  results: { base: number[]; stress: number[] }
  isRolling: boolean
  onFinished?: () => void
}

export default function ThreeDiceRoller({ results, isRolling, onFinished }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const worldRef = useRef<CANNON.World | null>(null)
  const diceBoxes = useRef<{ mesh: THREE.Mesh; body: CANNON.Body; targetResult: number }[]>([])
  const requestRef = useRef<number>(0)
  const isRollingRef = useRef(isRolling)
  const onFinishedRef = useRef(onFinished)
  const hasFinishedRef = useRef(false)
  const hasStartedMovingRef = useRef(false)

  // Update refs to avoid stale closures in animate loop
  useEffect(() => {
    isRollingRef.current = isRolling
    if (isRolling) {
      hasFinishedRef.current = false
      hasStartedMovingRef.current = false
    }
  }, [isRolling])

  useEffect(() => {
    onFinishedRef.current = onFinished
  }, [onFinished])

  useEffect(() => {
    if (!containerRef.current) return

    // --- Three.js Setup ---
    const width = 600
    const height = 400
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
    camera.position.set(0, 10, 12)
    camera.lookAt(0, 0, 0)
    sceneRef.current = scene
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const spotLight = new THREE.SpotLight(0xffffff, 0.8)
    spotLight.position.set(10, 20, 10)
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024
    scene.add(spotLight)

    // Floor (Shadow receiver)
    const floorGeo = new THREE.PlaneGeometry(20, 20)
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.2 })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // --- Cannon.js Setup ---
    const world = new CANNON.World()
    world.gravity.set(0, -15, 0) // Un peu plus de gravité pour du dynamisme
    worldRef.current = world

    // Physical Floor
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
    })
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    world.addBody(groundBody)

    // Walls to keep dice in view
    const wallParams = { restitution: 0.3, friction: 0.1 }
    const addWall = (pos: CANNON.Vec3, rot: { x: number, y: number, z: number }) => {
      const wallBody = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane(), ...wallParams })
      wallBody.position.copy(pos)
      wallBody.quaternion.setFromEuler(rot.x, rot.y, rot.z)
      world.addBody(wallBody)
    }
    addWall(new CANNON.Vec3(0, 0, -6), { x: 0, y: 0, z: 0 }) // Back
    addWall(new CANNON.Vec3(0, 0, 6), { x: -Math.PI, y: 0, z: 0 }) // Front
    addWall(new CANNON.Vec3(-8, 0, 0), { x: 0, y: Math.PI / 2, z: 0 }) // Left
    addWall(new CANNON.Vec3(8, 0, 0), { x: 0, y: -Math.PI / 2, z: 0 }) // Right

    // --- Animation Loop ---
    let lastTime = performance.now()
    const animate = (time: number) => {
      requestRef.current = requestAnimationFrame(animate)
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      world.step(1/60, dt)

      let allIdle = true
      diceBoxes.current.forEach((dice) => {
        dice.mesh.position.copy(dice.body.position as any)
        dice.mesh.quaternion.copy(dice.body.quaternion as any)

        // Check if stopped
        if (dice.body.velocity.length() > 0.2 || dice.body.angularVelocity.length() > 0.2) {
          allIdle = false
          hasStartedMovingRef.current = true
        }
      })

      if (allIdle && isRollingRef.current && diceBoxes.current.length > 0 && !hasFinishedRef.current && hasStartedMovingRef.current) {
        hasFinishedRef.current = true
        // Aligner les faces avec les résultats ciblés juste avant de finir
        diceBoxes.current.forEach((dice) => {
            alignDiceFace(dice)
        })
        onFinishedRef.current?.()
      }

      renderer.render(scene, camera)
    }
    requestRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(requestRef.current)
      renderer.dispose()
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Spawning dice when results change
  useEffect(() => {
    if (!isRolling || !sceneRef.current || !worldRef.current) return

    // Clear previous dice
    diceBoxes.current.forEach(d => {
      sceneRef.current?.remove(d.mesh)
      worldRef.current?.removeBody(d.body)
    })
    diceBoxes.current = []

    const spawnDie = (result: number, isStress: boolean, index: number) => {
      const size = 1
      const geometry = new THREE.BoxGeometry(size, size, size)
      
      // Materials with numbers (canvas textures or simple colors)
      // Simplification: use colors for now, and align rotation later
      const materials = [
        new THREE.MeshStandardMaterial({ color: isStress ? 0xca8a04 : 0x404040 }), // 1 (Right)
        new THREE.MeshStandardMaterial({ color: isStress ? 0xca8a04 : 0x404040 }), // 6 (Left)
        new THREE.MeshStandardMaterial({ color: isStress ? 0xca8a04 : 0x404040 }), // 3 (Top)
        new THREE.MeshStandardMaterial({ color: isStress ? 0xca8a04 : 0x404040 }), // 4 (Bottom)
        new THREE.MeshStandardMaterial({ color: isStress ? 0xca8a04 : 0x404040 }), // 2 (Front)
        new THREE.MeshStandardMaterial({ color: isStress ? 0xca8a04 : 0x404040 }), // 5 (Back)
      ]

      // Créer textures simples pour les chiffres
      materials.forEach((m, i) => {
          const canvas = document.createElement('canvas')
          canvas.width = 128
          canvas.height = 128
          const context = canvas.getContext('2d')!
          context.fillStyle = isStress ? '#ca8a04' : '#404040'
          context.fillRect(0, 0, 128, 128)
          context.fillStyle = isStress ? '#000000' : '#ffffff'
          context.font = 'bold 80px Arial'
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          const labels = [1, 6, 3, 4, 2, 5] // Ordre standard Three.js BoxGeometry
          context.fillText(labels[i].toString(), 64, 64)
          m.map = new THREE.CanvasTexture(canvas)
      })

      const mesh = new THREE.Mesh(geometry, materials)
      mesh.castShadow = true
      sceneRef.current?.add(mesh)

      const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)),
        position: new CANNON.Vec3(
            (Math.random() - 0.5) * 4,
            8 + index * 2,
            (Math.random() - 0.5) * 4
        ),
      })
      
      // Initial velocity & spin
      body.velocity.set((Math.random() - 0.5) * 10, -5, (Math.random() - 0.5) * 10)
      body.angularVelocity.set(Math.random() * 20, Math.random() * 20, Math.random() * 20)
      body.allowSleep = true
      body.sleepSpeedLimit = 0.5
      body.sleepTimeLimit = 1

      worldRef.current?.addBody(body)
      diceBoxes.current.push({ mesh, body, targetResult: result })
    }

    results.base.forEach((r, i) => spawnDie(r, false, i))
    results.stress.forEach((r, i) => spawnDie(r, true, results.base.length + i))

  }, [isRolling, results])

  // Aligner la face du dé avec le résultat voulu
  const alignDiceFace = (dice: { mesh: THREE.Mesh; body: CANNON.Body; targetResult: number }) => {
    // 1: Right, 6: Left, 3: Top, 4: Bottom, 2: Front, 5: Back
    // On veut le targetResult en haut (Y+)
    const rotations: Record<number, THREE.Euler> = {
      1: new THREE.Euler(0, 0, Math.PI / 2),
      6: new THREE.Euler(0, 0, -Math.PI / 2),
      3: new THREE.Euler(0, 0, 0),
      4: new THREE.Euler(Math.PI, 0, 0),
      2: new THREE.Euler(-Math.PI / 2, 0, 0),
      5: new THREE.Euler(Math.PI / 2, 0, 0),
    }

    const targetRot = rotations[dice.targetResult]
    if (targetRot) {
      // Pour éviter un saut brusque, on pourrait interpoler, mais ici on le fait à l'arrêt
      // On ajuste la rotation du mesh RELATIVE au body pour que la face voulue soit UP
      dice.mesh.quaternion.copy(dice.body.quaternion as any)
      const invBodyQuat = dice.body.quaternion.clone().inverse()
      
      // On calcule la rotation nécessaire pour que la face target soit orientée vers le haut
      // C'est plus simple de tricher : quand le dé dort, on force sa rotation physique
      // pour qu'elle corresponde à un des axes parfaits, puis on ajuste le mesh.
      dice.body.quaternion.setFromEuler(0, 0, 0) // Reset temporel
      dice.mesh.rotation.copy(targetRot)
      dice.body.quaternion.copy(dice.mesh.quaternion as any)
    }
  }

  return (
    <div ref={containerRef} className="w-full flex justify-center py-4 bg-neutral-900/50 rounded-xl overflow-hidden shadow-inner">
      {/* Three.js canvas will be injected here */}
    </div>
  )
}

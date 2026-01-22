'use client'

import { useEffect, useRef, useState } from 'react'
import { Renderer, Camera, Transform, Box, Program, Mesh, Color } from 'ogl'
import { createInitialDiceState, updateDicePhysics, getFinalRotationForDice, DiceState } from '@/lib/jdr/dice-physics'

interface Props {
  results: { base: number[]; stress: number[] }
  isRolling: boolean
  onFinished?: () => void
}

export default function RealisticDice({ results, isRolling, onFinished }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [diceStates, setDiceStates] = useState<DiceState[]>([])

  useEffect(() => {
    if (!canvasRef.current || !results) return

    const renderer = new Renderer({
      canvas: canvasRef.current,
      width: 600,
      height: 400,
      alpha: true,
      antialias: true,
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)

    const camera = new Camera(gl, { fov: 35 })
    camera.position.set(0, 8, 12)
    camera.lookAt([0, 0, 0])

    const scene = new Transform()
    const geometry = new Box(gl)

    const vertex = `
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec2 uv;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragment = `
      precision highp float;
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vec3 normal = normalize(vNormal);
        float lighting = dot(normal, normalize(vec3(10, 10, 10))) * 0.5 + 0.5;
        gl_FragColor.rgb = uColor * lighting;
        gl_FragColor.a = 1.0;
        
        // Simuler des points de dés plus arrondis
        float dist = distance(vUv, vec2(0.5, 0.5));
        if (dist < 0.1) {
           gl_FragColor.rgb *= 0.2;
        }
      }
    `

    const initialStates: DiceState[] = [
      ...results.base.map(r => createInitialDiceState(r)),
      ...results.stress.map(r => createInitialDiceState(r))
    ]
    setDiceStates(initialStates)

    const meshes = initialStates.map((state, i) => {
      const isStress = i >= results.base.length
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uColor: { value: isStress ? new Color('#ca8a04') : new Color('#404040') },
        },
      })
      const mesh = new Mesh(gl, { geometry, program })
      mesh.setParent(scene)
      return mesh
    })

    let requestID: number
    let lastTime = performance.now()

    const update = (time: number) => {
      requestID = requestAnimationFrame(update)
      const dt = (time - lastTime) / 1000
      lastTime = time

      let allStable = true;
      initialStates.forEach((state, i) => {
        const updated = updateDicePhysics(state, dt)
        initialStates[i] = updated
        
        meshes[i].position.set(updated.position.x, updated.position.y, updated.position.z)
        meshes[i].rotation.set(updated.rotation.x, updated.rotation.y, updated.rotation.z)
        
        if (updated.isStable) {
          const final = getFinalRotationForDice(updated.result)
          meshes[i].rotation.set(final.x, final.y, final.z)
        } else {
          allStable = false;
        }
      })

      if (allStable && isRolling) {
        onFinished?.()
      }

      renderer.render({ scene, camera })
    }

    requestID = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(requestID)
    }
  }, [results])

  return (
    <div ref={containerRef} className="w-full flex justify-center py-4">
      <canvas ref={canvasRef} width={600} height={400} className="max-w-full h-auto" />
    </div>
  )
}

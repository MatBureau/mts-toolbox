'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { PalletizationResult, PalletSpec } from '@/lib/palette/packing'

export interface SceneApi {
  /** Capture PNG de la vue courante (pour le PDF) */
  snapshot: () => string | null
  resetView: () => void
}

interface PalletScene3DProps {
  result: PalletizationResult
  pallet: PalletSpec
  visibleLayers: number
  onReady?: (api: SceneApi) => void
}

const MM = 0.001 // la scène est en mètres
const KRAFT = new THREE.Color('#c9a26b')
const KRAFT_ALT = new THREE.Color('#b88d55')
const KRAFT_PARTIAL = new THREE.Color('#d9b98a')
const WOOD = new THREE.Color('#b5895a')
const WOOD_DARK = new THREE.Color('#8a6238')

// Palette bois générique : planches de dessus, traverses, 9 dés, semelles
function buildPallet(p: PalletSpec): THREE.Group {
  const group = new THREE.Group()
  const L = p.length, W = p.width, H = p.height
  const board = 22
  const blockH = Math.max(20, H - 3 * board)
  const wood = new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.9 })
  const woodDark = new THREE.MeshStandardMaterial({ color: WOOD_DARK, roughness: 0.95 })

  const add = (sx: number, sy: number, sz: number, x: number, y: number, z: number, mat: THREE.Material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx * MM, sy * MM, sz * MM), mat)
    mesh.position.set(x * MM, y * MM, z * MM)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }

  const blockW = Math.min(145, W / 5)
  const blockL = Math.min(145, L / 6)
  const xs = [blockL / 2, L / 2, L - blockL / 2]
  const zs = [blockW / 2, W / 2, W - blockW / 2]

  // Semelles (dessous), le long de la longueur
  for (const z of zs) add(L, board, blockW, L / 2, board / 2, z, woodDark)
  // Dés
  for (const x of xs) for (const z of zs) add(blockL, blockH, blockW, x, board + blockH / 2, z, woodDark)
  // Traverses, le long de la largeur
  for (const x of xs) add(blockL, board, W, x, board + blockH + board / 2, W / 2, wood)
  // Planches de dessus, le long de la longueur, avec des jours entre elles
  const planks = 5
  const plankW = W / (planks * 1.35)
  for (let i = 0; i < planks; i++) {
    const z = plankW / 2 + (i * (W - plankW)) / (planks - 1)
    add(L, board, plankW, L / 2, H - board / 2, z, wood)
  }
  return group
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse(child => {
    const mesh = child as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const mat = (mesh as THREE.Mesh).material
    if (Array.isArray(mat)) mat.forEach(m => m.dispose())
    else if (mat) (mat as THREE.Material).dispose()
  })
}

export default function PalletScene3D({ result, pallet, visibleLayers, onReady }: PalletScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ctx = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    content: THREE.Group | null
    fittedKey: string | null // géométrie pour laquelle la caméra a été cadrée
    render: () => void
    fit: () => void
  } | null>(null)

  // Mise en place unique de la scène
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)
    renderer.domElement.style.touchAction = 'none'
    renderer.domElement.setAttribute('aria-label', 'Vue 3D de la palette, faites glisser pour tourner')

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.1))
    const sun = new THREE.DirectionalLight(0xffffff, 1.6)
    sun.position.set(2.5, 4, 1.8)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -2.5
    sun.shadow.camera.right = 2.5
    sun.shadow.camera.top = 2.5
    sun.shadow.camera.bottom = -2.5
    sun.shadow.bias = -0.0005
    scene.add(sun)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.28 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.minPolarAngle = 0.05
    controls.maxPolarAngle = Math.PI / 2 - 0.02

    const render = () => renderer.render(scene, camera)
    controls.addEventListener('change', render)

    const fit = () => {
      const content = ctx.current?.content
      if (!content) return
      const bbox = new THREE.Box3().setFromObject(content)
      const size = bbox.getSize(new THREE.Vector3())
      const center = bbox.getCenter(new THREE.Vector3())
      // Sphère englobante cadrée dans le plus petit des deux champs de vision (portrait sur mobile)
      const radius = size.length() / 2
      const vFov = (camera.fov * Math.PI) / 180
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect)
      const dist = (radius / Math.sin(Math.min(vFov, hFov) / 2)) * 0.92
      controls.target.copy(center)
      camera.position.copy(center).addScaledVector(new THREE.Vector3(0.75, 0.6, 0.85).normalize(), dist)
      controls.minDistance = radius * 0.6
      controls.maxDistance = dist * 3
      controls.update()
      render()
    }

    const resize = () => {
      const { clientWidth, clientHeight } = container
      if (!clientWidth || !clientHeight) return
      renderer.setSize(clientWidth, clientHeight)
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      render()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    ctx.current = { renderer, scene, camera, controls, content: null, fittedKey: null, render, fit }
    resize()

    onReady?.({
      snapshot: () => {
        render()
        return renderer.domElement.toDataURL('image/png')
      },
      resetView: fit,
    })

    return () => {
      observer.disconnect()
      controls.dispose()
      if (ctx.current?.content) disposeObject(ctx.current.content)
      disposeObject(scene)
      renderer.dispose()
      renderer.domElement.remove()
      ctx.current = null
    }
    // onReady n'est lu qu'à la création
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reconstruction du contenu quand le résultat change
  const geometryKey = JSON.stringify([result.layer.count, result.orientation, result.fullLayers, result.lastLayerCount, result.zone, pallet])
  useEffect(() => {
    const c = ctx.current
    if (!c) return
    if (c.content) {
      c.scene.remove(c.content)
      disposeObject(c.content)
    }

    const content = new THREE.Group()
    const palletGroup = buildPallet(pallet)
    content.add(palletGroup)

    const { rects } = result.layer
    const h = result.orientation.height
    const layersTotal = result.fullLayers + (result.lastLayerCount > 0 ? 1 : 0)
    const shown = Math.min(visibleLayers, layersTotal)
    const instances: { r: (typeof rects)[number]; layer: number }[] = []
    for (let layer = 0; layer < shown; layer++) {
      const n = layer < result.fullLayers ? rects.length : result.lastLayerCount
      for (let i = 0; i < n; i++) instances.push({ r: rects[i], layer })
    }

    if (instances.length > 0) {
      const gap = 1.5 // mm de jeu visuel entre colis, pour lire les arêtes
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 })
      const mesh = new THREE.InstancedMesh(geometry, material, instances.length)
      mesh.castShadow = true
      mesh.receiveShadow = true
      const m = new THREE.Matrix4()
      const off = result.zone.offset
      const edgePositions = new Float32Array(instances.length * 24 * 3)
      let e = 0
      instances.forEach(({ r, layer }, idx) => {
        const x0 = (r.x - off + gap / 2) * MM, x1 = (r.x - off + r.l - gap / 2) * MM
        const z0 = (r.y - off + gap / 2) * MM, z1 = (r.y - off + r.w - gap / 2) * MM
        const y0 = (pallet.height + layer * h) * MM, y1 = (pallet.height + (layer + 1) * h - gap) * MM
        m.compose(
          new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2),
          new THREE.Quaternion(),
          new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0)
        )
        mesh.setMatrixAt(idx, m)
        const partial = layer >= result.fullLayers
        mesh.setColorAt(idx, partial ? KRAFT_PARTIAL : layer % 2 ? KRAFT_ALT : KRAFT)

        // 12 arêtes
        const corners = [
          [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1],
          [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1],
        ]
        const pairs = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
        for (const [a, b] of pairs) {
          edgePositions.set(corners[a], e); e += 3
          edgePositions.set(corners[b], e); e += 3
        }
      })
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      content.add(mesh)

      const edges = new THREE.BufferGeometry()
      edges.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3))
      content.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x5c4326, transparent: true, opacity: 0.55 })))
    }

    // Centrer la palette sur l'origine
    content.position.set((-pallet.length / 2) * MM, 0, (-pallet.width / 2) * MM)
    c.scene.add(content)
    c.content = content

    // Recadrer quand la géométrie change ou que la scène est neuve, pas en feuilletant les couches
    if (c.fittedKey !== geometryKey) {
      c.fittedKey = geometryKey
      c.fit()
    } else {
      c.render()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometryKey, visibleLayers])

  return <div ref={containerRef} className="absolute inset-0" />
}

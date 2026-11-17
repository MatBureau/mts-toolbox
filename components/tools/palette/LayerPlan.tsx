import type { Rect } from '@/lib/palette/packing'

interface LayerPlanProps {
  /** Zone de rangement (palette + débord, ou plancher du véhicule), en mm */
  zone: { length: number; width: number }
  /** Contour de la palette dans la zone (absent pour un véhicule) */
  inner?: { length: number; width: number; offset: number }
  rects: Rect[]
  /** Emprise de référence : les rects tournés de 90° sont colorés autrement */
  footprint: { a: number; b: number }
  title: string
  showNumbers?: boolean
}

const fmt = (mm: number) => mm.toLocaleString('fr-FR')

export default function LayerPlan({ zone, inner, rects, footprint, title, showNumbers = true }: LayerPlanProps) {
  // Marges pour les cotes
  const pad = Math.max(zone.length, zone.width) * 0.07
  const vbW = zone.length + pad * 2
  const vbH = zone.width + pad * 2
  const stroke = Math.max(zone.length, zone.width) / 400
  const font = Math.max(zone.length, zone.width) / 30
  const numbers = showNumbers && rects.length <= 120

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="w-full h-auto text-gray-700 dark:text-gray-300"
        role="img"
        aria-label={`${title} : ${rects.length} éléments`}
      >
        <g transform={`translate(${pad} ${pad})`}>
          {/* Zone */}
          <rect
            x={0}
            y={0}
            width={zone.length}
            height={zone.width}
            fill="currentColor"
            fillOpacity={0.05}
            stroke="currentColor"
            strokeOpacity={inner ? 0.35 : 0.8}
            strokeWidth={stroke}
            strokeDasharray={inner ? `${stroke * 4} ${stroke * 3}` : undefined}
          />
          {inner && (
            <rect
              x={inner.offset}
              y={inner.offset}
              width={inner.length}
              height={inner.width}
              fill="#b5895a"
              fillOpacity={0.25}
              stroke="#b5895a"
              strokeWidth={stroke * 1.5}
            />
          )}
          {rects.map((r, i) => {
            const rotated = !(r.l === footprint.a && r.w === footprint.b)
            return (
              <g key={i}>
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.l}
                  height={r.w}
                  fill={rotated ? '#38bdf8' : '#d4a373'}
                  fillOpacity={rotated ? 0.55 : 0.75}
                  stroke="currentColor"
                  strokeOpacity={0.7}
                  strokeWidth={stroke}
                />
                {numbers && (
                  <text
                    x={r.x + r.l / 2}
                    y={r.y + r.w / 2}
                    fontSize={Math.min(font, r.w * 0.45, r.l * 0.35)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="currentColor"
                    fontWeight={600}
                  >
                    {i + 1}
                  </text>
                )}
              </g>
            )
          })}
          {/* Cotes */}
          <text x={zone.length / 2} y={-pad * 0.35} fontSize={font} textAnchor="middle" fill="currentColor">
            {fmt(inner ? inner.length : zone.length)} mm
          </text>
          <text
            x={-pad * 0.35}
            y={zone.width / 2}
            fontSize={font}
            textAnchor="middle"
            fill="currentColor"
            transform={`rotate(-90 ${-pad * 0.35} ${zone.width / 2})`}
          >
            {fmt(inner ? inner.width : zone.width)} mm
          </text>
        </g>
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-medium text-gray-700 dark:text-gray-300">{title}</span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#d4a373' }} /> sens {fmt(footprint.a)} × {fmt(footprint.b)}
        </span>
        {rects.some(r => !(r.l === footprint.a && r.w === footprint.b)) && (
          <span className="inline-flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#38bdf8' }} /> tourné à 90°
          </span>
        )}
        {inner && inner.offset > 0 && <span>pointillés : débord autorisé</span>}
      </figcaption>
    </figure>
  )
}

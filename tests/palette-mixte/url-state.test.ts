import { describe, it, expect } from 'vitest'
import { packOrder, unpackOrder } from '@/lib/palette-mixte/url-state'
import { defaultOrder } from '@/lib/palette-mixte/form'

describe('commande dans le lien', () => {
  it('relit une commande empaquetée', () => {
    const order = defaultOrder()
    const back = unpackOrder(JSON.parse(JSON.stringify(packOrder(order))))
    expect(back?.refs.map(r => [r.length, r.width, r.height, r.quantity])).toEqual(order.refs.map(r => [r.length, r.width, r.height, r.quantity]))
  })

  it('remplace les caractères de contrôle des noms (C0, DEL et C1)', () => {
    const packed = packOrder(defaultOrder())
    packed.r[0][0] = 'A\u0000B\u001FC\u007FD\u0085E\u009FF'
    expect(unpackOrder(packed)?.refs[0].name).toBe('A B C D E F')
  })
})

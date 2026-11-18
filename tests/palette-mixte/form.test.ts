import { describe, it, expect } from 'vitest'
import { defaultOrder, emptyRef, formToEngine, type OrderForm } from '@/lib/palette-mixte/form'
import { decodeOrder, encodeOrder, unpackOrder } from '@/lib/palette-mixte/url-state'

const withoutIds = (o: OrderForm) => ({ ...o, refs: o.refs.map(({ id: _id, ...rest }) => rest) })

describe('saisie', () => {
  it('convertit la saisie en entrées du moteur', () => {
    const { refs, settings, incomplete } = formToEngine(defaultOrder())
    expect(refs).toHaveLength(3)
    expect(refs[0]).toMatchObject({ name: 'Colis 1', length: 600, width: 400, height: 400, quantity: 12, weight: 15, upright: true, maxLoadOnTop: null, stop: 1 })
    expect(settings).toEqual({ pallet: { length: 1200, width: 800, height: 144, tare: 25 }, maxHeight: 1800, maxLoad: 1000, overhang: 0 })
    expect(incomplete).toBe(0)
  })

  it('ignore les références incomplètes ; poids vide = inconnu ; quantité vide = 1', () => {
    const form = defaultOrder()
    form.refs.push(emptyRef(4))
    form.refs[1] = { ...form.refs[1], weight: '', quantity: '' }
    const { refs, incomplete } = formToEngine(form)
    expect(incomplete).toBe(1)
    expect(refs[1]).toMatchObject({ weight: null, quantity: 1 })
  })
})

describe('lien partageable', () => {
  it('aller-retour sans perte', async () => {
    const form = defaultOrder()
    form.refs[1] = { ...form.refs[1], maxLoadOnTop: '40', stop: '2', keepTogether: true, upright: false }
    const back = await decodeOrder(await encodeOrder(form))
    expect(back).not.toBeNull()
    expect(withoutIds(back!)).toEqual(withoutIds(form))
  })

  it('refuse un lien corrompu', async () => {
    expect(await decodeOrder('xabc')).toBeNull()
    expect(await decodeOrder('j!!!')).toBeNull()
  })

  it('assainit les valeurs reçues', () => {
    const o = unpackOrder({ v: 1, p: ['eur', '1', '1', '1', '1', '2000', 'abc', '5', 0], r: [['X'.repeat(60), '600', '400', '<b>', '2', '', 1, 0, '', 0, '1']] })
    expect(o).not.toBeNull()
    expect(o!.palletLength).toBe('1200')
    expect(o!.maxLoad).toBe('')
    expect(o!.refs[0].name).toHaveLength(40)
    expect(o!.refs[0].height).toBe('')
  })
})

describe('lien partagé : limites et nettoyage', () => {
  const b64url = (b: Uint8Array) => {
    let bin = ''
    for (const x of b) bin += String.fromCharCode(x)
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  it('refuse un code trop long', async () => {
    expect(await decodeOrder('j' + 'A'.repeat(20_001))).toBeNull()
  })

  it('refuse une bombe de décompression', async () => {
    const stream = new Blob([new Uint8Array(2_000_000)]).stream().pipeThrough(new CompressionStream('deflate-raw'))
    const code = 'z' + b64url(new Uint8Array(await new Response(stream).arrayBuffer()))
    expect(code.length).toBeLessThan(20_000)
    expect(await decodeOrder(code)).toBeNull()
  })

  it('refuse un JSON brut trop gros', async () => {
    const big = new TextEncoder().encode('"' + 'a'.repeat(110_000) + '"')
    expect(await decodeOrder('j' + b64url(big))).toBeNull()
  })

  it('remplace les caractères de contrôle des noms', () => {
    const o = unpackOrder({ v: 1, p: [], r: [['Carton\nA\tB\u0085', '1', '1', '1', '1', '', 1, 0, '', 0, '1']] })
    expect(o?.refs[0].name).toBe('Carton A B')
  })
})

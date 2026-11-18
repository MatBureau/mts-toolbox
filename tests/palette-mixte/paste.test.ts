import { describe, it, expect } from 'vitest'
import { parsePastedReferences } from '@/lib/palette-mixte/paste'

describe('collage Excel', () => {
  it('lit des lignes tabulées (copie depuis Excel)', () => {
    expect(parsePastedReferences('Carton A\t600\t400\t400\t12\t15').rows).toEqual([
      { name: 'Carton A', length: '600', width: '400', height: '400', quantity: '12', weight: '15' },
    ])
  })

  it('ignore l’en-tête et lit les décimales à virgule', () => {
    const r = parsePastedReferences('nom;L;l;H;quantité;poids\nCarton B;400;300;250;5;6,5')
    expect(r.rows).toEqual([{ name: 'Carton B', length: '400', width: '300', height: '250', quantity: '5', weight: '6.5' }])
    expect(r.errors).toEqual([])
  })

  it('accepte une ligne sans nom, séparée par des virgules', () => {
    expect(parsePastedReferences('500,300,200,3').rows).toEqual([
      { name: '', length: '500', width: '300', height: '200', quantity: '3', weight: '' },
    ])
  })

  it('quantité absente : 1', () => {
    expect(parsePastedReferences('C\t100\t100\t100').rows[0].quantity).toBe('1')
  })

  it('signale les lignes illisibles avec leur numéro', () => {
    const r = parsePastedReferences('A\t100\t100\t100\nn’importe quoi\nB\t200\t200\t200')
    expect(r.rows).toHaveLength(2)
    expect(r.errors).toEqual([{ line: 2, message: 'trois dimensions numériques attendues (L, l, H en mm)' }])
  })

  it('remplace les caractères de contrôle des noms', () => {
    expect(parsePastedReferences('Carton\u0085A\t600\t400\t400').rows[0].name).toBe('Carton A')
  })
})

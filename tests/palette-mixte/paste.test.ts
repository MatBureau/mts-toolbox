import { describe, it, expect } from 'vitest'
import { leftoverPaste, parsePastedReferences } from '@/lib/palette-mixte/paste'

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

  it('donne la ligne source de chaque entrée lue (et de l’en-tête)', () => {
    const r = parsePastedReferences('nom;L;l;H\n\nA;100;100;100\nillisible\nB;200;200;200')
    expect(r.lines).toEqual([3, 5])
    expect(r.header).toBe(1)
    expect(r.errors.map(e => e.line)).toEqual([4])
    expect(parsePastedReferences('A;100;100;100').header).toBeNull()
  })

  it('remplace les caractères de contrôle des noms', () => {
    expect(parsePastedReferences('Carton\u0085A\t600\t400\t400').rows[0].name).toBe('Carton A')
  })

  it('après un import partiel, ne garde que les lignes en erreur et celles non importées (en-tête conservé)', () => {
    const text = 'nom;L;l;H\nA;100;100;100\nillisible\nB;200;200;200\nC;300;300;300\n\nautre erreur'
    const res = parsePastedReferences(text)
    const left = leftoverPaste(text, res, 2) // A et B importés, C refusé (limite)
    expect(left.text).toBe('nom;L;l;H\nillisible\nC;300;300;300\nautre erreur')
    expect(left.errors.map(e => e.line)).toEqual([2, 4])
    // Le texte restant se relit à l'identique : rien n'est importé deux fois
    const again = parsePastedReferences(left.text)
    expect(again.rows.map(r => r.name)).toEqual(['C'])
    expect(again.errors).toEqual(left.errors)
  })

  it('tout importé : il ne reste rien', () => {
    const text = 'A;100;100;100\nB;200;200;200'
    expect(leftoverPaste(text, parsePastedReferences(text), 2)).toEqual({ text: '', errors: [] })
  })
})

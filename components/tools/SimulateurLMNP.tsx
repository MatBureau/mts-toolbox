'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Euro, Building, Percent, TrendingUp, Info } from 'lucide-react'

export default function SimulateurLMNP() {
  const [params, setParams] = useState({
    prixBien: 200000,
    fraisNotaire: 15000,
    travaux: 10000,
    meubles: 5000,
    apport: 20000,
    loyerMensuel: 900,
    tmi: 30, // Tranche Marginale d'Imposition (0, 11, 30, 41, 45)
    
    // Charges annuelles
    taxeFonciere: 800,
    chargesCopro: 1200,
    assurances: 200,
    fraisGestion: 0, // %
    
    // Financement
    dureeCredit: 20,
    tauxCredit: 3.5,
    tauxAssurance: 0.3,
  })

  // Results state
  const [results, setResults] = useState<any>(null)

  const calculate = () => {
    // 1. Financement
    const montantEmprunte = params.prixBien + params.fraisNotaire + params.travaux + params.meubles - params.apport
    const tauxMensuel = params.tauxCredit / 100 / 12
    const nbMensualites = params.dureeCredit * 12
    const mensualiteCredit = (montantEmprunte * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -nbMensualites))
    const interetsAnnuelsMoyens = (mensualiteCredit * nbMensualites - montantEmprunte) / params.dureeCredit // Simplified average

    // 2. Revenus
    const revenusAnnuels = params.loyerMensuel * 12

    // 3. Régime Micro-BIC
    const abattementMicro = 0.50
    const assieteImpotMicro = revenusAnnuels * (1 - abattementMicro)
    const impotMicro = assieteImpotMicro * (params.tmi / 100)
    const csgMicro = assieteImpotMicro * 0.172
    const totalImpotMicro = impotMicro + csgMicro
    const cashflowMicro = revenusAnnuels - totalImpotMicro - params.taxeFonciere - params.chargesCopro - params.assurances - (mensualiteCredit * 12)

    // 4. Régime Réel
    // Amortissements (Simplifiés)
    const amortissementBien = (params.prixBien * 0.90) / 30 // 90% valeur bâti sur 30 ans
    const amortissementTravaux = params.travaux / 10
    const amortissementMeubles = params.meubles / 7
    const amortissementTotal = amortissementBien + amortissementTravaux + amortissementMeubles
    const amortissementFraisNotaire = params.fraisNotaire / 5 // Often passed in charges but can be amortized logic varies, let's say amortized over 5 years for simplicity

    const totalChargesDeductibles = 
      params.taxeFonciere + 
      params.chargesCopro + 
      params.assurances + 
      (revenusAnnuels * (params.fraisGestion / 100)) +
      interetsAnnuelsMoyens +
      amortissementFraisNotaire // Or charge immediate
    
    const resultatComptable = revenusAnnuels - totalChargesDeductibles - amortissementTotal
    
    // Deficit or Benefice
    const assieteImpotReel = Math.max(0, resultatComptable)
    const impotReel = assieteImpotReel * (params.tmi / 100)
    const csgReel = assieteImpotReel * 0.172
    const totalImpotReel = impotReel + csgReel
    
    // Cashflow Réel (Amortization is not cash out)
    const cashflowReel = revenusAnnuels 
      - totalImpotReel 
      - params.taxeFonciere 
      - params.chargesCopro 
      - params.assurances 
      - (revenusAnnuels * (params.fraisGestion / 100)) 
      - (mensualiteCredit * 12)

    setResults({
      micro: {
        impot: totalImpotMicro,
        cashflow: cashflowMicro,
        details: { impot: impotMicro, csg: csgMicro }
      },
      reel: {
        impot: totalImpotReel,
        cashflow: cashflowReel,
        amortissement: amortissementTotal,
        resultatComptable,
        details: { impot: impotReel, csg: csgReel }
      },
      mensualite: mensualiteCredit
    })
  }

  const InputGroup = ({ label, value, onChange, prefix = null, suffix = null, step = "1" }: any) => (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>}
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full p-2.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Formulaire */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building size={20} className="text-primary-600" />
              Le Projet
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Prix du bien" value={params.prixBien} onChange={(v: number) => setParams({...params, prixBien: v})} suffix="€" />
              <InputGroup label="Frais de notaire" value={params.fraisNotaire} onChange={(v: number) => setParams({...params, fraisNotaire: v})} suffix="€" />
              <InputGroup label="Travaux" value={params.travaux} onChange={(v: number) => setParams({...params, travaux: v})} suffix="€" />
              <InputGroup label="Mobilier" value={params.meubles} onChange={(v: number) => setParams({...params, meubles: v})} suffix="€" />
              <InputGroup label="Apport personnel" value={params.apport} onChange={(v: number) => setParams({...params, apport: v})} suffix="€" />
              <InputGroup label="Loyer mensuel HC" value={params.loyerMensuel} onChange={(v: number) => setParams({...params, loyerMensuel: v})} suffix="€" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Euro size={20} className="text-primary-600" />
              Charges & Fiscalité
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Taxe Foncière / an" value={params.taxeFonciere} onChange={(v: number) => setParams({...params, taxeFonciere: v})} suffix="€" />
              <InputGroup label="Charges copro / an" value={params.chargesCopro} onChange={(v: number) => setParams({...params, chargesCopro: v})} suffix="€" />
              <InputGroup label="Votre TMI" value={params.tmi} onChange={(v: number) => setParams({...params, tmi: v})} suffix="%" step="1" />
              <InputGroup label="Frais Gestion" value={params.fraisGestion} onChange={(v: number) => setParams({...params, fraisGestion: v})} suffix="%" step="0.1" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Percent size={20} className="text-primary-600" />
              Financement
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Durée" value={params.dureeCredit} onChange={(v: number) => setParams({...params, dureeCredit: v})} suffix="ans" />
              <InputGroup label="Taux Crédit" value={params.tauxCredit} onChange={(v: number) => setParams({...params, tauxCredit: v})} suffix="%" step="0.05" />
            </div>
          </div>
          
          <button
            onClick={calculate}
            className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
          >
            <TrendingUp size={24} />
            Lancer la Simulation
          </button>
        </div>

        {/* Résultats */}
        <div className="space-y-6">
          {!results ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <Building size={48} className="mb-4 opacity-50" />
              <p>Remplissez les informations et lancez le calcul pour voir le comparatif.</p>
            </div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }}
               className="space-y-6"
             >
                {/* Winner Badge */}
                <div className={`p-4 rounded-xl text-center font-bold text-xl text-white shadow-md ${
                  results.reel.cashflow > results.micro.cashflow ? 'bg-green-600' : 'bg-blue-600'
                }`}>
                   Le régime {results.reel.cashflow > results.micro.cashflow ? 'RÉEL' : 'MICRO-BIC'} est plus avantageux !
                   <div className="text-sm font-normal opacity-90 mt-1">
                     Gain annuel estimé : +{Math.abs(results.reel.cashflow - results.micro.cashflow).toFixed(0)} €
                   </div>
                </div>

                {/* Comparatif Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* MICRO */}
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                     <h4 className="text-blue-600 font-bold mb-4 uppercase text-sm tracking-wider">Régime Micro-BIC</h4>
                     
                     <div className="space-y-3">
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Impôts + CSG</span>
                         <span className="font-medium text-red-500">-{results.micro.impot.toFixed(0)} €</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Cashflow net</span>
                         <span className={`font-bold ${results.micro.cashflow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {results.micro.cashflow.toFixed(0)} €/an
                         </span>
                       </div>
                     </div>
                  </div>

                  {/* REEL */}
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                     <h4 className="text-green-600 font-bold mb-4 uppercase text-sm tracking-wider">Régime Réel</h4>
                     
                     <div className="space-y-3">
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Amortissements</span>
                         <span className="font-medium text-gray-400">-{results.reel.amortissement.toFixed(0)} €</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Impôts + CSG</span>
                         <span className="font-medium text-red-500">-{results.reel.impot.toFixed(0)} €</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Cashflow net</span>
                         <span className={`font-bold ${results.reel.cashflow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {results.reel.cashflow.toFixed(0)} €/an
                         </span>
                       </div>
                     </div>
                  </div>
                </div>

                {/* Mensualité Info */}
                <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-100 dark:border-orange-900/50 flex items-start gap-3">
                  <Info className="text-orange-500 shrink-0 mt-0.5" size={18} />
                  <div className="text-sm text-orange-800 dark:text-orange-200">
                    <span className="font-bold">Mensualité de crédit estimée :</span> {results.mensualite.toFixed(0)} €/mois.
                    <br/>
                    Le régime Réel permet de déduire cette charge d'intérêts et d'amortir le bien pour réduire, voire annuler votre impôt sur les loyers pendant des années.
                  </div>
                </div>
             </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

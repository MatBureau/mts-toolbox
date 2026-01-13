'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import {
  MaconnerieProject,
  MaconnerieElement,
  ElementType,
  DosageType,
  ProjectTotals,
  ElementFormState,
  DalleElement,
  MurElement,
  SemelleElement,
  OuvertureElement,
} from '@/lib/maconnerie/types'
import {
  calculateProjectTotals,
  generateId,
  formatNumber,
  parseDecimal,
  validatePositive,
} from '@/lib/maconnerie/calculations'
import {
  ELEMENT_LABELS,
  ELEMENT_ICONS,
  DOSAGE_LABELS,
  DOSAGE_PRESETS,
  DEFAULT_EPAISSEURS,
  EPAISSEUR_PRESETS,
  DEFAULT_PROJECT,
  STORAGE_KEY,
  DEBOUNCE_MS,
  POIDS_SAC_OPTIONS,
  ARRONDI_TOUPIE_OPTIONS,
} from '@/lib/maconnerie/constants'
import { generateProjectPDF } from '@/lib/maconnerie/pdf-generator'

// État initial du formulaire
const initialFormState: ElementFormState = {
  type: 'dalle',
  nom: '',
  longueur: '',
  largeur: '',
  hauteur: '',
  epaisseur: '',
  quantite: '1',
}

export default function Maconnerie() {
  // État du projet
  const [project, setProject] = useState<MaconnerieProject | null>(null)
  const [totals, setTotals] = useState<ProjectTotals | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // État du formulaire
  const [form, setForm] = useState<ElementFormState>(initialFormState)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // État UI
  const [generating, setGenerating] = useState(false)
  const [showParams, setShowParams] = useState(false)
  const [editingElement, setEditingElement] = useState<string | null>(null)

  // Ref pour l'input file
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Charger le projet depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MaconnerieProject
        setProject(parsed)
      } catch {
        // Créer un nouveau projet si le parsing échoue
        createNewProject()
      }
    } else {
      createNewProject()
    }
  }, [])

  // Auto-save avec debounce
  useEffect(() => {
    if (!project) return

    const timer = setTimeout(() => {
      const updated = { ...project, updatedAt: new Date().toISOString() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setLastSaved(new Date())
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [project])

  // Recalculer les totaux quand le projet change
  useEffect(() => {
    if (project && project.elements.length > 0) {
      setTotals(calculateProjectTotals(project))
    } else {
      setTotals(null)
    }
  }, [project])

  // Mettre à jour l'épaisseur par défaut quand le type change
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      epaisseur: DEFAULT_EPAISSEURS[prev.type].toString(),
    }))
  }, [form.type])

  // Créer un nouveau projet
  const createNewProject = useCallback(() => {
    const newProject: MaconnerieProject = {
      ...DEFAULT_PROJECT,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProject(newProject)
    setForm(initialFormState)
    setEditingElement(null)
  }, [])

  // Mettre à jour le projet
  const updateProject = useCallback((updates: Partial<MaconnerieProject>) => {
    setProject(prev => prev ? { ...prev, ...updates } : prev)
  }, [])

  // Valider le formulaire
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!form.nom.trim()) {
      errors.nom = 'Nom requis'
    }

    if (!validatePositive(form.longueur)) {
      errors.longueur = 'Valeur positive requise'
    }

    if (form.type !== 'mur' && !validatePositive(form.largeur)) {
      errors.largeur = 'Valeur positive requise'
    }

    if (form.type === 'mur' && !validatePositive(form.hauteur)) {
      errors.hauteur = 'Valeur positive requise'
    }

    if (form.type === 'semelle' && !validatePositive(form.hauteur)) {
      errors.hauteur = 'Valeur positive requise'
    }

    if (form.type === 'ouverture') {
      if (!validatePositive(form.hauteur)) {
        errors.hauteur = 'Valeur positive requise'
      }
      if (!validatePositive(form.quantite)) {
        errors.quantite = 'Valeur positive requise'
      }
    }

    if (!validatePositive(form.epaisseur)) {
      errors.epaisseur = 'Valeur positive requise'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Ajouter ou modifier un élément
  const handleSubmitElement = () => {
    if (!project || !validateForm()) return

    const baseElement = {
      id: editingElement || generateId(),
      nom: form.nom.trim(),
      createdAt: editingElement
        ? project.elements.find(e => e.id === editingElement)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    }

    let newElement: MaconnerieElement

    switch (form.type) {
      case 'dalle':
        newElement = {
          ...baseElement,
          type: 'dalle',
          longueur: parseDecimal(form.longueur),
          largeur: parseDecimal(form.largeur),
          epaisseur: parseDecimal(form.epaisseur),
        } as DalleElement
        break
      case 'mur':
        newElement = {
          ...baseElement,
          type: 'mur',
          longueur: parseDecimal(form.longueur),
          hauteur: parseDecimal(form.hauteur),
          epaisseur: parseDecimal(form.epaisseur),
        } as MurElement
        break
      case 'semelle':
        newElement = {
          ...baseElement,
          type: 'semelle',
          longueur: parseDecimal(form.longueur),
          largeur: parseDecimal(form.largeur),
          hauteur: parseDecimal(form.hauteur),
        } as SemelleElement
        break
      case 'ouverture':
        newElement = {
          ...baseElement,
          type: 'ouverture',
          largeur: parseDecimal(form.largeur),
          hauteur: parseDecimal(form.hauteur),
          epaisseur: parseDecimal(form.epaisseur),
          quantite: Math.max(1, Math.floor(parseDecimal(form.quantite))),
        } as OuvertureElement
        break
      default:
        return
    }

    if (editingElement) {
      // Modification
      updateProject({
        elements: project.elements.map(e => e.id === editingElement ? newElement : e),
      })
      setEditingElement(null)
    } else {
      // Ajout
      updateProject({
        elements: [...project.elements, newElement],
      })
    }

    // Reset du formulaire (garder le type)
    setForm({
      ...initialFormState,
      type: form.type,
      epaisseur: DEFAULT_EPAISSEURS[form.type].toString(),
    })
    setFormErrors({})
  }

  // Éditer un élément
  const handleEditElement = (element: MaconnerieElement) => {
    setEditingElement(element.id)
    setForm({
      type: element.type,
      nom: element.nom,
      longueur: element.type !== 'ouverture' ? element.longueur.toString() : '',
      largeur: 'largeur' in element ? element.largeur.toString() : '',
      hauteur: 'hauteur' in element ? element.hauteur.toString() : '',
      epaisseur: 'epaisseur' in element ? element.epaisseur.toString() : '',
      quantite: element.type === 'ouverture' ? element.quantite.toString() : '1',
    })
    setFormErrors({})
  }

  // Supprimer un élément
  const handleDeleteElement = (id: string) => {
    if (!project) return
    if (confirm('Supprimer cet élément ?')) {
      updateProject({
        elements: project.elements.filter(e => e.id !== id),
      })
      if (editingElement === id) {
        setEditingElement(null)
        setForm({ ...initialFormState, type: form.type })
      }
    }
  }

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingElement(null)
    setForm({
      ...initialFormState,
      type: form.type,
      epaisseur: DEFAULT_EPAISSEURS[form.type].toString(),
    })
    setFormErrors({})
  }

  // Générer le PDF
  const handleDownloadPDF = async () => {
    if (!project || !totals) return
    setGenerating(true)
    try {
      const blob = await generateProjectPDF(project, totals)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `devis-maconnerie-${project.nom.toLowerCase().replace(/\s+/g, '-')}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setGenerating(false)
    }
  }

  // Exporter en JSON
  const handleExportJSON = () => {
    if (!project) return
    const dataStr = JSON.stringify(project, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `projet-maconnerie-${project.nom.toLowerCase().replace(/\s+/g, '-')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Importer un JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as MaconnerieProject
        if (imported.elements && imported.nom) {
          setProject({
            ...imported,
            updatedAt: new Date().toISOString(),
          })
          setForm(initialFormState)
          setEditingElement(null)
        } else {
          throw new Error('Format invalide')
        }
      } catch {
        alert('Fichier JSON invalide')
      }
    }
    reader.readAsText(file)
    // Reset l'input pour permettre de réimporter le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Nouveau projet
  const handleNewProject = () => {
    if (project && project.elements.length > 0) {
      if (!confirm('Créer un nouveau projet ? Les données non exportées seront perdues.')) {
        return
      }
    }
    createNewProject()
  }

  // Effacer les données locales
  const handleClearData = () => {
    if (confirm('Effacer toutes les données locales ?')) {
      localStorage.removeItem(STORAGE_KEY)
      createNewProject()
    }
  }

  if (!project) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Bandeau info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-800 dark:text-blue-200">
        🔒 Données traitées localement — Aucun envoi serveur
      </div>

      {/* En-tête projet */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              label="Nom du projet"
              value={project.nom}
              onChange={(e) => updateProject({ nom: e.target.value })}
              placeholder="Ex: Extension maison"
            />
          </div>
          <div className="sm:w-48">
            <Select
              label="Dosage béton"
              value={project.dosageType}
              onChange={(e) => updateProject({ dosageType: e.target.value as DosageType })}
              options={Object.entries(DOSAGE_LABELS).map(([value, label]) => ({ value, label }))}
            />
          </div>
        </div>

        {/* Bouton paramètres avancés */}
        <button
          onClick={() => setShowParams(!showParams)}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
        >
          {showParams ? '▼' : '▶'} Paramètres avancés
        </button>

        {/* Paramètres avancés */}
        {showParams && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Input
              label="Pertes (%)"
              type="number"
              value={project.pertes.toString()}
              onChange={(e) => updateProject({ pertes: Math.max(0, parseFloat(e.target.value) || 0) })}
            />
            <Select
              label="Poids sac (kg)"
              value={project.poidsSac.toString()}
              onChange={(e) => updateProject({ poidsSac: parseInt(e.target.value) })}
              options={POIDS_SAC_OPTIONS.map(w => ({ value: w.toString(), label: `${w} kg` }))}
            />
            <Select
              label="Arrondi toupie"
              value={project.arrondiToupie.toString()}
              onChange={(e) => updateProject({ arrondiToupie: parseFloat(e.target.value) })}
              options={ARRONDI_TOUPIE_OPTIONS.map(o => ({ value: o.value.toString(), label: o.label }))}
            />
            <Input
              label="Densité sable (kg/m³)"
              type="number"
              value={project.densiteSable.toString()}
              onChange={(e) => updateProject({ densiteSable: Math.max(1, parseFloat(e.target.value) || 1500) })}
            />
            <Input
              label="Densité gravier (kg/m³)"
              type="number"
              value={project.densiteGravier.toString()}
              onChange={(e) => updateProject({ densiteGravier: Math.max(1, parseFloat(e.target.value) || 1600) })}
            />
            {project.dosageType === 'custom' && (
              <>
                <Input
                  label="Ciment (kg/m³)"
                  type="number"
                  value={project.dosageCustom.cimentKgM3.toString()}
                  onChange={(e) => updateProject({
                    dosageCustom: { ...project.dosageCustom, cimentKgM3: parseFloat(e.target.value) || 350 }
                  })}
                />
                <Input
                  label="Parts sable"
                  type="number"
                  value={project.dosageCustom.sableParts.toString()}
                  onChange={(e) => updateProject({
                    dosageCustom: { ...project.dosageCustom, sableParts: parseFloat(e.target.value) || 2 }
                  })}
                />
                <Input
                  label="Parts gravier"
                  type="number"
                  value={project.dosageCustom.gravierParts.toString()}
                  onChange={(e) => updateProject({
                    dosageCustom: { ...project.dosageCustom, gravierParts: parseFloat(e.target.value) || 3 }
                  })}
                />
              </>
            )}
          </div>
        )}

        {lastSaved && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sauvegarde auto : {lastSaved.toLocaleTimeString('fr-FR')}
          </p>
        )}
      </div>

      {/* Sélecteur de type d'élément (onglets) */}
      <div className="flex flex-wrap gap-2">
        {(['dalle', 'mur', 'semelle', 'ouverture'] as ElementType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              setForm(prev => ({ ...prev, type }))
              setEditingElement(null)
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              form.type === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {ELEMENT_ICONS[type]} {ELEMENT_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Formulaire d'ajout/modification */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <h3 className="font-semibold text-lg">
          {editingElement ? 'Modifier l\'élément' : `Ajouter : ${ELEMENT_LABELS[form.type]}`}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Nom de l'élément"
            value={form.nom}
            onChange={(e) => setForm(prev => ({ ...prev, nom: e.target.value }))}
            placeholder={`Ex: ${form.type === 'dalle' ? 'Dalle garage' : form.type === 'mur' ? 'Mur façade' : form.type === 'semelle' ? 'Semelle périphérique' : 'Porte entrée'}`}
            error={formErrors.nom}
          />

          {form.type !== 'ouverture' && (
            <Input
              label="Longueur (m)"
              value={form.longueur}
              onChange={(e) => setForm(prev => ({ ...prev, longueur: e.target.value }))}
              placeholder="Ex: 5,50"
              error={formErrors.longueur}
            />
          )}

          {(form.type === 'dalle' || form.type === 'semelle' || form.type === 'ouverture') && (
            <Input
              label="Largeur (m)"
              value={form.largeur}
              onChange={(e) => setForm(prev => ({ ...prev, largeur: e.target.value }))}
              placeholder="Ex: 3,00"
              error={formErrors.largeur}
            />
          )}

          {(form.type === 'mur' || form.type === 'semelle' || form.type === 'ouverture') && (
            <Input
              label="Hauteur (m)"
              value={form.hauteur}
              onChange={(e) => setForm(prev => ({ ...prev, hauteur: e.target.value }))}
              placeholder={form.type === 'semelle' ? 'Ex: 0,30' : 'Ex: 2,50'}
              error={formErrors.hauteur}
            />
          )}

          {form.type !== 'semelle' && (
            <div>
              <Input
                label="Épaisseur (cm)"
                value={form.epaisseur}
                onChange={(e) => setForm(prev => ({ ...prev, epaisseur: e.target.value }))}
                placeholder="Ex: 15"
                error={formErrors.epaisseur}
              />
              <div className="flex gap-1 mt-1">
                {EPAISSEUR_PRESETS[form.type]?.map(ep => (
                  <button
                    key={ep}
                    onClick={() => setForm(prev => ({ ...prev, epaisseur: ep.toString() }))}
                    className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {ep}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.type === 'ouverture' && (
            <Input
              label="Quantité"
              type="number"
              value={form.quantite}
              onChange={(e) => setForm(prev => ({ ...prev, quantite: e.target.value }))}
              placeholder="Ex: 2"
              error={formErrors.quantite}
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmitElement}>
            {editingElement ? 'Enregistrer' : 'Ajouter'}
          </Button>
          {editingElement && (
            <Button variant="secondary" onClick={handleCancelEdit}>
              Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Liste des éléments */}
      {project.elements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold">Éléments du projet ({project.elements.length})</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {project.elements.map((element) => {
              const result = totals?.elements[element.id]
              return (
                <div
                  key={element.id}
                  className={`p-4 ${editingElement === element.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{ELEMENT_ICONS[element.type]}</span>
                        <span className="font-medium">{element.nom}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({ELEMENT_LABELS[element.type]})
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {element.type === 'dalle' && `${formatNumber(element.longueur)} × ${formatNumber(element.largeur)} m, ép. ${element.epaisseur} cm`}
                        {element.type === 'mur' && `${formatNumber(element.longueur)} × ${formatNumber(element.hauteur)} m, ép. ${element.epaisseur} cm`}
                        {element.type === 'semelle' && `${formatNumber(element.longueur)} × ${formatNumber(element.largeur)} m, h. ${element.hauteur} cm`}
                        {element.type === 'ouverture' && `${formatNumber(element.largeur)} × ${formatNumber(element.hauteur)} m × ${element.quantite}`}
                        {result && (
                          <span className={`ml-2 font-medium ${result.volume < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            → {result.volume < 0 ? '−' : ''}{formatNumber(Math.abs(result.volume), 3)} m³
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEditElement(element)}>
                        Modifier
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteElement(element.id)}>
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Récapitulatif des totaux */}
      {totals && totals.volumeTotal !== 0 && (
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-lg border border-primary-200 dark:border-primary-700 p-4 space-y-4">
          <h3 className="font-bold text-lg text-primary-900 dark:text-primary-100">
            Récapitulatif
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {formatNumber(totals.volumeTotal, 2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">m³ béton</div>
              {totals.volumeTotalArrondi && totals.volumeTotalArrondi !== totals.volumeTotal && (
                <div className="text-xs text-gray-500 mt-1">
                  (arrondi : {formatNumber(totals.volumeTotalArrondi, 2)} m³)
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {totals.sacsCiment}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                sacs de {project.poidsSac} kg
              </div>
              <div className="text-xs text-gray-500">
                ({formatNumber(totals.cimentTotal, 0)} kg)
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatNumber(totals.sableM3, 2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">m³ sable</div>
              <div className="text-xs text-gray-500">
                (≈ {formatNumber(totals.sableTonnes, 1)} t)
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {formatNumber(totals.gravierM3, 2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">m³ gravier</div>
              <div className="text-xs text-gray-500">
                (≈ {formatNumber(totals.gravierTonnes, 1)} t)
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded p-2">
            💧 Eau : ~{formatNumber(totals.eauTotal, 0)} litres
            <span className="mx-2">|</span>
            📊 Ratio : ciment 1 / sable {project.dosageType === 'custom' ? project.dosageCustom.sableParts : DOSAGE_PRESETS[project.dosageType].sableParts} / gravier {project.dosageType === 'custom' ? project.dosageCustom.gravierParts : DOSAGE_PRESETS[project.dosageType].gravierParts}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleDownloadPDF}
          disabled={!totals || generating}
        >
          {generating ? 'Génération...' : '📄 Télécharger PDF'}
        </Button>

        <Button variant="secondary" onClick={handleExportJSON}>
          💾 Exporter JSON
        </Button>

        <label className="cursor-pointer inline-flex items-center justify-center rounded-md font-medium transition-colors h-10 px-4 text-base bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
          📂 Importer JSON
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </label>

        <Button variant="outline" onClick={handleNewProject}>
          ✨ Nouveau projet
        </Button>

        <Button variant="ghost" onClick={handleClearData}>
          🗑️ Effacer données
        </Button>
      </div>

      {/* Note disclaimer */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded p-3">
        ⚠️ <strong>Estimations indicatives</strong> — Les quantités réelles peuvent varier selon les conditions du chantier,
        la qualité des matériaux et les techniques de mise en œuvre. Consultez un professionnel pour vos projets importants.
      </div>
    </div>
  )
}

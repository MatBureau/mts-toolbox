'use client'

import { useState } from 'react'
import {
  CharacterSheet as CharacterSheetType,
  AttributeName,
  SkillName,
  ATTRIBUTE_LABELS,
  SKILL_LABELS,
  SKILL_TO_ATTRIBUTE,
  HEALTH_LABELS,
  HealthLevel,
  Weapon,
  Equipment,
  createEmptyCharacter,
} from '@/types/jdr'

interface Props {
  initialData?: Partial<CharacterSheetType>
  onSave?: (data: CharacterSheetType) => void
  onCancel?: () => void
  readOnly?: boolean
  showSecret?: boolean // Visible seulement pour le joueur et le MJ
  onRoll?: (attribute: AttributeName, skill?: SkillName) => void
}

// Composant pour les cases à cocher de compétences
function SkillDots({
  value,
  onChange,
  max = 5,
  readOnly,
}: {
  value: number
  onChange: (v: number) => void
  max?: number
  readOnly?: boolean
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((lvl) => (
        <div
          key={lvl}
          onClick={() => !readOnly && onChange(lvl === value ? 0 : lvl)}
          className={`w-4 h-4 border-2 border-neutral-700 rounded-full transition-all ${
            lvl <= value ? 'bg-red-700' : 'bg-transparent'
          } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:border-red-500'}`}
        />
      ))}
    </div>
  )
}

// Composant pour les attributs
function AttributeBox({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  readOnly?: boolean
}) {
  return (
    <div className="text-center">
      <div className="font-bold uppercase text-xs mb-1 text-red-700 tracking-wider">{label}</div>
      <input
        type="number"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Math.min(5, Math.max(1, parseInt(e.target.value) || 2)))}
        disabled={readOnly}
        className="w-12 h-12 text-center text-2xl font-black bg-neutral-800 text-white rounded border-2 border-neutral-600 focus:border-red-500 outline-none disabled:opacity-70"
      />
      {!readOnly && (
        <button
          onClick={() => onChange(-1)} // Signal pour le roll (hacky but works since it's a subcomponent)
          className="mt-1 w-full py-1 bg-red-900/40 hover:bg-red-900/60 text-red-500 rounded text-[10px] font-bold uppercase tracking-tighter"
        >
          Lancer 🎲
        </button>
      )}
    </div>
  )
}

// Composant ligne de compétence
function SkillRow({
  skillKey,
  value,
  onChange,
  readOnly,
}: {
  skillKey: SkillName
  value: number
  onChange: (v: number) => void
  readOnly?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-neutral-700/50 group">
      <div className="flex items-center gap-2">
        {!readOnly && (
          <button
            onClick={() => onChange(-1)} // Signal pour le roll
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400"
            title="Lancer les dés"
          >
            🎲
          </button>
        )}
        <span className="text-sm text-neutral-300">{SKILL_LABELS[skillKey]}</span>
      </div>
      <SkillDots value={value} onChange={onChange} readOnly={readOnly} />
    </div>
  )
}

// Composant pour la santé
function HealthTrack({
  value,
  onChange,
  readOnly,
}: {
  value: HealthLevel
  onChange: (v: HealthLevel) => void
  readOnly?: boolean
}) {
  const levels: HealthLevel[] = [3, 2, 1, 0]
  return (
    <div className="space-y-1">
      {levels.map((level) => (
        <div
          key={level}
          onClick={() => !readOnly && onChange(level)}
          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
            value === level
              ? 'bg-red-700/30 border border-red-500'
              : 'hover:bg-neutral-700/30 border border-transparent'
          } ${readOnly ? 'cursor-default' : ''}`}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              value === level ? 'bg-red-600 border-red-400' : 'border-neutral-500'
            }`}
          />
          <span className={`text-sm font-bold ${value === level ? 'text-red-400' : 'text-neutral-400'}`}>
            {level}. {HEALTH_LABELS[level].toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CharacterSheet({ 
  initialData, 
  onSave, 
  onCancel, 
  readOnly = false, 
  showSecret = false,
  onRoll
}: Props) {
  const [data, setData] = useState<CharacterSheetType>(() => ({
    ...createEmptyCharacter(),
    ...initialData,
    id: initialData?.id || crypto.randomUUID(),
  }))

  const [newTalent, setNewTalent] = useState('')
  const [newWeapon, setNewWeapon] = useState<Partial<Weapon>>({ name: '', damage: 1, bonus: 0, range: '-' })
  const [newEquipment, setNewEquipment] = useState('')
  const [newTinyObject, setNewTinyObject] = useState('')

  // Helpers pour mise à jour
  const updateField = <K extends keyof CharacterSheetType>(field: K, value: CharacterSheetType[K]) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const updateAttribute = (attr: AttributeName, value: number) => {
    if (value === -1) {
      onRoll?.(attr)
      return
    }
    setData((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [attr]: value },
    }))
  }

  const updateSkill = (skill: SkillName, value: number) => {
    if (value === -1) {
      onRoll?.(SKILL_TO_ATTRIBUTE[skill], skill)
      return
    }
    setData((prev) => ({
      ...prev,
      skills: { ...prev.skills, [skill]: value },
    }))
  }

  const addTalent = () => {
    if (newTalent.trim()) {
      updateField('talents', [...data.talents, newTalent.trim()])
      setNewTalent('')
    }
  }

  const removeTalent = (index: number) => {
    updateField(
      'talents',
      data.talents.filter((_, i) => i !== index)
    )
  }

  const addWeapon = () => {
    if (newWeapon.name?.trim()) {
      updateField('weapons', [
        ...data.weapons,
        {
          name: newWeapon.name.trim(),
          damage: newWeapon.damage || 1,
          bonus: newWeapon.bonus || 0,
          range: newWeapon.range || '-',
        } as Weapon,
      ])
      setNewWeapon({ name: '', damage: 1, bonus: 0, range: '-' })
    }
  }

  const removeWeapon = (index: number) => {
    updateField(
      'weapons',
      data.weapons.filter((_, i) => i !== index)
    )
  }

  const addEquipment = () => {
    if (newEquipment.trim()) {
      updateField('equipment', [...data.equipment, { name: newEquipment.trim() }])
      setNewEquipment('')
    }
  }

  const removeEquipment = (index: number) => {
    updateField(
      'equipment',
      data.equipment.filter((_, i) => i !== index)
    )
  }

  const addTinyObject = () => {
    if (newTinyObject.trim()) {
      updateField('tinyObjects', [...data.tinyObjects, newTinyObject.trim()])
      setNewTinyObject('')
    }
  }

  const removeTinyObject = (index: number) => {
    updateField(
      'tinyObjects',
      data.tinyObjects.filter((_, i) => i !== index)
    )
  }

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.name || 'personnage'}_fiche.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        setData({ ...imported, id: data.id }) // Keep current session ID
      } catch (err) {
        alert('Erreur lors de l\'importation du fichier JSON.')
      }
    }
    reader.readAsText(file)
  }

  // Grouper les skills par attribut
  const skillsByAttribute: Record<AttributeName, SkillName[]> = {
    vigueur: ['combatRapproche', 'endurance', 'force'],
    agilite: ['combatDistance', 'discretion', 'mobilite'],
    esprit: ['reconnaissance', 'survie', 'technique'],
    empathie: ['commandement', 'manipulation', 'medecine'],
  }

  return (
    <div className="bg-neutral-900 text-white rounded-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
      {/* Header TWD Style */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-neutral-900 p-4 border-b-4 border-red-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">The Walking Dead</h1>
            <p className="text-xs text-red-300 uppercase tracking-widest">Universe RPG - Fiche de personnage</p>
          </div>
          <div className="flex items-center gap-4">
            {!readOnly && (
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="p-2 bg-neutral-800/50 hover:bg-neutral-800 rounded text-xs border border-white/10"
                  title="Exporter en JSON"
                >
                  📤
                </button>
                <label 
                  className="p-2 bg-neutral-800/50 hover:bg-neutral-800 rounded text-xs border border-white/10 cursor-pointer"
                  title="Importer JSON"
                >
                  📥
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>
            )}
            <div className="text-4xl">{data.avatar || '👤'}</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* IDENTITÉ */}
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1">
            Identité
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase text-neutral-500 mb-1">Nom</label>
              <input
                value={data.name}
                onChange={(e) => updateField('name', e.target.value)}
                disabled={readOnly}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none disabled:opacity-70"
                placeholder="Nom du personnage"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-500 mb-1">Archétype</label>
              <input
                value={data.archetype}
                onChange={(e) => updateField('archetype', e.target.value)}
                disabled={readOnly}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none disabled:opacity-70"
                placeholder="Leader, Médecin, Chasseur..."
              />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase text-neutral-500 mb-1">Description</label>
            <textarea
              value={data.description}
              onChange={(e) => updateField('description', e.target.value)}
              disabled={readOnly}
              rows={2}
              className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none disabled:opacity-70 resize-none"
              placeholder="Apparence physique..."
            />
          </div>
        </section>

        {/* ATTACHES & MOTIVATION */}
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1">
            Attaches & Motivation
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase text-neutral-500 mb-1">PJ Attache</label>
              <input
                value={data.pjAttache}
                onChange={(e) => updateField('pjAttache', e.target.value)}
                disabled={readOnly}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-500 mb-1">Motivation</label>
              <input
                value={data.motivation}
                onChange={(e) => updateField('motivation', e.target.value)}
                disabled={readOnly}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-500 mb-1">PNJ Attache</label>
              <input
                value={data.pnjAttache}
                onChange={(e) => updateField('pnjAttache', e.target.value)}
                disabled={readOnly}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-500 mb-1">Problèmes</label>
              <input
                value={data.problemes}
                onChange={(e) => updateField('problemes', e.target.value)}
                disabled={readOnly}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-red-400 focus:border-red-500 outline-none disabled:opacity-70"
              />
            </div>
          </div>
          {showSecret && data.secret && (
            <div className="bg-red-900/30 border border-red-700 rounded p-3">
              <label className="block text-xs uppercase text-red-400 mb-1">🤫 Secret</label>
              <p className="text-sm text-red-200 italic">{data.secret}</p>
            </div>
          )}
        </section>

        {/* ATTRIBUTS & COMPÉTENCES */}
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1">
            Attributs & Compétences
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {(Object.keys(skillsByAttribute) as AttributeName[]).map((attr) => (
              <div key={attr} className="space-y-2">
                <AttributeBox
                  label={ATTRIBUTE_LABELS[attr]}
                  value={data.attributes[attr]}
                  onChange={(v) => updateAttribute(attr, v)}
                  readOnly={readOnly}
                />
                <div className="space-y-1 pt-2 border-t border-neutral-700">
                  {skillsByAttribute[attr].map((skill) => (
                    <SkillRow
                      key={skill}
                      skillKey={skill}
                      value={data.skills[skill]}
                      onChange={(v) => updateSkill(skill, v)}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TALENTS */}
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1">
            Talents
          </h2>
          <div className="space-y-2">
            {data.talents.map((talent, i) => (
              <div key={i} className="flex items-start gap-2 bg-neutral-800/50 rounded p-2">
                <span className="text-sm text-neutral-300 flex-1 italic">{talent}</span>
                {!readOnly && (
                  <button onClick={() => removeTalent(i)} className="text-red-500 hover:text-red-400 text-xs">
                    ✕
                  </button>
                )}
              </div>
            ))}
            {!readOnly && (
              <div className="flex gap-2">
                <input
                  value={newTalent}
                  onChange={(e) => setNewTalent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTalent()}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-1 text-sm text-white focus:border-red-500 outline-none"
                  placeholder="Ajouter un talent..."
                />
                <button onClick={addTalent} className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm">
                  +
                </button>
              </div>
            )}
          </div>
        </section>

        {/* SANTÉ, STRESS, XP */}
        <section className="grid grid-cols-3 gap-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1 mb-2">
              Santé
            </h2>
            <HealthTrack
              value={data.health}
              onChange={(v) => updateField('health', v)}
              readOnly={readOnly}
            />
            <div className="mt-2">
              <label className="block text-xs uppercase text-neutral-500 mb-1">Blessures critiques</label>
              <textarea
                value={data.criticalWounds.join('\n')}
                onChange={(e) => updateField('criticalWounds', e.target.value.split('\n').filter(Boolean))}
                disabled={readOnly}
                rows={2}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-red-400 focus:border-red-500 outline-none disabled:opacity-70 resize-none"
                placeholder="Une blessure par ligne..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1 mb-2">
                Stress
              </h2>
              <input
                type="number"
                min={0}
                max={10}
                value={data.stress}
                onChange={(e) => updateField('stress', Math.max(0, parseInt(e.target.value) || 0))}
                disabled={readOnly}
                className="w-16 h-12 text-center text-2xl font-black bg-yellow-900/50 text-yellow-400 rounded border-2 border-yellow-700 focus:border-yellow-500 outline-none disabled:opacity-70"
              />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1 mb-2">
                Expérience
              </h2>
              <input
                type="number"
                min={0}
                value={data.experience}
                onChange={(e) => updateField('experience', Math.max(0, parseInt(e.target.value) || 0))}
                disabled={readOnly}
                className="w-16 h-12 text-center text-2xl font-black bg-blue-900/50 text-blue-400 rounded border-2 border-blue-700 focus:border-blue-500 outline-none disabled:opacity-70"
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1 mb-2">
              Encombrement
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-neutral-400">
                {data.equipment.length + data.weapons.length}
              </span>
              <span className="text-neutral-500">/</span>
              <input
                type="number"
                min={1}
                max={10}
                value={data.maxEncumbrance}
                onChange={(e) => updateField('maxEncumbrance', Math.max(1, parseInt(e.target.value) || 4))}
                disabled={readOnly}
                className="w-12 h-10 text-center text-xl font-black bg-neutral-800 text-white rounded border border-neutral-700 focus:border-red-500 outline-none disabled:opacity-70"
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1">Cases utilisées / Max</p>
          </div>
        </section>

        {/* ARMES */}
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1">
            Armes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 uppercase text-xs">
                  <th className="pb-2">Nom</th>
                  <th className="pb-2 text-center">Dégâts</th>
                  <th className="pb-2 text-center">Bonus</th>
                  <th className="pb-2 text-center">Portée</th>
                  {!readOnly && <th className="pb-2 w-8"></th>}
                </tr>
              </thead>
              <tbody>
                {data.weapons.map((weapon, i) => (
                  <tr key={i} className="border-t border-neutral-700/50">
                    <td className="py-2 text-neutral-300">{weapon.name}</td>
                    <td className="py-2 text-center text-red-400 font-bold">{weapon.damage}</td>
                    <td className="py-2 text-center text-green-400">+{weapon.bonus}</td>
                    <td className="py-2 text-center text-neutral-400 capitalize">{weapon.range}</td>
                    {!readOnly && (
                      <td className="py-2">
                        <button onClick={() => removeWeapon(i)} className="text-red-500 hover:text-red-400">
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!readOnly && (
            <div className="flex gap-2 items-end">
              <input
                value={newWeapon.name || ''}
                onChange={(e) => setNewWeapon((w) => ({ ...w, name: e.target.value }))}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-red-500 outline-none"
                placeholder="Nom de l'arme"
              />
              <input
                type="number"
                value={newWeapon.damage || 1}
                onChange={(e) => setNewWeapon((w) => ({ ...w, damage: parseInt(e.target.value) || 1 }))}
                className="w-16 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white text-center focus:border-red-500 outline-none"
                placeholder="Dég."
              />
              <input
                type="number"
                value={newWeapon.bonus || 0}
                onChange={(e) => setNewWeapon((w) => ({ ...w, bonus: parseInt(e.target.value) || 0 }))}
                className="w-16 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white text-center focus:border-red-500 outline-none"
                placeholder="Bonus"
              />
              <select
                value={newWeapon.range || '-'}
                onChange={(e) => setNewWeapon((w) => ({ ...w, range: e.target.value as Weapon['range'] }))}
                className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-red-500 outline-none"
              >
                <option value="-">-</option>
                <option value="courte">Courte</option>
                <option value="moyenne">Moyenne</option>
                <option value="longue">Longue</option>
                <option value="extreme">Extrême</option>
              </select>
              <button onClick={addWeapon} className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm">
                +
              </button>
            </div>
          )}
        </section>

        {/* ÉQUIPEMENT */}
        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1">
              Équipement
            </h2>
            <div className="space-y-1">
              {data.equipment.map((eq, i) => (
                <div key={i} className="flex items-center justify-between bg-neutral-800/50 rounded px-2 py-1">
                  <span className="text-sm text-neutral-300">{eq.name}</span>
                  {!readOnly && (
                    <button onClick={() => removeEquipment(i)} className="text-red-500 hover:text-red-400 text-xs">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!readOnly && (
              <div className="flex gap-2">
                <input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addEquipment()}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-red-500 outline-none"
                  placeholder="Ajouter équipement..."
                />
                <button onClick={addEquipment} className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm">
                  +
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1">
              Objets minuscules
            </h2>
            <div className="space-y-1">
              {data.tinyObjects.map((obj, i) => (
                <div key={i} className="flex items-center justify-between bg-neutral-800/50 rounded px-2 py-1">
                  <span className="text-sm text-neutral-400 italic">{obj}</span>
                  {!readOnly && (
                    <button onClick={() => removeTinyObject(i)} className="text-red-500 hover:text-red-400 text-xs">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!readOnly && (
              <div className="flex gap-2">
                <input
                  value={newTinyObject}
                  onChange={(e) => setNewTinyObject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTinyObject()}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white focus:border-red-500 outline-none"
                  placeholder="Ajouter objet minuscule..."
                />
                <button onClick={addTinyObject} className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm">
                  +
                </button>
              </div>
            )}
          </div>
        </section>

        {/* NOTES */}
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-500 border-b border-red-500/30 pb-1">
            Notes
          </h2>
          <textarea
            value={data.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            disabled={readOnly}
            rows={3}
            className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white focus:border-red-500 outline-none disabled:opacity-70 resize-none"
            placeholder="Notes personnelles..."
          />
        </section>

        {/* ACTIONS */}
        {(onSave || onCancel) && (
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded font-bold transition-colors"
              >
                Annuler
              </button>
            )}
            {onSave && (
              <button
                onClick={() => onSave(data)}
                className="px-6 py-2 bg-red-700 hover:bg-red-600 rounded font-bold transition-colors"
              >
                Sauvegarder
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

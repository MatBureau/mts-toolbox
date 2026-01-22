'use client'

import { useState } from 'react'

export default function CharacterSheet({ initialData, onSave }: { initialData?: any, onSave?: (data: any) => void }) {
  const [data, setData] = useState(initialData || {
    name: '',
    archetype: '',
    souci: '',
    attributes: {
      force: 2,
      agilite: 2,
      esprit: 2,
      empathie: 2
    },
    skills: {
      endurance: 0,
      force: 0,
      combat: 0,
      tir: 0,
      furtivite: 0,
      survie: 0,
      tech: 0,
      soins: 0,
      leadership: 0
    }
  })

  // Helper pour changer une valeur
  const handleChange = (field: string, value: any, category?: string) => {
    if (category) {
        setData((prev: any) => ({
            ...prev,
            [category]: { ...prev[category], [field]: value }
        }))
    } else {
        setData((prev: any) => ({ ...prev, [field]: value }))
    }
  }

  return (
    <div className="bg-[#f2f2f2] text-black p-6 rounded-lg max-w-2xl mx-auto font-serif border-4 border-black shadow-2xl overflow-y-auto max-h-[80vh]">
      <div className="flex justify-between items-end border-b-4 border-black pb-4 mb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter">The Walking Dead</h1>
        <div className="text-sm font-bold opacity-50">UNIVERSE RPG</div>
      </div>

      {/* Identity */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
            <label className="block font-bold uppercase text-xs mb-1">Nom</label>
            <input 
                value={data.name} 
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border-b-2 border-black bg-transparent p-1 font-handwriting text-xl focus:outline-none" 
            />
        </div>
        <div>
            <label className="block font-bold uppercase text-xs mb-1">Archétype</label>
            <input 
                value={data.archetype}
                onChange={(e) => handleChange('archetype', e.target.value)}
                className="w-full border-b-2 border-black bg-transparent p-1 font-handwriting text-xl focus:outline-none" 
                placeholder="Criminel, Docteur, Fermier..."
            />
        </div>
        <div className="col-span-2">
            <label className="block font-bold uppercase text-xs mb-1">Souci (Problem)</label>
            <input 
                value={data.souci}
                onChange={(e) => handleChange('souci', e.target.value)}
                className="w-full border-b-2 border-black bg-transparent p-1 font-handwriting text-xl focus:outline-none text-red-800"
                placeholder="Ce qui hante votre personnage..."
            />
        </div>
      </div>

      {/* Attributes */}
      <div className="grid grid-cols-4 gap-4 mb-8 bg-black text-white p-4 rounded">
        {Object.entries(data.attributes).map(([key, val]: [string, any]) => (
            <div key={key} className="text-center">
                <div className="font-bold uppercase text-xs mb-2 opacity-70">{key}</div>
                <input 
                    type="number" 
                    value={val}
                    onChange={(e) => handleChange(key, parseInt(e.target.value), 'attributes')}
                    className="w-16 h-16 text-center text-3xl font-black text-black rounded mx-auto block"
                />
            </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-8">
        <h3 className="font-black uppercase border-b-2 border-black mb-4">Compétences</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {Object.entries(data.skills).map(([key, val]: [string, any]) => (
                <div key={key} className="flex items-center justify-between border-b border-gray-400 py-1">
                    <span className="uppercase font-bold text-sm">{key}</span>
                    <div className="flex gap-1">
                        {[0,1,2,3,4,5].slice(1).map(lvl => (
                            <div 
                                key={lvl}
                                onClick={() => handleChange(key, lvl === val ? 0 : lvl, 'skills')}
                                className={`w-4 h-4 border border-black rounded-full cursor-pointer ${lvl <= val ? 'bg-black' : 'bg-transparent'}`}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="text-center">
        <button 
            onClick={() => onSave && onSave(data)}
            className="bg-red-700 text-white font-black uppercase tracking-widest px-8 py-3 hover:bg-red-800 transition"
        >
            Sauvegarder
        </button>
      </div>
    </div>
  )
}

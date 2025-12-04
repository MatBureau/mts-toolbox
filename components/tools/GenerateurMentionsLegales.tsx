'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import CopyButton from '@/components/ui/CopyButton'

export default function GenerateurMentionsLegales() {
  const [companyName, setCompanyName] = useState<string>('')
  const [legalForm, setLegalForm] = useState<string>('')
  const [siret, setSiret] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [director, setDirector] = useState<string>('')
  const [host, setHost] = useState<string>('')
  const [generated, setGenerated] = useState<string>('')

  const generate = () => {
    const text = `MENTIONS LÉGALES

Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance en l'économie numérique, il est précisé aux utilisateurs du site l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.

ÉDITEUR DU SITE

Raison sociale : ${companyName}
Forme juridique : ${legalForm}
N° SIRET : ${siret}
Siège social : ${address}
Téléphone : ${phone}
Email : ${email}
Directeur de la publication : ${director}

HÉBERGEUR

${host}

PROPRIÉTÉ INTELLECTUELLE

L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.

La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.

PROTECTION DES DONNÉES PERSONNELLES

Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée et au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant.

Pour exercer ce droit, vous pouvez nous contacter à l'adresse : ${email}

COOKIES

Le site peut collecter automatiquement des informations standards. Toutes les informations collectées indirectement ne seront utilisées que pour suivre le volume, le type et la configuration du trafic utilisant ce site, pour en développer la conception et l'agencement et à d'autres fins administratives et de planification.

Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}`

    setGenerated(text)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations de l&apos;entreprise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nom de l'entreprise"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Exemple : SARL MonEntreprise"
          />

          <Input
            label="Forme juridique"
            value={legalForm}
            onChange={(e) => setLegalForm(e.target.value)}
            placeholder="SARL, SAS, EURL, etc."
          />

          <Input
            label="Numéro SIRET"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            placeholder="123 456 789 00012"
          />

          <Textarea
            label="Adresse du siège social"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Numéro, rue, code postal, ville"
            rows={2}
          />

          <Input
            label="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 1 23 45 67 89"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@entreprise.fr"
          />

          <Input
            label="Directeur de publication"
            value={director}
            onChange={(e) => setDirector(e.target.value)}
            placeholder="Nom et prénom"
          />

          <Textarea
            label="Hébergeur (nom, adresse)"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="Exemple : OVH SAS - 2 rue Kellermann, 59100 Roubaix"
            rows={2}
          />

          <Button onClick={generate} className="w-full">
            Générer les mentions légales
          </Button>
        </CardContent>
      </Card>

      {generated && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mentions légales générées</CardTitle>
              <CopyButton text={generated} />
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generated}
              readOnly
              rows={25}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ⚠️ Ce générateur fournit un modèle de mentions légales à titre indicatif. Il est
            recommandé de consulter un avocat pour vous assurer que vos mentions légales sont
            complètes et conformes à votre situation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

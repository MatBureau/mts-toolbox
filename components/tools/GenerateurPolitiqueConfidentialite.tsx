'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import CopyButton from '@/components/ui/CopyButton'

export default function GenerateurPolitiqueConfidentialite() {
  const [companyName, setCompanyName] = useState<string>('')
  const [websiteUrl, setWebsiteUrl] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [collectsData, setCollectsData] = useState<boolean>(true)
  const [usesCookies, setUsesCookies] = useState<boolean>(true)
  const [generated, setGenerated] = useState<string>('')

  const generate = () => {
    const text = `POLITIQUE DE CONFIDENTIALITÉ

Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}

${companyName} (ci-après "nous", "notre" ou "nos") exploite le site web ${websiteUrl} (ci-après le "Service").

Cette page vous informe de nos politiques en matière de collecte, d'utilisation et de divulgation des données personnelles lorsque vous utilisez notre Service et des choix que vous avez associés à ces données.

1. COLLECTE ET UTILISATION DES DONNÉES

${collectsData ? `Nous collectons différents types de données à des fins variées pour améliorer notre Service.

Types de données collectées :
- Données d'utilisation : Lorsque vous accédez au Service, nous pouvons collecter certaines informations automatiquement, notamment le type de navigateur que vous utilisez, l'adresse IP de votre ordinateur, les pages de notre Service que vous visitez, l'heure et la date de votre visite.` : 'Nous ne collectons aucune donnée personnelle identifiable.'}

2. UTILISATION DES DONNÉES

${companyName} utilise les données collectées à diverses fins :
- Fournir et maintenir notre Service
- Vous informer des modifications apportées à notre Service
- Vous permettre de participer aux fonctionnalités interactives de notre Service
- Fournir un support client
- Recueillir des analyses ou des informations précieuses afin d'améliorer notre Service
- Surveiller l'utilisation de notre Service
- Détecter, prévenir et résoudre les problèmes techniques

3. COOKIES ET TECHNOLOGIES DE SUIVI

${usesCookies ? `Nous utilisons des cookies et des technologies de suivi similaires pour suivre l'activité sur notre Service et nous conservons certaines informations.

Les cookies sont des fichiers contenant une petite quantité de données qui peuvent inclure un identifiant unique anonyme. Vous pouvez demander à votre navigateur de refuser tous les cookies ou d'indiquer quand un cookie est envoyé.` : 'Nous n\'utilisons pas de cookies sur notre Service.'}

4. SÉCURITÉ DES DONNÉES

La sécurité de vos données est importante pour nous. Nous nous efforçons d'utiliser des moyens commercialement acceptables pour protéger vos données personnelles, mais n'oublions pas qu'aucune méthode de transmission sur Internet ou de stockage électronique n'est sûre à 100%.

5. DROITS RGPD

Si vous résidez dans l'Espace économique européen (EEE), vous disposez de certains droits en matière de protection des données. ${companyName} vise à prendre des mesures raisonnables pour vous permettre de corriger, modifier, supprimer ou limiter l'utilisation de vos données personnelles.

Vous avez le droit de :
- Accéder à vos données personnelles
- Rectifier vos données personnelles
- Supprimer vos données personnelles
- Vous opposer au traitement de vos données personnelles
- Restreindre le traitement de vos données personnelles
- Portabilité de vos données personnelles

6. LIENS VERS D'AUTRES SITES

Notre Service peut contenir des liens vers d'autres sites que nous n'exploitons pas. Si vous cliquez sur un lien tiers, vous serez dirigé vers le site de ce tiers. Nous vous conseillons vivement de consulter la politique de confidentialité de chaque site que vous visitez.

7. MODIFICATIONS DE CETTE POLITIQUE DE CONFIDENTIALITÉ

Nous pouvons mettre à jour notre politique de confidentialité de temps à autre. Nous vous informerons de tout changement en publiant la nouvelle politique de confidentialité sur cette page.

8. NOUS CONTACTER

Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter :
- Par email : ${email}
- En visitant cette page sur notre site : ${websiteUrl}/contact`

    setGenerated(text)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations du site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Nom de l'entreprise/site"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Exemple : Mon Entreprise"
          />

          <Input
            label="URL du site"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://www.monsite.fr"
          />

          <Input
            label="Email de contact"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@monsite.fr"
          />

          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={collectsData}
                onChange={(e) => setCollectsData(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Le site collecte des données utilisateur</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={usesCookies}
                onChange={(e) => setUsesCookies(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Le site utilise des cookies</span>
            </label>
          </div>

          <Button onClick={generate} className="w-full">
            Générer la politique de confidentialité
          </Button>
        </CardContent>
      </Card>

      {generated && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Politique de confidentialité générée</CardTitle>
              <CopyButton text={generated} />
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generated}
              readOnly
              rows={30}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ⚠️ Ce générateur fournit un modèle de politique de confidentialité à titre indicatif.
            Il est fortement recommandé de consulter un avocat spécialisé en protection des données
            pour vous assurer que votre politique est complète et conforme au RGPD.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

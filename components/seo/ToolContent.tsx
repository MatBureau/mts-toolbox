import { Tool } from '@/lib/tools-config'

interface ToolContentProps {
  tool: Tool
}

const toolContents: Record<string, {
  description: string
  howTo: string[]
  features: string[]
  useCases: string[]
}> = {
  'editeur-pdf': {
    description: "Notre éditeur PDF en ligne gratuit vous permet d'annoter et de modifier vos documents PDF directement dans votre navigateur, sans nécessiter de téléchargement ou d'installation. Que vous ayez besoin d'ajouter du texte, de dessiner des formes, d'insérer des flèches ou de signer numériquement vos documents, notre outil offre une expérience utilisateur fluide et intuitive. Compatible avec tous les navigateurs modernes, cet éditeur PDF respecte votre vie privée en traitant tous vos fichiers localement sur votre appareil.",
    howTo: [
      "Cliquez sur 'Choisir un fichier' ou glissez-déposez votre PDF dans la zone prévue",
      "Utilisez la barre d'outils pour sélectionner un outil (texte, dessin, formes, flèches)",
      "Cliquez ou dessinez directement sur le PDF pour ajouter vos annotations",
      "Utilisez les options de couleur et de taille pour personnaliser vos annotations",
      "Naviguez entre les pages avec les boutons précédent/suivant",
      "Cliquez sur 'Télécharger le PDF annoté' pour sauvegarder votre travail"
    ],
    features: [
      "Ajout de texte avec choix de taille et de couleur",
      "Dessin libre à main levée pour signatures et annotations",
      "Insertion de rectangles, cercles et flèches",
      "Support des PDF multi-pages",
      "Interface intuitive et responsive",
      "Traitement 100% local, vos fichiers restent privés",
      "Gratuit et sans limitation"
    ],
    useCases: [
      "Signer numériquement des contrats et documents officiels",
      "Annoter des documents pédagogiques pour l'enseignement",
      "Corriger et commenter des travaux d'étudiants",
      "Ajouter des notes et remarques sur des rapports professionnels",
      "Remplir des formulaires PDF non-éditables",
      "Surligner et annoter des documents de recherche"
    ]
  },
  'fusionner-pdf': {
    description: "Combinez facilement plusieurs fichiers PDF en un seul document avec notre outil de fusion PDF gratuit. Que vous ayez besoin de rassembler des factures, des contrats, des rapports ou tout autre type de documents, notre service en ligne vous permet de fusionner vos PDF rapidement et sans perte de qualité. L'ordre des fichiers peut être facilement réorganisé avant la fusion pour créer le document final parfait.",
    howTo: [
      "Sélectionnez les fichiers PDF que vous souhaitez fusionner",
      "Réorganisez l'ordre des fichiers en les glissant-déposant",
      "Cliquez sur 'Fusionner les PDF'",
      "Téléchargez votre PDF fusionné"
    ],
    features: [
      "Fusion illimitée de fichiers PDF",
      "Réorganisation facile par glisser-déposer",
      "Conservation de la qualité originale",
      "Traitement rapide et sécurisé",
      "Aucune inscription requise",
      "Compatible tous navigateurs"
    ],
    useCases: [
      "Regrouper des factures mensuelles",
      "Assembler les chapitres d'un rapport",
      "Combiner des documents de candidature",
      "Créer un portfolio professionnel",
      "Rassembler des contrats et avenants"
    ]
  },
  'compteur-mots': {
    description: "Analysez instantanément votre texte avec notre compteur de mots en ligne gratuit. Obtenez des statistiques détaillées incluant le nombre de mots, de caractères (avec et sans espaces), de phrases et de paragraphes. Cet outil est essentiel pour les rédacteurs, étudiants, écrivains et professionnels qui doivent respecter des limites de longueur spécifiques. L'analyse se fait en temps réel au fur et à mesure de votre saisie.",
    howTo: [
      "Collez ou tapez votre texte dans la zone de texte",
      "Les statistiques se mettent à jour automatiquement en temps réel",
      "Consultez le nombre de mots, caractères, phrases et paragraphes",
      "Utilisez les résultats pour optimiser votre contenu"
    ],
    features: [
      "Comptage en temps réel",
      "Nombre de mots précis",
      "Caractères avec et sans espaces",
      "Comptage de phrases et paragraphes",
      "Temps de lecture estimé",
      "Interface simple et claire",
      "Aucune limite de texte"
    ],
    useCases: [
      "Respecter les limites de mots pour des dissertations",
      "Optimiser la longueur d'articles de blog pour le SEO",
      "Vérifier le nombre de caractères pour les réseaux sociaux",
      "Analyser la densité de contenu",
      "Préparer des documents professionnels",
      "Évaluer le temps de lecture d'un texte"
    ]
  },
  'formateur-json': {
    description: "Formatez et embellissez votre code JSON en un clic avec notre formateur en ligne gratuit. Transformez du JSON minifié ou mal formaté en code propre, indenté et facile à lire. Notre outil valide également la syntaxe de votre JSON et signale les erreurs éventuelles. Indispensable pour les développeurs travaillant avec des APIs, des fichiers de configuration ou des structures de données JSON.",
    howTo: [
      "Collez votre code JSON dans l'éditeur",
      "Choisissez le niveau d'indentation (2 ou 4 espaces)",
      "Cliquez sur 'Formater'",
      "Copiez le résultat formaté"
    ],
    features: [
      "Formatage instantané du JSON",
      "Validation de la syntaxe",
      "Messages d'erreur clairs",
      "Indentation personnalisable",
      "Coloration syntaxique",
      "Support des gros fichiers",
      "Minification optionnelle"
    ],
    useCases: [
      "Déboguer des réponses d'API",
      "Formatter des fichiers de configuration",
      "Lire des données JSON complexes",
      "Valider la structure JSON avant utilisation",
      "Préparer du JSON pour la documentation",
      "Nettoyer du JSON exporté"
    ]
  },
  'convertisseur-images': {
    description: "Convertissez vos images entre différents formats (PNG, JPG, WebP) gratuitement avec notre convertisseur en ligne. Optimisez vos images pour le web en les convertissant au format WebP pour des temps de chargement plus rapides, ou transformez des PNG avec transparence en JPG pour réduire la taille des fichiers. Notre outil préserve la qualité maximale lors de la conversion.",
    howTo: [
      "Sélectionnez l'image à convertir",
      "Choisissez le format de sortie (PNG, JPG ou WebP)",
      "Ajustez les paramètres de qualité si nécessaire",
      "Cliquez sur 'Convertir'",
      "Téléchargez votre image convertie"
    ],
    features: [
      "Conversion vers PNG, JPG et WebP",
      "Préservation de la qualité",
      "Ajustement de la compression",
      "Traitement côté client (privé)",
      "Aperçu avant téléchargement",
      "Conversion par lot",
      "Formats modernes supportés"
    ],
    useCases: [
      "Optimiser des images pour le web",
      "Convertir PNG en JPG pour réduire la taille",
      "Créer des WebP pour améliorer les performances",
      "Préparer des images pour les réseaux sociaux",
      "Convertir des screenshots",
      "Adapter le format aux exigences techniques"
    ]
  },
  'generateur-qrcode': {
    description: "Créez des QR codes personnalisés gratuitement pour partager des URLs, du texte, des coordonnées ou toute autre information. Notre générateur de QR code en ligne vous permet de personnaliser la taille, la couleur et le niveau de correction d'erreur. Idéal pour le marketing, les cartes de visite numériques, les menus de restaurant sans contact et bien plus encore.",
    howTo: [
      "Entrez le texte ou l'URL à encoder",
      "Personnalisez la taille et la couleur du QR code",
      "Choisissez le niveau de correction d'erreur",
      "Cliquez sur 'Générer'",
      "Téléchargez votre QR code en PNG ou SVG"
    ],
    features: [
      "Génération instantanée",
      "Personnalisation complète",
      "Export PNG et SVG",
      "Haute résolution",
      "Correction d'erreur paramétrable",
      "Aucune limite d'utilisation",
      "QR codes scannables sur tous les appareils"
    ],
    useCases: [
      "Partager une URL de site web",
      "Créer des cartes de visite digitales",
      "Menus de restaurant sans contact",
      "Campagnes marketing et publicité",
      "Billetterie d'événements",
      "Instructions et guides produits",
      "Paiements mobiles"
    ]
  },
  'calculateur-pourcentage': {
    description: "Calculez facilement n'importe quel pourcentage avec notre calculateur en ligne gratuit. Que vous ayez besoin de calculer une remise, une augmentation, une réduction, une TVA ou simplement comprendre la proportion d'un nombre par rapport à un autre, notre outil vous fournit instantanément le résultat. Parfait pour le shopping, les finances personnelles, les mathématiques ou les calculs professionnels.",
    howTo: [
      "Choisissez le type de calcul de pourcentage",
      "Entrez les valeurs nécessaires",
      "Le résultat s'affiche automatiquement",
      "Utilisez différents modes selon vos besoins"
    ],
    features: [
      "Multiples types de calculs",
      "Résultats instantanés",
      "Calcul de remises et augmentations",
      "Différence en pourcentage",
      "Pourcentage d'un nombre",
      "Interface intuitive",
      "Exemples et explications"
    ],
    useCases: [
      "Calculer une réduction en magasin",
      "Déterminer une augmentation de salaire",
      "Calculer la TVA d'un produit",
      "Comparer deux prix",
      "Analyser des statistiques",
      "Évaluer des évolutions financières",
      "Résoudre des problèmes de mathématiques"
    ]
  }
}

export default function ToolContent({ tool }: ToolContentProps) {
  const content = toolContents[tool.slug]

  if (!content) {
    return null
  }

  return (
    <div className="mt-8 space-y-8 text-gray-700 dark:text-gray-300">
      {/* Description détaillée */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          À propos de {tool.name}
        </h2>
        <p className="text-base leading-relaxed">
          {content.description}
        </p>
      </section>

      {/* Comment utiliser */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Comment utiliser cet outil ?
        </h2>
        <ol className="list-decimal list-inside space-y-2">
          {content.howTo.map((step, index) => (
            <li key={index} className="text-base">
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* Fonctionnalités */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Fonctionnalités principales
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {content.features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
              <span className="text-base">{feature}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cas d'usage */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Cas d'utilisation
        </h2>
        <ul className="space-y-2">
          {content.useCases.map((useCase, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <span className="text-base">{useCase}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section SEO additionnelle */}
      <section className="bg-blue-50 dark:bg-gray-900/50 rounded-lg p-6 border border-blue-100 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Pourquoi choisir notre outil ?
        </h3>
        <div className="space-y-2 text-base">
          <p>
            ✓ <strong>100% Gratuit</strong> : Aucun abonnement, aucun frais caché
          </p>
          <p>
            ✓ <strong>Sécurisé et Privé</strong> : Vos fichiers restent sur votre appareil
          </p>
          <p>
            ✓ <strong>Sans Inscription</strong> : Utilisez l'outil immédiatement
          </p>
          <p>
            ✓ <strong>Accessible Partout</strong> : Fonctionne sur ordinateur, tablette et mobile
          </p>
        </div>
      </section>
    </div>
  )
}

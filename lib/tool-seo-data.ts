// This file contains SEO data for tools (HowTo steps and FAQs)

export interface ToolSEOData {
  howToSteps: string[]
  faqs: Array<{ question: string; answer: string }>
}

export const toolSEOData: Record<string, ToolSEOData> = {
  'editeur-pdf': {
    howToSteps: [
      "Cliquez sur 'Choisir un fichier' ou glissez-déposez votre PDF dans la zone prévue",
      "Utilisez la barre d'outils pour sélectionner un outil (texte, dessin, formes, flèches)",
      "Cliquez ou dessinez directement sur le PDF pour ajouter vos annotations",
      "Utilisez les options de couleur et de taille pour personnaliser vos annotations",
      "Naviguez entre les pages avec les boutons précédent/suivant",
      "Cliquez sur 'Télécharger le PDF annoté' pour sauvegarder votre travail"
    ],
    faqs: [
      {
        question: "L'éditeur PDF est-il vraiment gratuit ?",
        answer: "Oui, notre éditeur PDF est entièrement gratuit, sans limite d'utilisation et sans inscription requise. Vous pouvez annoter autant de PDF que vous le souhaitez."
      },
      {
        question: "Mes fichiers sont-ils sécurisés ?",
        answer: "Absolument. Tous les traitements sont effectués localement dans votre navigateur. Vos fichiers ne sont jamais envoyés sur nos serveurs, garantissant une confidentialité totale."
      },
      {
        question: "Puis-je éditer des PDF protégés par mot de passe ?",
        answer: "Non, pour des raisons de sécurité, vous devez d'abord déverrouiller le PDF avant de pouvoir l'éditer avec notre outil."
      },
      {
        question: "L'outil fonctionne-t-il sur mobile ?",
        answer: "Oui, notre éditeur PDF est entièrement responsive et fonctionne sur smartphones et tablettes avec une interface adaptée au tactile."
      },
      {
        question: "Quelle est la taille maximale de fichier acceptée ?",
        answer: "La limite dépend de votre navigateur et de votre appareil. En général, les fichiers jusqu'à 50 MB sont traités sans problème."
      }
    ]
  },
  'fusionner-pdf': {
    howToSteps: [
      "Sélectionnez les fichiers PDF que vous souhaitez fusionner",
      "Réorganisez l'ordre des fichiers en les glissant-déposant",
      "Cliquez sur 'Fusionner les PDF'",
      "Téléchargez votre PDF fusionné"
    ],
    faqs: [
      {
        question: "Combien de fichiers PDF puis-je fusionner ?",
        answer: "Il n'y a pas de limite stricte au nombre de fichiers, mais pour des performances optimales, nous recommandons de fusionner jusqu'à 20 fichiers à la fois."
      },
      {
        question: "L'ordre des pages est-il préservé ?",
        answer: "Oui, vous pouvez réorganiser les fichiers avant la fusion en les glissant-déposant. L'ordre que vous définissez sera respecté dans le PDF final."
      },
      {
        question: "La qualité des PDF est-elle réduite après fusion ?",
        answer: "Non, notre outil préserve la qualité originale de tous vos documents. Aucune compression ou perte de qualité n'est appliquée."
      },
      {
        question: "Puis-je fusionner des PDF de tailles différentes ?",
        answer: "Oui, vous pouvez fusionner des PDF avec différentes dimensions de page. Chaque page conservera sa taille originale dans le document fusionné."
      }
    ]
  },
  'compteur-mots': {
    howToSteps: [
      "Collez ou tapez votre texte dans la zone de texte",
      "Les statistiques se mettent à jour automatiquement en temps réel",
      "Consultez le nombre de mots, caractères, phrases et paragraphes",
      "Utilisez les résultats pour optimiser votre contenu"
    ],
    faqs: [
      {
        question: "Le comptage est-il précis pour toutes les langues ?",
        answer: "Oui, notre compteur fonctionne avec toutes les langues, y compris celles avec des caractères spéciaux ou des alphabets non-latins."
      },
      {
        question: "Comment sont comptés les chiffres et symboles ?",
        answer: "Les chiffres sont comptés comme des mots séparés. Les symboles de ponctuation ne sont pas comptés comme des mots mais sont inclus dans le nombre de caractères."
      },
      {
        question: "Y a-t-il une limite de texte ?",
        answer: "Non, vous pouvez analyser des textes de n'importe quelle longueur. L'outil gère efficacement même les documents très longs."
      },
      {
        question: "Le compteur fonctionne-t-il hors ligne ?",
        answer: "Une fois la page chargée, le compteur fonctionne entièrement côté client et peut fonctionner sans connexion internet."
      }
    ]
  },
  'formateur-json': {
    howToSteps: [
      "Collez votre code JSON dans l'éditeur",
      "Choisissez le niveau d'indentation (2 ou 4 espaces)",
      "Cliquez sur 'Formater'",
      "Copiez le résultat formaté"
    ],
    faqs: [
      {
        question: "Que faire si mon JSON contient des erreurs ?",
        answer: "Notre formateur détecte les erreurs de syntaxe et vous indique la ligne et la nature du problème pour vous aider à le corriger."
      },
      {
        question: "Puis-je formater du JSON très volumineux ?",
        answer: "Oui, l'outil peut gérer des fichiers JSON de plusieurs mégaoctets, bien que le temps de traitement dépende de votre appareil."
      },
      {
        question: "Le formateur supporte-t-il les commentaires JSON ?",
        answer: "Les commentaires ne font pas partie du standard JSON officiel, mais notre outil les préserve dans la mesure du possible lors du formatage."
      },
      {
        question: "Puis-je minifier mon JSON avec cet outil ?",
        answer: "Oui, l'outil propose une option de minification pour réduire la taille de votre JSON en supprimant espaces et retours à la ligne."
      }
    ]
  },
  'convertisseur-images': {
    howToSteps: [
      "Sélectionnez l'image à convertir",
      "Choisissez le format de sortie (PNG, JPG ou WebP)",
      "Ajustez les paramètres de qualité si nécessaire",
      "Cliquez sur 'Convertir'",
      "Téléchargez votre image convertie"
    ],
    faqs: [
      {
        question: "La conversion réduit-elle la qualité de l'image ?",
        answer: "La perte de qualité dépend du format choisi. PNG vers JPG peut entraîner une légère perte, mais vous pouvez ajuster le niveau de qualité. WebP offre généralement une excellente qualité avec une taille réduite."
      },
      {
        question: "Puis-je convertir plusieurs images simultanément ?",
        answer: "Oui, notre outil supporte la conversion par lot. Vous pouvez sélectionner plusieurs images et les convertir toutes au même format en une seule fois."
      },
      {
        question: "Que devient la transparence lors de la conversion PNG vers JPG ?",
        answer: "Le format JPG ne supporte pas la transparence. Les zones transparentes seront remplacées par un fond blanc ou une couleur de votre choix."
      },
      {
        question: "Quels sont les avantages du format WebP ?",
        answer: "WebP offre une meilleure compression que JPG et PNG, réduisant la taille des fichiers de 25-35% tout en maintenant une qualité similaire. C'est idéal pour améliorer les performances web."
      }
    ]
  },
  'generateur-qrcode': {
    howToSteps: [
      "Entrez le texte ou l'URL à encoder",
      "Personnalisez la taille et la couleur du QR code",
      "Choisissez le niveau de correction d'erreur",
      "Cliquez sur 'Générer'",
      "Téléchargez votre QR code en PNG ou SVG"
    ],
    faqs: [
      {
        question: "Les QR codes générés expirent-ils ?",
        answer: "Non, les QR codes statiques que nous générons n'expirent jamais. Ils fonctionneront indéfiniment tant que le contenu qu'ils pointent reste accessible."
      },
      {
        question: "Quelle est la taille maximale de données pour un QR code ?",
        answer: "Un QR code peut contenir jusqu'à 4 296 caractères alphanumériques, mais pour une meilleure scannabilité, nous recommandons de rester sous 500 caractères."
      },
      {
        question: "Puis-je personnaliser la couleur de mon QR code ?",
        answer: "Oui, vous pouvez personnaliser les couleurs du QR code. Assurez-vous simplement que le contraste entre le code et le fond reste suffisant pour la scannabilité."
      },
      {
        question: "Les QR codes fonctionnent-ils sur tous les smartphones ?",
        answer: "Oui, les QR codes générés sont compatibles avec tous les lecteurs de QR codes standards sur iOS, Android et autres plateformes."
      }
    ]
  },
  'calculateur-pourcentage': {
    howToSteps: [
      "Choisissez le type de calcul de pourcentage",
      "Entrez les valeurs nécessaires",
      "Le résultat s'affiche automatiquement",
      "Utilisez différents modes selon vos besoins"
    ],
    faqs: [
      {
        question: "Comment calculer une réduction de 20% ?",
        answer: "Utilisez le mode 'Réduction' et entrez le prix initial et le pourcentage de réduction (20%). Le calculateur vous donnera automatiquement le montant de la réduction et le prix final."
      },
      {
        question: "Comment trouver quel pourcentage représente un nombre par rapport à un autre ?",
        answer: "Utilisez le mode 'X est quel % de Y ?' et entrez les deux nombres. Le calculateur vous donnera le pourcentage exact."
      },
      {
        question: "Puis-je calculer une augmentation de pourcentage ?",
        answer: "Oui, sélectionnez le mode 'Augmentation' et entrez la valeur initiale ainsi que le pourcentage d'augmentation pour obtenir la nouvelle valeur."
      },
      {
        question: "Le calculateur gère-t-il les nombres décimaux ?",
        answer: "Oui, vous pouvez utiliser des nombres décimaux dans tous les calculs pour obtenir des résultats précis."
      }
    ]
  },
  'maconnerie': {
    howToSteps: [
      "Sélectionnez le type d'élément à calculer (Dalle, Mur, Semelle ou Ouverture)",
      "Entrez les dimensions en mètres (ou cm pour l'épaisseur)",
      "Ajoutez l'élément à votre projet avec le bouton 'Ajouter'",
      "Répétez pour chaque élément de votre chantier",
      "Consultez le récapitulatif des matériaux nécessaires",
      "Téléchargez le devis PDF ou exportez en JSON pour sauvegarder"
    ],
    faqs: [
      {
        question: "Comment calculer la quantité de béton pour une dalle ?",
        answer: "Entrez la longueur, la largeur et l'épaisseur de votre dalle. Le calculateur applique automatiquement le dosage sélectionné (350 kg de ciment par m³ par défaut) et vous donne les quantités de ciment, sable, gravier et eau nécessaires."
      },
      {
        question: "Quelle est la différence entre dosage standard, maigre et riche ?",
        answer: "Le dosage standard (350 kg/m³) convient pour la plupart des ouvrages. Le dosage maigre (250 kg/m³) est utilisé pour les fondations non structurelles. Le dosage riche (400 kg/m³) est recommandé pour les éléments porteurs et les conditions difficiles."
      },
      {
        question: "Comment déduire les ouvertures (portes, fenêtres) ?",
        answer: "Utilisez le module 'Ouverture' pour ajouter les dimensions des portes et fenêtres. Le calculateur déduira automatiquement ce volume du total de béton nécessaire."
      },
      {
        question: "Mes données sont-elles sauvegardées ?",
        answer: "Oui, votre projet est sauvegardé automatiquement dans votre navigateur (localStorage). Vous pouvez aussi exporter en JSON pour une sauvegarde externe ou partager avec un collègue."
      },
      {
        question: "Comment obtenir un devis imprimable ?",
        answer: "Cliquez sur 'Télécharger PDF' pour générer un document récapitulatif avec tous les éléments et les quantités de matériaux. Ce PDF peut être imprimé ou envoyé à un fournisseur."
      }
    ]
  }
}

export function getToolSEOData(toolSlug: string): ToolSEOData | undefined {
  return toolSEOData[toolSlug]
}

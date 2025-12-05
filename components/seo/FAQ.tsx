import { Tool } from '@/lib/tools-config'

interface FAQProps {
  tool: Tool
}

interface FAQItem {
  question: string
  answer: string
}

const toolFAQs: Record<string, FAQItem[]> = {
  'editeur-pdf': [
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
  ],
  'fusionner-pdf': [
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
  ],
  'compteur-mots': [
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
  ],
  'formateur-json': [
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
  ],
  'convertisseur-images': [
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
  ],
  'generateur-qrcode': [
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
  ],
  'calculateur-pourcentage': [
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
}

export default function FAQ({ tool }: FAQProps) {
  const faqs = toolFAQs[tool.slug]

  if (!faqs) {
    return null
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Questions fréquentes (FAQ)
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 group"
          >
            <summary className="font-semibold text-gray-900 dark:text-gray-100 cursor-pointer list-none flex items-center justify-between">
              <span>{faq.question}</span>
              <span className="ml-4 text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

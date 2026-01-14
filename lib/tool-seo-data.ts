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
      "Sélectionnez le type d'élément à calculer : dalle béton, mur, semelle de fondation ou ouverture à déduire",
      "Entrez les dimensions précises : longueur et largeur en mètres, épaisseur en centimètres",
      "Choisissez le dosage adapté à votre ouvrage : standard 350 kg/m³, maigre 250 kg/m³ ou riche 400 kg/m³",
      "Ajoutez l'élément à votre projet et répétez pour chaque partie de votre chantier",
      "Ajustez le pourcentage de pertes (5-10%) et le poids des sacs de ciment (25 ou 35 kg)",
      "Consultez le récapitulatif : volume total en m³, nombre de sacs de ciment, sable et gravier en tonnes",
      "Téléchargez votre devis en PDF professionnel ou exportez en JSON pour sauvegarder votre projet"
    ],
    faqs: [
      {
        question: "Comment calculer le volume de béton pour une dalle en m³ ?",
        answer: "La formule est simple : Longueur (m) × Largeur (m) × Épaisseur (m). Par exemple, pour une dalle de 5m × 3m × 10cm : 5 × 3 × 0,10 = 1,5 m³. Notre calculateur fait ce calcul automatiquement et ajoute une marge pour les pertes."
      },
      {
        question: "Quel est le dosage de ciment pour 1 m³ de béton ?",
        answer: "Le dosage standard est de 350 kg de ciment par m³ de béton, ce qui correspond à 10 sacs de 35 kg. Pour un béton maigre (fondations légères), utilisez 250 kg/m³. Pour un béton riche (piliers, éléments porteurs), montez à 400 kg/m³."
      },
      {
        question: "Combien de sacs de ciment pour 1 m³ de béton ?",
        answer: "Avec un dosage standard de 350 kg/m³ et des sacs de 35 kg, il faut 10 sacs de ciment par m³. Avec des sacs de 25 kg, comptez 14 sacs. Notre calculateur ajuste automatiquement selon le poids de sac choisi."
      },
      {
        question: "Quelle quantité de sable et gravier pour 1 m³ de béton ?",
        answer: "Pour 1 m³ de béton standard, comptez environ 0,4 m³ de sable (soit ~600 kg) et 0,8 m³ de gravier (soit ~1280 kg). Le ratio classique est 1 volume de ciment pour 2 de sable et 3 de gravier."
      },
      {
        question: "Comment calculer le béton pour un mur ?",
        answer: "Le calcul est : Longueur × Hauteur × Épaisseur. Par exemple, un mur de 4m de long, 2,5m de haut et 20cm d'épaisseur : 4 × 2,5 × 0,20 = 2 m³. N'oubliez pas de déduire les ouvertures (portes, fenêtres)."
      },
      {
        question: "Quelle est la différence entre dosage maigre, standard et riche ?",
        answer: "Le dosage maigre (250 kg/m³) convient aux fondations non structurelles et remplissages. Le dosage standard (350 kg/m³) est idéal pour dalles, terrasses et murs. Le dosage riche (400 kg/m³) est réservé aux éléments porteurs, poutres et conditions exigeantes."
      },
      {
        question: "Comment convertir des m³ de sable en tonnes ?",
        answer: "Multipliez le volume par la densité du sable (environ 1500 kg/m³). Exemple : 0,5 m³ × 1500 = 750 kg soit 0,75 tonne. Pour le gravier, la densité est d'environ 1600 kg/m³. Notre calculateur effectue ces conversions automatiquement."
      },
      {
        question: "Combien d'eau pour 1 sac de ciment de 35 kg ?",
        answer: "Comptez environ 17,5 litres d'eau par sac de 35 kg, soit un ratio eau/ciment de 0,5. Ce ratio peut varier de 0,45 à 0,55 selon l'humidité du sable et la consistance souhaitée. Trop d'eau fragilise le béton."
      },
      {
        question: "Comment calculer une semelle de fondation ?",
        answer: "La semelle se calcule : Longueur × Largeur × Hauteur. Pour une semelle filante de 10m de long, 50cm de large et 30cm de haut : 10 × 0,5 × 0,3 = 1,5 m³. Prévoyez un dosage standard à riche (350-400 kg/m³) pour les fondations."
      },
      {
        question: "Comment déduire les ouvertures (portes, fenêtres) du calcul ?",
        answer: "Utilisez le module 'Ouverture' de notre calculateur. Entrez les dimensions de chaque porte/fenêtre et leur quantité. Le volume sera automatiquement soustrait du total. Par exemple, une porte de 2m × 0,9m dans un mur de 20cm = 0,36 m³ à déduire."
      },
      {
        question: "Quelle épaisseur de dalle pour une terrasse ?",
        answer: "Pour une terrasse piétonne, 10 cm suffisent. Pour un garage ou passage de véhicule léger, prévoyez 12 à 15 cm. Pour un passage de véhicules lourds, montez à 20 cm minimum. N'oubliez pas le treillis soudé pour armer la dalle."
      },
      {
        question: "Comment estimer les pertes de béton ?",
        answer: "Les pertes varient de 5% à 10% selon les conditions. Comptez 5% pour un coffrage soigné sur terrain plat, 7% en conditions normales, et jusqu'à 10% sur terrain irrégulier ou pour des petits volumes. Notre calculateur intègre ce paramètre."
      },
      {
        question: "Vaut-il mieux commander du béton prêt à l'emploi ou le faire soi-même ?",
        answer: "Pour les volumes supérieurs à 1-2 m³, le béton prêt à l'emploi (toupie) est plus économique et garantit un dosage précis. Pour les petits travaux, faire son béton à la bétonnière reste viable. Notre outil calcule les quantités pour les deux options."
      },
      {
        question: "Comment arrondir ma commande de béton pour une toupie ?",
        answer: "Les centrales à béton livrent généralement par tranches de 0,25 m³ ou 0,5 m³. Notre calculateur propose l'option d'arrondir automatiquement votre volume. Mieux vaut commander légèrement plus que de manquer de béton en cours de coulage."
      },
      {
        question: "Quel est le temps de séchage du béton ?",
        answer: "Le béton commence à prendre après 2-3 heures et peut être décoffré après 24-48 heures. Il atteint 80% de sa résistance à 7 jours et sa résistance finale à 28 jours. Évitez de marcher sur une dalle fraîche avant 24 heures minimum."
      },
      {
        question: "Mes données de projet sont-elles sauvegardées ?",
        answer: "Oui, votre projet est sauvegardé automatiquement dans votre navigateur (localStorage). Vous pouvez aussi exporter en JSON pour une sauvegarde externe, ou générer un PDF récapitulatif professionnel à imprimer ou envoyer à votre fournisseur."
      },
      {
        question: "Comment calculer le prix de mon béton ?",
        answer: "Multipliez les quantités par les prix unitaires : ciment (~6-8€/sac de 35kg), sable (~30-40€/tonne), gravier (~35-45€/tonne). Pour du béton prêt à l'emploi, comptez 100-150€/m³ livré. Notre outil vous donne les quantités exactes pour établir votre budget."
      }
    ]
  }
}

export function getToolSEOData(toolSlug: string): ToolSEOData | undefined {
  return toolSEOData[toolSlug]
}

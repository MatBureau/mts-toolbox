# MTS-Toolbox

Une collection de 50+ outils en ligne gratuits pour le texte, le développement, les images et les calculs.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build pour la production

```bash
# Créer le build optimisé
npm run build

# Lancer le serveur de production
npm start
```

## 📁 Structure du projet

```
mts-toolbox/
├── app/                          # Pages Next.js (App Router)
│   ├── [category]/              # Pages de catégories dynamiques
│   │   ├── [tool]/              # Pages d'outils dynamiques
│   │   └── page.tsx             # Page catégorie
│   ├── about/                   # Page À propos
│   ├── contact/                 # Page Contact
│   ├── mentions-legales/        # Mentions légales
│   ├── politique-confidentialite/ # Politique de confidentialité
│   ├── layout.tsx               # Layout global
│   ├── page.tsx                 # Page d'accueil
│   ├── globals.css              # Styles globaux
│   └── sitemap.ts               # Génération du sitemap
├── components/
│   ├── tools/                   # Composants des outils
│   ├── ui/                      # Composants UI réutilisables
│   ├── ads/                     # Composants publicitaires
│   ├── seo/                     # Composants SEO
│   ├── ThemeProvider.tsx        # Provider de thème
│   ├── Header.tsx               # En-tête
│   └── Footer.tsx               # Pied de page
├── lib/
│   ├── tools-config.ts          # Configuration des outils
│   └── seo.ts                   # Helpers SEO
├── public/
│   ├── robots.txt               # Fichier robots
│   ├── llms.txt                 # Indexation IA
│   └── llms-full.txt            # Indexation IA détaillée
└── package.json
```

## 🛠️ Technologies utilisées

- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **Déploiement** : Vercel-ready

## ✨ Fonctionnalités

### 31 Outils implémentés

#### Catégorie Texte (10 outils)
1. Compteur de mots et caractères
2. Convertisseur majuscules/minuscules
3. Générateur Lorem Ipsum
4. Suppression des accents
5. Inverseur de texte
6. Encodeur/Décodeur URL
7. Encodeur/Décodeur Base64
8. Générateur de slugs URL
9. Extracteur d'emails
10. Comparateur de texte

#### Catégorie Développement (10 outils)
11. Formateur JSON
12. Formateur SQL
13. Formateur HTML/CSS
14. Minificateur JS/CSS/HTML
15. Testeur de Regex
16. Générateur de mots de passe
17. Générateur d'UUID
18. Convertisseur JSON ↔ CSV
19. Validateur JSON
20. Décodeur JWT

#### Catégorie Calcul & Conversion (5 outils)
21. Calculateur de pourcentage
22. Convertisseur d'unités (longueur, poids, volume)
23. Calculateur de TVA
24. Calculateur d'âge
25. Différence entre dates

#### Catégorie Générateurs (4 outils)
26. Générateur de QR Code
27. Générateur de gradient CSS
28. Générateur de box-shadow CSS
29. Générateur de palette de couleurs

#### Catégorie Utilitaires (2 outils)
30. Minuteur / Chronomètre
31. Détecteur d'IP

### Caractéristiques

- ✅ Mode sombre/clair avec détection automatique
- ✅ Design responsive (mobile, tablette, desktop)
- ✅ SEO optimisé (metadata, structured data, sitemap)
- ✅ Indexation IA (llms.txt)
- ✅ Traitement 100% côté client (confidentialité)
- ✅ Aucune base de données requise
- ✅ Google AdSense intégré (prêt à activer)
- ✅ Google Analytics configuré
- ✅ Formulaire de contact avec API route
- ✅ Configuration PWA complète
- ✅ Performance optimale (Lighthouse 90+)
- ✅ Accessibilité ARIA

## 🎨 Personnalisation

### Ajouter un nouvel outil

1. Ajoutez l'outil dans `lib/tools-config.ts`
2. Créez le composant dans `components/tools/NomOutil.tsx`
3. L'outil sera automatiquement disponible via le routing dynamique

### Modifier les couleurs

Les couleurs sont définies dans `tailwind.config.ts` et `app/globals.css`.

## 📊 SEO

Le site est optimisé pour :
- Les moteurs de recherche (Google, Bing, etc.)
- L'indexation par les IA (Claude, ChatGPT, etc.)
- Les réseaux sociaux (Open Graph, Twitter Cards)

Fichiers SEO :
- `/sitemap.xml` - Généré automatiquement
- `/robots.txt` - Configuration des crawlers
- `/llms.txt` - Indexation IA simple
- `/llms-full.txt` - Indexation IA détaillée

## 💰 Monétisation

Google AdSense est intégré et prêt à être activé :
1. Obtenez votre ID AdSense sur [Google AdSense](https://www.google.com/adsense/)
2. Ajoutez-le dans `.env.local` : `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX`
3. Les emplacements sont déjà configurés :
   - Header : 728x90
   - Sidebar : 300x250
   - In-content : 336x280

## 📊 Analytics

Google Analytics est intégré :
1. Créez une propriété GA4 sur [Google Analytics](https://analytics.google.com/)
2. Copiez votre Measurement ID
3. Ajoutez-le dans `.env.local` : `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

## 📧 Formulaire de contact

Le formulaire de contact est fonctionnel avec 3 options d'intégration :
- **Resend** (recommandé) - Décommentez dans `app/api/contact/route.ts`
- **SendGrid** - Alternative populaire
- **Nodemailer** - Pour SMTP personnalisé

Configuration dans `.env.local` :
```
EMAIL_API_KEY=your_api_key
EMAIL_FROM=contact@mts-toolbox.com
EMAIL_TO=contact@mts-toolbox.com
```

## 🚀 Déploiement

### Configuration des variables d'environnement

Avant de déployer, configurez vos variables d'environnement :

1. Copiez `.env.example` en `.env.local`
2. Remplissez les valeurs nécessaires
3. Sur Vercel/Netlify, ajoutez ces mêmes variables dans les settings

### Vercel (recommandé)

1. Connectez votre repo GitHub à [Vercel](https://vercel.com)
2. Ajoutez les variables d'environnement dans les settings
3. Déployez automatiquement à chaque push

### Netlify

1. Connectez votre repo à [Netlify](https://netlify.com)
2. Build command : `npm run build`
3. Publish directory : `.next`
4. Ajoutez les variables d'environnement

**📖 Guide détaillé : Consultez [DEPLOYMENT.md](DEPLOYMENT.md)**

## 📝 Licence

Ce projet est fourni gratuitement. Usage libre pour usage personnel et commercial.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ajouter de nouveaux outils
- Améliorer les outils existants
- Corriger des bugs
- Améliorer la documentation

## 📧 Contact

- Email : contact@mts-toolbox.com
- Site : https://mts-toolbox.com

## 🎯 Roadmap

### Outils restants à implémenter (19 sur 50)
- Images : 7 outils (conversion, compression, redimensionnement, etc.)
- Calcul : 5 outils restants (salaire, devises, tailles, fuseaux, prêt)
- Générateurs : 4 outils restants (code-barres, mentions légales, noms)
- Utilitaires : 3 outils restants (horloge mondiale, test frappe, compteur)

### Améliorations futures
- ✅ PWA configuré (installable sur mobile)
- ⏳ Support multilingue (FR/EN) - structure prête
- Export/Import des résultats
- Historique local des conversions
- Partage de résultats sur réseaux sociaux
- Mode hors ligne complet
- Tests unitaires

---

Développé avec ❤️ par MTS-Toolbox

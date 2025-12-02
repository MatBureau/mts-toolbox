# Guide de déploiement MTS-Toolbox

## 📋 Checklist avant déploiement

### 1. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX

# Service d'email (optionnel)
EMAIL_API_KEY=your_api_key_here
EMAIL_FROM=contact@mts-toolbox.com
EMAIL_TO=contact@mts-toolbox.com
```

### 2. Obtenir les IDs nécessaires

#### Google Analytics
1. Allez sur [Google Analytics](https://analytics.google.com/)
2. Créez une propriété GA4
3. Copiez le "Measurement ID" (format: G-XXXXXXXXXX)

#### Google AdSense
1. Inscrivez-vous sur [Google AdSense](https://www.google.com/adsense/)
2. Ajoutez votre site
3. Obtenez votre "Client ID" (format: ca-pub-XXXXXXXXXXXXXXXX)
4. Configurez vos emplacements publicitaires :
   - Header : 728x90 (Bannière)
   - Sidebar : 300x250 (Rectangle moyen)
   - Content : 336x280 (Grand rectangle)

#### Service d'email (choix recommandés)

**Option 1: Resend (Recommandé)**
1. Inscrivez-vous sur [Resend](https://resend.com/)
2. Créez une API key
3. Installez : `npm install resend`
4. Décommentez la section Resend dans `app/api/contact/route.ts`

**Option 2: SendGrid**
1. Inscrivez-vous sur [SendGrid](https://sendgrid.com/)
2. Créez une API key
3. Installez : `npm install @sendgrid/mail`
4. Décommentez la section SendGrid dans `app/api/contact/route.ts`

**Option 3: Nodemailer (SMTP)**
1. Utilisez votre propre serveur SMTP
2. Installez : `npm install nodemailer`
3. Décommentez la section Nodemailer dans `app/api/contact/route.ts`

### 3. Générer les icônes PWA

Créez deux icônes :
- `public/icon-192.png` (192x192 pixels)
- `public/icon-512.png` (512x512 pixels)

Vous pouvez utiliser :
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)
- [PWA Asset Generator](https://www.pwabuilder.com/)

### 4. Build et test local

```bash
# Build de production
npm run build

# Test du build
npm start
```

Vérifiez que tout fonctionne sur http://localhost:3000

---

## 🚀 Déploiement sur Vercel (Recommandé)

### Via l'interface Vercel

1. **Créez un compte** sur [Vercel](https://vercel.com)

2. **Connectez votre repo GitHub**
   - Cliquez sur "New Project"
   - Importez votre repository GitHub
   - Autorisez Vercel à accéder au repo

3. **Configurez les variables d'environnement**
   - Dans "Environment Variables", ajoutez :
     - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
     - `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
     - `EMAIL_API_KEY`
     - `EMAIL_FROM`
     - `EMAIL_TO`

4. **Déployez**
   - Cliquez sur "Deploy"
   - Attendez quelques minutes
   - Votre site est en ligne ! 🎉

### Via la CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Configuration du domaine personnalisé

1. Allez dans "Settings" > "Domains"
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer les DNS

---

## 🌐 Déploiement sur Netlify

### Via l'interface Netlify

1. **Créez un compte** sur [Netlify](https://www.netlify.com)

2. **Connectez votre repo**
   - "Add new site" > "Import an existing project"
   - Sélectionnez votre repo GitHub

3. **Configurez le build**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Ajoutez les variables d'environnement**
   - Site settings > Environment variables
   - Ajoutez toutes vos variables

5. **Déployez**

---

## 📊 Après le déploiement

### Vérifications

✅ Le site est accessible
✅ Le mode sombre fonctionne
✅ Tous les outils fonctionnent
✅ Les publicités s'affichent (peut prendre 24-48h pour AdSense)
✅ Google Analytics collecte les données
✅ Le formulaire de contact fonctionne
✅ Le site est responsive sur mobile

### Configuration post-déploiement

#### Google Search Console
1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Ajoutez votre site
3. Soumettez le sitemap : `https://votresite.com/sitemap.xml`

#### Google AdSense
1. Vérifiez que le code AdSense est bien détecté
2. Configurez vos emplacements publicitaires
3. Attendez l'approbation (1-2 semaines)

#### Lighthouse / PageSpeed
1. Testez avec [PageSpeed Insights](https://pagespeed.web.dev/)
2. Visez un score > 90 sur tous les critères

---

## 🔧 Maintenance

### Mise à jour des dépendances

```bash
# Vérifier les updates
npm outdated

# Mettre à jour
npm update

# Mettre à jour Next.js
npm install next@latest react@latest react-dom@latest
```

### Monitoring

- **Vercel Analytics** : Activez dans le dashboard Vercel
- **Google Analytics** : Suivez le trafic quotidien
- **AdSense** : Vérifiez les revenus régulièrement
- **Uptime monitoring** : Utilisez [UptimeRobot](https://uptimerobot.com/)

---

## 🆘 Troubleshooting

### Les publicités ne s'affichent pas
- Vérifiez que votre site est approuvé par AdSense
- Attendez 24-48h après le déploiement
- Désactivez les bloqueurs de pub pour tester

### Google Analytics ne track pas
- Vérifiez le `GA_MEASUREMENT_ID` dans les variables d'environnement
- Ouvrez la console du navigateur pour voir les erreurs
- Utilisez l'extension "Google Analytics Debugger"

### Le formulaire de contact ne fonctionne pas
- Vérifiez les variables d'environnement email
- Consultez les logs Vercel : "Deployments" > "Functions"
- Testez l'API directement : `curl -X POST https://votresite.com/api/contact -d '{"name":"Test","email":"test@test.com","message":"Hello"}'`

### Erreur 500 au chargement
- Vérifiez les logs Vercel
- Assurez-vous que toutes les dépendances sont installées
- Vérifiez que le build local fonctionne

---

## 📈 Optimisations

### Performance
- Les images sont déjà optimisées avec Next.js Image
- Le code est automatiquement split par route
- Le CSS est minifié automatiquement

### SEO
- Sitemap généré automatiquement : `/sitemap.xml`
- Robots.txt configuré : `/robots.txt`
- Meta tags optimisés pour chaque page
- Structured data JSON-LD intégré

### PWA
- Manifest créé : `/manifest.json`
- Optimisé pour "Add to Home Screen"
- Fonctionne en mode standalone

---

## 🎯 Prochaines étapes

1. **Monétisation**
   - Attendez l'approbation AdSense
   - Testez différents formats de pub
   - Optimisez les emplacements

2. **Marketing**
   - Partagez sur les réseaux sociaux
   - Soumettez aux annuaires d'outils
   - Créez du contenu (blog, tutoriels)

3. **Analytics**
   - Suivez les outils les plus utilisés
   - Identifiez les pages à améliorer
   - Analysez le comportement des utilisateurs

4. **Améliorations**
   - Ajoutez les 30 outils restants
   - Implémentez le support multilingue
   - Ajoutez des fonctionnalités premium

---

**Félicitations ! Votre site est maintenant en ligne ! 🎉**

Pour toute question : contact@mts-toolbox.com

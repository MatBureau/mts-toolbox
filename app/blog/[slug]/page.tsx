import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'

interface BlogPost {
  slug: string
  title: string
  description: string
  content: string
  date: string
  category: string
  readTime: string
  keywords: string[]
}

const blogPosts: Record<string, BlogPost> = {
  'comment-editer-pdf-gratuitement': {
    slug: 'comment-editer-pdf-gratuitement',
    title: 'Comment éditer un PDF gratuitement en ligne',
    description: 'Découvrez comment annoter, modifier et signer vos documents PDF directement dans votre navigateur, sans logiciel à installer.',
    date: '2024-12-05',
    category: 'PDF',
    readTime: '5 min',
    keywords: ['éditer pdf', 'pdf gratuit', 'annoter pdf', 'modifier pdf'],
    content: `
      <p>L'édition de fichiers PDF peut sembler complexe, mais avec les bons outils en ligne, c'est devenu simple et accessible à tous. Dans ce guide, nous allons explorer comment éditer vos PDF gratuitement sans installer de logiciel.</p>

      <h2>Pourquoi éditer un PDF en ligne ?</h2>
      <p>L'édition de PDF en ligne présente plusieurs avantages :</p>
      <ul>
        <li><strong>Aucune installation requise</strong> : Travaillez directement depuis votre navigateur</li>
        <li><strong>Accessible partout</strong> : Utilisez n'importe quel appareil connecté à internet</li>
        <li><strong>Gratuit</strong> : Pas besoin d'acheter de logiciel coûteux comme Adobe Acrobat</li>
        <li><strong>Sécurisé</strong> : Les bons outils traitent vos fichiers localement</li>
      </ul>

      <h2>Comment utiliser un éditeur PDF en ligne</h2>
      <p>Voici les étapes simples pour éditer votre PDF :</p>
      <ol>
        <li><strong>Téléchargez votre PDF</strong> : Sélectionnez le fichier depuis votre ordinateur</li>
        <li><strong>Choisissez vos outils</strong> : Texte, formes, dessins, signatures</li>
        <li><strong>Annotez votre document</strong> : Ajoutez vos modifications directement sur le PDF</li>
        <li><strong>Téléchargez le résultat</strong> : Sauvegardez votre PDF modifié</li>
      </ol>

      <h2>Cas d'utilisation courants</h2>
      <p>L'édition de PDF est utile dans de nombreuses situations :</p>
      <ul>
        <li>Signer des contrats et documents officiels</li>
        <li>Remplir des formulaires administratifs</li>
        <li>Annoter des documents pédagogiques</li>
        <li>Corriger des travaux d'étudiants</li>
        <li>Ajouter des notes sur des rapports professionnels</li>
      </ul>

      <h2>Sécurité et confidentialité</h2>
      <p>Lorsque vous éditez des PDF en ligne, la sécurité est primordiale. Choisissez toujours des outils qui :</p>
      <ul>
        <li>Traitent les fichiers localement dans votre navigateur</li>
        <li>N'envoient pas vos données sur des serveurs externes</li>
        <li>Ne conservent pas vos fichiers</li>
        <li>Utilisent des connexions sécurisées (HTTPS)</li>
      </ul>

      <h2>Essayez notre éditeur PDF gratuit</h2>
      <p>Notre éditeur PDF en ligne vous permet d'annoter vos documents en toute sécurité et gratuitement. Tous les traitements sont effectués localement sur votre appareil, garantissant une confidentialité totale.</p>
    `
  },
  'optimiser-images-web': {
    slug: 'optimiser-images-web',
    title: 'Guide complet pour optimiser vos images pour le web',
    description: 'Apprenez à choisir le bon format (WebP, PNG, JPG) et à compresser vos images pour améliorer les performances de votre site.',
    date: '2024-12-04',
    category: 'Images',
    readTime: '8 min',
    keywords: ['optimiser images', 'webp', 'compression images', 'performance web'],
    content: `
      <p>L'optimisation des images est cruciale pour la performance de votre site web. Des images lourdes ralentissent le chargement des pages, augmentent la consommation de bande passante et impactent négativement l'expérience utilisateur.</p>

      <h2>Les formats d'image modernes</h2>
      <h3>PNG - Portable Network Graphics</h3>
      <p>Le format PNG est idéal pour :</p>
      <ul>
        <li>Les images avec transparence</li>
        <li>Les logos et icônes</li>
        <li>Les screenshots</li>
        <li>Les graphiques avec du texte</li>
      </ul>

      <h3>JPG/JPEG - Joint Photographic Experts Group</h3>
      <p>Le format JPG convient parfaitement pour :</p>
      <ul>
        <li>Les photographies</li>
        <li>Les images complexes avec beaucoup de couleurs</li>
        <li>Les arrière-plans</li>
      </ul>

      <h3>WebP - Le format moderne</h3>
      <p>WebP offre le meilleur des deux mondes :</p>
      <ul>
        <li>Support de la transparence comme PNG</li>
        <li>Compression efficace comme JPG</li>
        <li>Taille de fichier réduite de 25-35% en moyenne</li>
        <li>Support croissant par les navigateurs</li>
      </ul>

      <h2>Techniques de compression</h2>
      <h3>Compression avec perte (lossy)</h3>
      <p>Cette méthode réduit considérablement la taille des fichiers en sacrifiant légèrement la qualité. Un taux de qualité de 80-85% est généralement optimal.</p>

      <h3>Compression sans perte (lossless)</h3>
      <p>Préserve la qualité originale tout en réduisant la taille du fichier grâce à une meilleure compression des données.</p>

      <h2>Bonnes pratiques</h2>
      <ol>
        <li><strong>Redimensionnez vos images</strong> : N'utilisez pas une image de 3000px de large si elle sera affichée à 600px</li>
        <li><strong>Choisissez le bon format</strong> : WebP pour le web moderne, JPG pour les photos, PNG pour la transparence</li>
        <li><strong>Compressez intelligemment</strong> : Trouvez le bon équilibre entre qualité et taille</li>
        <li><strong>Utilisez le lazy loading</strong> : Chargez les images uniquement quand elles sont visibles</li>
        <li><strong>Implémentez le responsive images</strong> : Servez différentes tailles selon l'appareil</li>
      </ol>

      <h2>Outils pour optimiser vos images</h2>
      <p>Plusieurs outils en ligne vous permettent d'optimiser vos images facilement :</p>
      <ul>
        <li>Convertisseurs de format (PNG ↔ JPG ↔ WebP)</li>
        <li>Compresseurs d'images</li>
        <li>Redimensionneurs</li>
      </ul>
    `
  },
  'json-guide-debutant': {
    slug: 'json-guide-debutant',
    title: 'JSON pour les débutants : Guide complet',
    description: 'Tout ce que vous devez savoir sur JSON : syntaxe, formatage, validation et utilisation avec des exemples pratiques.',
    date: '2024-12-03',
    category: 'Développement',
    readTime: '10 min',
    keywords: ['json', 'tutoriel json', 'apprendre json', 'format json'],
    content: `
      <p>JSON (JavaScript Object Notation) est devenu le format standard pour l'échange de données sur le web. Dans ce guide, vous découvrirez tout ce qu'il faut savoir pour maîtriser JSON.</p>

      <h2>Qu'est-ce que JSON ?</h2>
      <p>JSON est un format de données textuelles qui permet de représenter des structures de données simples et complexes. Il est :</p>
      <ul>
        <li><strong>Léger</strong> : Facile à lire et à écrire pour les humains</li>
        <li><strong>Universel</strong> : Supporté par tous les langages de programmation modernes</li>
        <li><strong>Structuré</strong> : Permet de représenter des hiérarchies de données</li>
      </ul>

      <h2>Syntaxe de base</h2>
      <h3>Types de données</h3>
      <p>JSON supporte six types de données :</p>
      <ul>
        <li><strong>String</strong> : "texte entre guillemets"</li>
        <li><strong>Number</strong> : 42, 3.14</li>
        <li><strong>Boolean</strong> : true, false</li>
        <li><strong>Null</strong> : null</li>
        <li><strong>Object</strong> : {"clé": "valeur"}</li>
        <li><strong>Array</strong> : [1, 2, 3]</li>
      </ul>

      <h3>Structure d'un objet JSON</h3>
      <p>Un objet JSON est entouré d'accolades et contient des paires clé-valeur :</p>
      <pre><code>{
  "nom": "Dupont",
  "prenom": "Jean",
  "age": 30,
  "actif": true
}</code></pre>

      <h2>Utilisation courante de JSON</h2>
      <h3>APIs RESTful</h3>
      <p>JSON est le format privilégié pour les échanges de données entre serveurs et applications web.</p>

      <h3>Fichiers de configuration</h3>
      <p>De nombreux outils utilisent JSON pour leurs fichiers de configuration (package.json, tsconfig.json, etc.)</p>

      <h3>Stockage de données</h3>
      <p>Les bases de données NoSQL comme MongoDB utilisent un format similaire à JSON.</p>

      <h2>Erreurs courantes à éviter</h2>
      <ul>
        <li>Oublier les guillemets autour des clés</li>
        <li>Utiliser des guillemets simples au lieu de doubles</li>
        <li>Mettre une virgule après le dernier élément</li>
        <li>Oublier de fermer les accolades ou crochets</li>
      </ul>

      <h2>Outils pour travailler avec JSON</h2>
      <p>Plusieurs outils facilitent le travail avec JSON :</p>
      <ul>
        <li><strong>Formateurs</strong> : Embellissent le JSON pour le rendre lisible</li>
        <li><strong>Validateurs</strong> : Vérifient la syntaxe et détectent les erreurs</li>
        <li><strong>Convertisseurs</strong> : Transforment JSON en d'autres formats (CSV, XML)</li>
      </ul>
    `
  },
  'calculer-pourcentages-facilement': {
    slug: 'calculer-pourcentages-facilement',
    title: 'Comment calculer des pourcentages facilement',
    description: 'Maîtrisez tous les types de calculs de pourcentage : réductions, augmentations, proportions et plus encore.',
    date: '2024-12-02',
    category: 'Calcul',
    readTime: '6 min',
    keywords: ['calculer pourcentage', 'pourcentage formule', 'calcul remise', 'calcul tva'],
    content: `
      <p>Les pourcentages sont omniprésents dans notre quotidien : réductions en magasin, taux d'intérêt, statistiques, etc. Maîtriser leur calcul est essentiel.</p>

      <h2>Qu'est-ce qu'un pourcentage ?</h2>
      <p>Un pourcentage est une fraction sur 100. Par exemple, 25% signifie 25 sur 100, soit 0,25 en décimal.</p>

      <h2>Calculs de base</h2>
      <h3>Calculer X% d'un nombre</h3>
      <p>Formule : (Nombre × Pourcentage) ÷ 100</p>
      <p>Exemple : 20% de 150 = (150 × 20) ÷ 100 = 30</p>

      <h3>Calculer quel pourcentage représente X par rapport à Y</h3>
      <p>Formule : (X ÷ Y) × 100</p>
      <p>Exemple : 30 représente quel % de 150 ? (30 ÷ 150) × 100 = 20%</p>

      <h2>Applications pratiques</h2>
      <h3>Calculer une réduction</h3>
      <p>Pour une réduction de 30% sur un article à 80€ :</p>
      <ul>
        <li>Montant de la réduction : 80 × 0,30 = 24€</li>
        <li>Prix final : 80 - 24 = 56€</li>
      </ul>

      <h3>Calculer une augmentation</h3>
      <p>Pour une augmentation de 15% sur un salaire de 2000€ :</p>
      <ul>
        <li>Montant de l'augmentation : 2000 × 0,15 = 300€</li>
        <li>Nouveau salaire : 2000 + 300 = 2300€</li>
      </ul>

      <h3>Calculer la TVA</h3>
      <p>Pour un prix HT de 100€ avec une TVA de 20% :</p>
      <ul>
        <li>Montant TVA : 100 × 0,20 = 20€</li>
        <li>Prix TTC : 100 + 20 = 120€</li>
      </ul>

      <h2>Astuces de calcul mental</h2>
      <ul>
        <li><strong>10%</strong> : Divisez par 10 (déplacez la virgule d'un rang vers la gauche)</li>
        <li><strong>5%</strong> : Calculez 10% puis divisez par 2</li>
        <li><strong>25%</strong> : Divisez par 4</li>
        <li><strong>50%</strong> : Divisez par 2</li>
      </ul>

      <h2>Erreurs à éviter</h2>
      <ul>
        <li>Confondre pourcentage et points de pourcentage</li>
        <li>Appliquer plusieurs pourcentages de manière additive au lieu de multiplicative</li>
        <li>Oublier de diviser par 100 quand nécessaire</li>
      </ul>
    `
  }
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    return {}
  }

  return {
    title: `${post.title} — Blog MTS-Toolbox`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `https://mts-toolbox.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      url: `https://mts-toolbox.com/blog/${post.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = blogPosts[slug]

  if (!post) {
    notFound()
  }

  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'MTS-Toolbox',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MTS-Toolbox',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mts-toolbox.com/logo.png',
      },
    },
  }

  return (
    <>
      <JsonLd data={articleStructuredData} />

      <article className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {post.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {post.readTime} de lecture
            </span>
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(post.date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {post.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {post.description}
          </p>
        </div>

        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            ← Retour au blog
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-gray-900/50 rounded-lg p-6 border border-blue-100 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Essayez nos outils gratuitement
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Mettez en pratique ce que vous avez appris avec notre collection d'outils en ligne gratuits.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Découvrir les outils
          </Link>
        </div>
      </article>
    </>
  )
}

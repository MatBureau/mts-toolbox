import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — MTS-Toolbox | Guides et Astuces',
  description: 'Découvrez nos guides, tutoriels et astuces pour utiliser au mieux vos outils en ligne gratuits.',
  alternates: {
    canonical: 'https://mts-toolbox.com/blog',
  },
}

interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  category: string
  readTime: string
}

const blogPosts: BlogPost[] = [
  {
    slug: 'comment-editer-pdf-gratuitement',
    title: 'Comment éditer un PDF gratuitement en ligne',
    description: 'Découvrez comment annoter, modifier et signer vos documents PDF directement dans votre navigateur, sans logiciel à installer.',
    date: '2024-12-05',
    category: 'PDF',
    readTime: '5 min'
  },
  {
    slug: 'optimiser-images-web',
    title: 'Guide complet pour optimiser vos images pour le web',
    description: 'Apprenez à choisir le bon format (WebP, PNG, JPG) et à compresser vos images pour améliorer les performances de votre site.',
    date: '2024-12-04',
    category: 'Images',
    readTime: '8 min'
  },
  {
    slug: 'json-guide-debutant',
    title: 'JSON pour les débutants : Guide complet',
    description: 'Tout ce que vous devez savoir sur JSON : syntaxe, formatage, validation et utilisation avec des exemples pratiques.',
    date: '2024-12-03',
    category: 'Développement',
    readTime: '10 min'
  },
  {
    slug: 'calculer-pourcentages-facilement',
    title: 'Comment calculer des pourcentages facilement',
    description: 'Maîtrisez tous les types de calculs de pourcentage : réductions, augmentations, proportions et plus encore.',
    date: '2024-12-02',
    category: 'Calcul',
    readTime: '6 min'
  }
]

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Blog MTS-Toolbox
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Guides, tutoriels et astuces pour tirer le meilleur parti de vos outils en ligne
        </p>
      </div>

      <div className="grid gap-6">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {post.category}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {post.readTime} de lecture
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(post.date).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {post.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {post.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-gray-900/50 rounded-lg p-6 border border-blue-100 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Vous cherchez un outil spécifique ?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Parcourez notre collection complète de plus de 50 outils en ligne gratuits pour le texte, le développement, les images, le PDF, les calculs et plus encore.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
        >
          Voir tous les outils
        </Link>
      </div>
    </div>
  )
}

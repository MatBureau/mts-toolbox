import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos — MTS-Toolbox',
  description: 'Découvrez MTS-Toolbox, une collection d\'outils en ligne gratuits pour le texte, le développement, les images et les calculs.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        À propos de MTS-Toolbox
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Notre mission
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            MTS-Toolbox est une collection d'outils en ligne gratuits conçue pour simplifier votre
            travail quotidien. Que vous soyez développeur, rédacteur, designer ou simplement à la
            recherche d'outils pratiques, nous avons ce qu'il vous faut.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pourquoi MTS-Toolbox ?
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>100% Gratuit</strong> : Tous les outils sont totalement gratuits sans limitation</li>
            <li><strong>Confidentialité</strong> : Toutes les données sont traitées localement dans votre navigateur</li>
            <li><strong>Aucune inscription</strong> : Utilisez tous les outils sans créer de compte</li>
            <li><strong>Open source friendly</strong> : Code propre et structure claire</li>
            <li><strong>Performance</strong> : Chargement rapide et interface réactive</li>
            <li><strong>Accessibilité</strong> : Compatible mobile, tablette et desktop</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Nos catégories d'outils
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Texte</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manipulation et analyse de texte : compteurs, convertisseurs, générateurs
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Développement</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Outils pour développeurs : formateurs, validateurs, générateurs
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Images</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Traitement d'images : conversion, compression, redimensionnement
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Calcul & Conversion</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Calculateurs et convertisseurs : devises, unités, pourcentages
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Technologie
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            MTS-Toolbox est construit avec les technologies web modernes :
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Next.js 14 avec App Router</li>
            <li>React 18 et TypeScript</li>
            <li>Tailwind CSS pour le design</li>
            <li>Traitement 100% côté client</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Contact
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Des questions, suggestions ou bugs à signaler ? N'hésitez pas à nous contacter via notre{' '}
            <a href="/contact" className="text-primary-600 hover:underline">
              formulaire de contact
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}

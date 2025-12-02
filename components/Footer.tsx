import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">MTS-Toolbox</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Collection d'outils en ligne gratuits pour le texte, le développement, les images et les calculs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Outils</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/texte" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Texte
                </Link>
              </li>
              <li>
                <Link href="/developpement" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Développement
                </Link>
              </li>
              <li>
                <Link href="/images" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Images
                </Link>
              </li>
              <li>
                <Link href="/calcul" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Calcul & Conversion
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Plus d'outils</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/generateurs" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Générateurs
                </Link>
              </li>
              <li>
                <Link href="/utilitaires" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Utilitaires
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Légal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} MTS-Toolbox. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

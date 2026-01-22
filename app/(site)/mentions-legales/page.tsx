import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales — MTS-Toolbox',
  description: 'Mentions légales et informations juridiques de MTS-Toolbox.',
}

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Mentions légales
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Éditeur du site
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Nom du site :</strong> MTS-Toolbox<br />
            <strong>URL :</strong> https://mts-toolbox.com<br />
            <strong>Email :</strong> contact@mts-toolbox.com
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Hébergement
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Le site est hébergé par Vercel Inc.<br />
            340 S Lemon Ave #4133<br />
            Walnut, CA 91789<br />
            États-Unis
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Propriété intellectuelle
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            L'ensemble du contenu de ce site (structure, textes, logos, images, etc.) est la propriété
            de MTS-Toolbox, à l'exception des marques et logos appartenant à des tiers.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Toute reproduction, distribution, modification ou utilisation du contenu à des fins
            commerciales sans autorisation préalable est interdite.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Limitation de responsabilité
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            MTS-Toolbox met tout en œuvre pour offrir des informations et des outils précis et à jour.
            Toutefois, nous ne pouvons garantir l'exactitude, la précision ou l'exhaustivité des
            informations mises à disposition sur ce site.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            MTS-Toolbox ne pourra être tenu responsable des dommages directs ou indirects résultant
            de l'utilisation de ce site ou de l'impossibilité d'y accéder.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Traitement des données
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Tous les outils de MTS-Toolbox fonctionnent exclusivement côté client dans votre
            navigateur. Aucune donnée saisie dans les outils n'est envoyée à nos serveurs ou à des
            tiers.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Pour plus d'informations sur la protection de vos données, consultez notre{' '}
            <Link href="/politique-confidentialite" className="text-primary-600 hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Loi applicable
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Les présentes mentions légales sont soumises au droit français. Tout litige relatif à
            l'utilisation du site sera de la compétence exclusive des tribunaux français.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Contact
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Pour toute question concernant ces mentions légales, vous pouvez nous contacter à
            l'adresse :{' '}
            <a href="mailto:contact@mts-toolbox.com" className="text-primary-600 hover:underline">
              contact@mts-toolbox.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}

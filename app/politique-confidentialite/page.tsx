import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — MTS-Toolbox',
  description: 'Découvrez comment MTS-Toolbox protège vos données personnelles et respecte votre vie privée.',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Politique de confidentialité
      </h1>

      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-8">
        <p className="text-green-700 dark:text-green-400 font-semibold">
          Votre confidentialité est notre priorité. Tous les outils fonctionnent localement dans
          votre navigateur. Aucune donnée n'est envoyée à nos serveurs.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Collecte de données
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            MTS-Toolbox ne collecte <strong>aucune donnée personnelle</strong> lors de l'utilisation
            des outils. Toutes les opérations (conversion, formatage, calcul, etc.) sont effectuées
            localement dans votre navigateur.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Nous ne collectons pas :
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mt-2">
            <li>Les textes que vous saisissez dans les outils</li>
            <li>Les fichiers que vous téléchargez</li>
            <li>Les résultats générés</li>
            <li>Vos adresses IP</li>
            <li>Vos données de navigation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Cookies
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            MTS-Toolbox utilise uniquement un cookie technique pour :
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mt-2">
            <li>Sauvegarder votre préférence de thème (mode clair/sombre)</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Aucun cookie de tracking, analytics ou publicitaire n'est utilisé.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Traitement local des données
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Tous les outils de MTS-Toolbox sont conçus pour fonctionner entièrement dans votre
            navigateur. Cela signifie que :
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mt-2">
            <li>Vos données ne quittent jamais votre appareil</li>
            <li>Aucun serveur n'a accès à vos informations</li>
            <li>Vous pouvez utiliser les outils hors ligne (après le premier chargement)</li>
            <li>Vos données sont automatiquement supprimées lorsque vous fermez l'onglet</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Liens externes
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Notre site peut contenir des liens vers des sites externes. Nous ne sommes pas
            responsables des pratiques de confidentialité de ces sites. Nous vous recommandons de
            consulter leurs politiques de confidentialité respectives.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Sécurité
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Étant donné que vos données ne sont jamais transmises à nos serveurs, le risque de
            compromission est minimal. Cependant, nous vous recommandons :
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mt-2">
            <li>D'utiliser un navigateur à jour</li>
            <li>D'éviter d'utiliser des outils avec des données extrêmement sensibles sur des réseaux publics</li>
            <li>De ne pas partager vos résultats contenant des informations confidentielles</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Vos droits (RGPD)
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
            d'un droit d'accès, de rectification et de suppression de vos données personnelles.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Cependant, comme nous ne collectons ni ne stockons de données personnelles, ces droits
            ne s'appliquent pas dans le cadre de l'utilisation de nos outils.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Modifications de cette politique
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout
            moment. Les modifications entreront en vigueur dès leur publication sur cette page.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            <strong>Dernière mise à jour :</strong> Décembre 2024
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Contact
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Pour toute question concernant cette politique de confidentialité, vous pouvez nous
            contacter à :{' '}
            <a href="mailto:contact@mts-toolbox.com" className="text-primary-600 hover:underline">
              contact@mts-toolbox.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}

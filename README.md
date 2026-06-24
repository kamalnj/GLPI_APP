# ProjectS2M - Application de supervision

Application web Laravel + Inertia + React permettant de consulter un tableau de bord, un inventaire de machines, des alertes techniques et des informations collaborateurs. Le projet centralise principalement des donnees issues de GLPI et Wazuh, puis les affiche dans une interface web avec des exports Excel.

## Technologies principales

- Backend : Laravel 12, PHP 8.2
- Frontend : React 19, TypeScript, Inertia.js, Vite
- Interface : Tailwind CSS, Radix UI, Recharts, Lucide React
- Authentification : Laravel Fortify
- Exports : Laravel Excel
- Base de donnees : MySQL
- Conteneurs : Docker, Nginx, PHP-FPM, MySQL

## Fonctionnalites

- Authentification, verification email, mot de passe, profil et double authentification.
- Tableau de bord avec statistiques materiel, logiciels, groupes et collaborateurs.
- Inventaire des ordinateurs avec filtres, pagination, details machine, composants, volumes, logiciels et vulnerabilites.
- Alertes sur les disques, patches Windows et inventaires non mis a jour.
- Gestion des collaborateurs avec activite, machines, reseaux et exports par periode.
- Synchronisation des donnees depuis GLPI et Wazuh via commandes Artisan.
- Exports Excel pour inventaire, volumes, patches, vulnerabilites et collaborateurs.

## Installation locale

### Prerequis

- PHP 8.2 ou plus
- Composer
- Node.js et npm
- MySQL

### Etapes

1. Installer les dependances PHP :

```bash
composer install
```

2. Installer les dependances JavaScript :

```bash
npm install
```

3. Creer le fichier d'environnement :

```bash
cp .env.example .env
```

Si le fichier `.env.example` n'existe pas dans votre copie, creer un fichier `.env` a partir de la configuration Laravel habituelle et renseigner la base de donnees, GLPI et Wazuh selon l'environnement.

4. Generer la cle Laravel :

```bash
php artisan key:generate
```

5. Lancer les migrations :

```bash
php artisan migrate
```

6. Demarrer l'application en mode developpement :

```bash
composer run dev
```

Cette commande lance le serveur Laravel, la queue et Vite.

## Installation avec Docker

Le projet contient un fichier `docker-compose.yml` avec trois services :

- `app` : application Laravel/PHP
- `nginx` : serveur web expose sur le port 80
- `mysql` : base MySQL exposee sur le port 3306

Demarrage :

```bash
docker compose up -d --build
```

Ensuite, executer les commandes Laravel dans le conteneur `app` si necessaire :

```bash
docker compose exec app php artisan migrate
```

## Scripts utiles

```bash
composer run dev
npm run dev
npm run build
npm run types
npm run lint
npm run format
composer run test
composer run lint
```

## Structure du projet

```text
app/
  Http/Controllers/      Controleurs Laravel
  Http/Requests/         Validation des requetes
  Models/                Modeles Eloquent
  Services/              Logique metier
  Console/Commands/      Commandes de synchronisation
  Exports/               Exports Excel

resources/
  js/pages/              Pages Inertia React
  js/components/         Composants React reutilisables
  js/layouts/            Layouts de l'application
  js/types/              Types TypeScript partages
  css/app.css            Styles globaux

routes/
  web.php                Routes principales
  settings.php           Routes des parametres utilisateur

database/
  migrations/            Structure de la base de donnees
  seeders/               Donnees initiales
  factories/             Factories de tests

config/                  Configuration Laravel
docker/                  Configuration Docker, Nginx et scripts
tests/                   Tests automatises
```

## Ou modifier quoi ?

### Routes et navigation

- Routes principales : `routes/web.php`
- Routes des parametres utilisateur : `routes/settings.php`
- Menu principal/sidebar : `resources/js/components/app-sidebar.tsx`
- Navigation utilisateur : `resources/js/components/nav-user.tsx`
- Layout global : `resources/js/layouts/app-layout.tsx`

### Tableau de bord

- Controleur : `app/Http/Controllers/DashboardController.php`
- Page React : `resources/js/pages/Dashboard/Index.tsx`
- Services de statistiques :
  - `app/Services/Dashboard/MaterialInventory.php`
  - `app/Services/Dashboard/SoftwareInventory.php`
  - `app/Services/Dashboard/GroupsStats.php`
  - `app/Services/Dashboard/CollaboratorsStats.php`
- Composants React :
  - `resources/js/components/dashboard/MaterialInventory/`
  - `resources/js/components/dashboard/SoftwareInventory/`
  - `resources/js/components/dashboard/GroupsStats/`
  - `resources/js/components/dashboard/CollaboratorsStats/`

### Inventaire

- Liste des machines : `app/Http/Controllers/InventaireController.php`
- Details d'une machine : `app/Http/Controllers/ComputerDetailsController.php`
- Services :
  - `app/Services/Inventaire/ComputerInventoryService.php`
  - `app/Services/Inventaire/ComputerDetailsService.php`
  - `app/Services/Inventaire/StatsInventaire.php`
- Pages React :
  - `resources/js/pages/Inventaire/Index.tsx`
  - `resources/js/pages/Inventaire/Details.tsx`
- Composants React :
  - `resources/js/components/inventaire/`
  - `resources/js/components/inventaire/Details/`
- Requetes de validation :
  - `app/Http/Requests/Inventaire/ListComputersRequest.php`
  - `app/Http/Requests/Inventaire/ShowComputerRequest.php`

### Alertes

- Controleur : `app/Http/Controllers/AlertesController.php`
- Services :
  - `app/Services/Alertes/AlertService.php`
  - `app/Services/Alertes/AlertStatsService.php`
- Page React : `resources/js/pages/Alertes/Index.tsx`
- Composants React : `resources/js/components/Alertes/`
- Graphiques : `resources/js/components/Alertes/charts/`
- Exports :
  - `app/Exports/VolumesExport.php`
  - `app/Exports/PatchExport.php`
  - `app/Exports/InventaireExport.php`

### Collaborateurs

- Controleur : `app/Http/Controllers/CollaborateursController.php`
- Services :
  - `app/Services/Collabs/CollabsService.php`
  - `app/Services/Collabs/CollabDetails.php`
- Pages React :
  - `resources/js/pages/Collaborateurs/Index.tsx`
  - `resources/js/pages/Collaborateurs/Show.tsx`
- Composants React : `resources/js/components/Collabs/`
- Validation : `app/Http/Requests/Collabs/ListCollaborateursRequest.php`
- Export : `app/Exports/CollaborateursExportWithPeriod.php`

### Authentification et profil

- Configuration Fortify : `config/fortify.php`
- Provider Fortify : `app/Providers/FortifyServiceProvider.php`
- Controleurs parametres : `app/Http/Controllers/Settings/`
- Pages React auth : `resources/js/pages/auth/`
- Pages React settings : `resources/js/pages/settings/`

### Modeles et base de donnees

- Modeles principaux :
  - `app/Models/Computer.php`
  - `app/Models/Agents.php`
  - `app/Models/AgentVulne.php`
  - `app/Models/Vulnerabilite.php`
  - `app/Models/ComputerVolumes.php`
  - `app/Models/SoftwareApplication.php`
  - `app/Models/User.php`
- Migrations : `database/migrations/`

Modifier une table existante se fait avec une nouvelle migration Laravel, pas en modifiant directement une ancienne migration deja utilisee en production.

### Synchronisation GLPI et Wazuh

- Service GLPI : `app/Services/GlpiApi.php`
- Services Wazuh :
  - `app/Services/WazuhApiService.php`
  - `app/Services/WazuhIndexerService.php`
- Commandes GLPI :
  - `app/Console/Commands/GlpiSyncComputers.php`
  - `app/Console/Commands/GlpiSyncCPU.php`
  - `app/Console/Commands/GlpiSyncRAM.php`
  - `app/Console/Commands/GlpiSyncOS.php`
  - `app/Console/Commands/GlpiSyncVolumes.php`
  - `app/Console/Commands/GlpiSyncSoftwares.php`
  - `app/Console/Commands/GlpiSyncAntiviruses.php`
- Commandes Wazuh :
  - `app/Console/Commands/SyncWazuhAgents.php`
  - `app/Console/Commands/WazuhInitialImport.php`
  - `app/Console/Commands/WazuhSyncRAM.php`
  - `app/Console/Commands/WazuhSyncVulnerabilities.php`
  - `app/Console/Commands/LinkComputersToAgents.php`
- Commande globale : `app/Console/Commands/RunAllLocalCommands.php`

Pour ajouter une nouvelle synchronisation, creer ou modifier une commande dans `app/Console/Commands/`, placer la logique reutilisable dans `app/Services/`, puis verifier la planification dans `routes/console.php` ou dans la configuration serveur.

### Interface React

- Point d'entree : `resources/js/app.tsx`
- Rendu serveur : `resources/js/ssr.tsx`
- Pages : `resources/js/pages/`
- Composants UI generiques : `resources/js/components/ui/`
- Types partages : `resources/js/types/`
- Styles globaux : `resources/css/app.css`

Pour ajouter une page :

1. Ajouter une route dans `routes/web.php`.
2. Creer ou modifier un controleur dans `app/Http/Controllers/`.
3. Creer la page React dans `resources/js/pages/`.
4. Ajouter les composants reutilisables dans `resources/js/components/`.

## Exports Excel

Les exports sont geres avec Laravel Excel dans `app/Exports/`.

- Vulnerabilites : `app/Exports/VulneExport.php`
- Volumes : `app/Exports/VolumesExport.php`
- Patches : `app/Exports/PatchExport.php`
- Inventaire : `app/Exports/InventaireExport.php`
- Collaborateurs : `app/Exports/CollaborateursExportWithPeriod.php`

Les routes d'export sont definies dans `routes/web.php`.

## Tests et qualite

Lancer les tests Laravel :

```bash
php artisan test
```

Lancer le formatage PHP :

```bash
composer run lint
```

Verifier TypeScript :

```bash
npm run types
```

Compiler le frontend :

```bash
npm run build
```

## Variables d'environnement importantes

Configurer au minimum dans `.env` :

- `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_URL`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- Variables necessaires a GLPI selon `app/Services/GlpiApi.php`
- Variables necessaires a Wazuh selon `app/Services/WazuhApiService.php` et `app/Services/WazuhIndexerService.php`

Ne jamais commiter les secrets, tokens, mots de passe ou cles API.

## Conseils pour les futurs developpeurs

- Garder la logique metier dans `app/Services/` plutot que dans les controleurs.
- Garder les controleurs simples : validation, appel au service, retour Inertia ou export.
- Utiliser les `FormRequest` dans `app/Http/Requests/` pour les filtres et validations.
- Creer des composants React reutilisables lorsque plusieurs pages utilisent la meme interface.
- Ajouter une migration pour toute modification de base de donnees.
- Tester au minimum les routes ou services critiques apres une modification.
- Apres modification frontend, lancer `npm run types` et `npm run build`.
- Apres modification backend, lancer `php artisan test` ou `composer run test`.


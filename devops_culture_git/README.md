# Learning Objectives

## General

**1. Ce qu'est le DevOps, et le problème de collaboration qu'il résout**

Historiquement, les équipes de développement (Dev) et d'exploitation (Ops) travaillaient en silos séparés, avec des objectifs souvent contradictoires : les développeurs veulent livrer des fonctionnalités rapidement, les équipes ops veulent un système stable et évitent le changement. Ce cloisonnement crée des frictions, des livraisons lentes, et une responsabilité diluée quand un incident survient.

Le DevOps résout ce problème en réunissant développement et exploitation dans une seule culture partagée : mêmes objectifs, responsabilité commune du cycle de vie complet d'une application (du code jusqu'à la production), automatisation des tâches répétitives, et collaboration continue plutôt que des livraisons cloisonnées passées "par-dessus le mur".

**2. Ce que signifie CALMS, et à quoi ressemble la boucle DevOps**

CALMS est un acronyme qui résume les piliers de la culture DevOps :

- **C**ulture — collaboration et responsabilité partagée plutôt que silos.
- **A**utomation — automatiser les tâches répétitives (tests, déploiements) pour réduire l'erreur humaine et accélérer les livraisons.
- **L**ean — livrer en petits incréments, mesurer, apprendre, ajuster.
- **M**easurement — mesurer en continu (performance, qualité, stabilité) pour piloter par les faits plutôt que l'intuition.
- **S**haring — partager connaissances, outils et retours d'expérience entre équipes.

La boucle DevOps (souvent représentée en symbole infini ∞) illustre un cycle continu : planifier → coder → construire → tester → livrer → déployer → exploiter → surveiller, puis retour au début. Elle insiste sur le fait qu'il n'y a pas de fin de cycle : le retour d'expérience de la phase "surveiller" nourrit directement la prochaine phase de planification.

**3. Les 4 métriques DORA, leurs définitions, et la différence entre throughput et stabilité**

Les métriques DORA (DevOps Research and Assessment) mesurent la performance d'une équipe logicielle à partir de quatre indicateurs, historiquement répartis en deux catégories :

_Throughput (vitesse de livraison)_

- **Deployment Frequency** : à quelle fréquence l'équipe déploie du code en production.
- **Lead Time for Changes** : le temps entre le commit d'un changement et sa mise en production.

_Stability (fiabilité)_

- **Change Failure Rate** : le pourcentage de déploiements qui provoquent un incident ou nécessitent un correctif en urgence.
- **Time to Restore Service** : le temps nécessaire pour rétablir le service après un incident en production.

La distinction est essentielle : le throughput mesure la vitesse à laquelle l'équipe livre, la stabilité mesure la fiabilité de ce qui est livré. Une équipe performante n'optimise pas l'un au détriment de l'autre — les meilleures équipes livrent vite _et_ de façon fiable, ce qui contredit l'idée reçue qu'aller plus vite signifierait nécessairement casser plus souvent.

**4. Ce qu'est un workflow basé sur les Pull Requests, et pourquoi la revue de code vaut le coup**

Un workflow basé sur les Pull Requests consiste à développer chaque changement sur une branche séparée de la branche principale, puis à proposer formellement son intégration via une Pull Request (PR), qui sert de point de discussion et de validation avant fusion.

La revue de code (code review) qui l'accompagne a plusieurs bénéfices : elle détecte des bugs ou des choix discutables avant qu'ils n'atteignent la branche principale, elle diffuse la connaissance du code entre les membres de l'équipe (plus une seule personne qui "sait"), et elle maintient une cohérence de style et de qualité dans le temps. Le coût (le temps d'attente et de relecture) est largement compensé par la réduction des incidents et la montée en compétence collective qu'elle apporte.

**5. Ce qu'est un commit conventionnel, et pourquoi on standardise les messages de commit**

Un commit conventionnel suit un format structuré : `<type>: <description>`, où `<type>` indique la nature du changement (`feat` pour une nouvelle fonctionnalité, `fix` pour une correction de bug, `docs` pour la documentation, `chore` pour une tâche de maintenance, etc.).

Standardiser les messages de commit permet de générer automatiquement des changelogs, de déterminer automatiquement le type de version à publier (majeure, mineure, patch) selon les types de commits accumulés, et surtout de rendre l'historique Git immédiatement lisible : n'importe qui peut comprendre en un coup d'œil ce qu'un commit a changé et pourquoi, sans avoir à ouvrir le diff.

**6. Pourquoi un conflit de fusion survient, et comment en résoudre un proprement**

Un conflit de fusion (merge conflict) survient quand deux branches modifient la même partie d'un même fichier de façon incompatible, et que Git ne peut pas déterminer automatiquement quelle version garder — typiquement quand deux personnes changent la même ligne d'un fichier sur deux branches différentes.

Le résoudre proprement implique : identifier chaque section en conflit (délimitée par les marqueurs `<<<<<<<`, `=======`, `>>>>>>>`), comprendre l'intention de chaque changement plutôt que de choisir arbitrairement un côté, écrire la version finale qui préserve l'intention des deux changements (ou choisir consciemment laquelle garder si elles sont réellement incompatibles), supprimer les marqueurs de conflit, tester que le résultat fonctionne, puis committer la résolution.

**7. Ce qu'est un post-mortem sans blâme, et pourquoi on refuse de chercher un coupable**

Un post-mortem sans blâme (blameless post-mortem) est un compte-rendu d'incident qui se concentre sur les causes systémiques et les enchaînements de circonstances ayant permis l'incident, plutôt que sur la recherche d'une personne à blâmer.

On refuse de chercher un coupable parce que blâmer une personne pousse les gens à cacher leurs erreurs plutôt qu'à les signaler, ce qui empêche l'équipe d'apprendre et augmente le risque que le même type d'incident se reproduise. Un incident est presque toujours le résultat de plusieurs facteurs combinés (un process manquant, un manque de visibilité, une décision raisonnable sur le moment mais qui s'est révélée insuffisante) — traiter ces causes systémiques, et non punir un individu, est ce qui rend l'organisation réellement plus robuste avec le temps.

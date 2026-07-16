Le fichier `references.json` (déjà généré à côté de ce README) contient les 163 lignes
CODE -> LIBELLE extraites de ton fichier Excel actuel. Il est utilisé par `seed.ts` pour
peupler la table `ReferenceCatalogue` au premier lancement.

Si ton catalogue de références évolue, exporte à nouveau ton Excel en JSON avec le même
format (`[{"code": "...", "libelle": "..."}, ...]`) et relance `npm run prisma:seed`.

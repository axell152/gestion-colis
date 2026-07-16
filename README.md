Mise a jour

# Gestion des colis

Application web de gestion des colis d'agence (remplace l'ancien outil Excel/VBA + Power Automate).

## Fonctionnalités (v1)

- **Préparateur (mobile)** : `/recherche`, `/entree`, `/sortie`
- **Bureau** : `/historique`, `/dispatch` (tableaux par finition E/B/G/A/N)
- Désignation déduite automatiquement de la référence (catalogue importé depuis ton Excel)
- Finition déduite automatiquement de la dernière lettre de la référence

## Ce qu'il reste à faire (prochaines étapes)

- Authentification réelle (NextAuth est ajouté en dépendance mais pas encore branché — les pages utilisent un utilisateur temporaire `demo-user`)
- Génération et lecture des QR codes par colis (lib `qrcode` déjà ajoutée)
- Design mobile (actuellement du HTML minimal, pas encore stylé)
- Gestion des rôles (préparateur vs bureau)

## Démarrage en local

1. **Créer une base PostgreSQL gratuite** : va sur [neon.tech](https://neon.tech) ou [supabase.com](https://supabase.com), crée un projet gratuit, récupère l'URL de connexion.
2. Copie `.env.example` en `.env` et colle ton `DATABASE_URL`.
3. Installe les dépendances :
   ```
   npm install
   ```
4. Crée les tables et importe le catalogue de références :
   ```
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```
5. Lance le serveur de dev :
   ```
   npm run dev
   ```

## Déploiement (gratuit, sans dépendre de ton VPN local)

Comme ton VPN pro doit rester actif en permanence, on évite de dépendre de ta connexion pour la mise en ligne :

1. Crée un dépôt sur GitHub et pousse ce projet (`git push` passe presque toujours à travers un VPN d'entreprise, contrairement à d'autres services).
2. Connecte ce dépôt à [Vercel](https://vercel.com) (gratuit) — chaque `git push` déclenche automatiquement un déploiement **sur les serveurs de Vercel**, pas depuis ta machine.
3. Ajoute la variable d'environnement `DATABASE_URL` (et `NEXTAUTH_SECRET`, `NEXTAUTH_URL`) dans les réglages du projet Vercel.

Résultat : ta machine n'a besoin d'accéder qu'à GitHub pour que tout le reste (build, hébergement, base de données) fonctionne, sans dépendre de ce que ton VPN autorise ou bloque par ailleurs.

## Structure du projet

```
prisma/schema.prisma       modèle de données (Colis, Mouvement, ReferenceCatalogue, User)
prisma/references.json     catalogue CODE -> LIBELLE importé depuis ton Excel
src/lib/finition.ts        déduction de la finition à partir de la référence
src/lib/colis-actions.ts   logique métier (entrée, sortie, déplacement, recherche)
src/app/recherche          page mobile préparateur
src/app/entree             page mobile préparateur
src/app/sortie             page mobile préparateur
src/app/historique         page bureau
src/app/dispatch           page bureau
```

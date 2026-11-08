# Ce qui reste à décider

1. **Nom de domaine** : par exemple `catalogue.ejpcotonou.org`. À reporter dans `deploy/reverse-proxy.example.conf` avant de lancer certbot.
2. **Formules d'encouragement** (`src/lib/encouragements.ts`) : neuf phrases sobres, rédigées pour l'app. À relire par l'équipe, et à remplacer si vous préférez vos propres mots.
3. **Textes ajoutés à l'interface** : « Essaie ici, rien n'est enregistré », la phrase sur la confidentialité, les messages vides. Ils sont hors catalogue, donc à valider.
4. **Partage du PDF** : faut-il un bouton « Partager » (Web Share API, utile sur Android pour WhatsApp) en plus du téléchargement ?
5. **Mesure d'audience** : aucune pour l'instant, ce qui reste cohérent avec « rien n'est envoyé ». Si vous en voulez une, choisissez un outil sans cookie (Plausible, Umami) et adaptez la CSP.
6. **Teintes ajustées pour l'accessibilité** : le texte discret passe de `#66796f` à `#5e7167`, et le texte couleur de famille posé sur sa teinte est assombri. À valider avec la personne qui porte la charte.
7. **Responsable de la mise en ligne** : qui déploie les mises à jour, et à quel rythme.

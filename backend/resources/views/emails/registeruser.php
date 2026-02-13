Ønsker opprettelse av foreningsbruker:


Info til IT-gruppa:

Fornavn: "<?= $firstname ?>"
Etternavn: "<?= $lastname ?>"
E-post: "<?= $email ?>"
Ønsket brukernavn: "<?= $username ?>"
Mobilnr: <?= ($phone ? "\"{$phone}\"" : "ikke registrert") ?>


Godkjenn eller avvis forespørselen:
<?= config('app.url') ?>/intern/users/registrations


Informasjon for foreningsbrukeroppmann: https://foreningenbs.no/confluence/display/IT/LDAP

Ønsker opprettelse av foreningsbruker:


Info til IT-gruppa:

Fornavn: "<?= $firstname ?>"
Etternavn: "<?= $lastname ?>"
E-post: "<?= $email ?>"
Ønsket brukernavn: "<?= $username ?>"
Mobilnr: <?= ($phone ? "\"{$phone}\"" : "ikke registrert") ?>


Kommando for å opprette:
/fbs/drift/nybruker/process.sh <?= $filename ?>


Informasjon for foreningsbrukeroppmann: https://foreningenbs.no/confluence/display/IT/LDAP


Sendt fra <?= isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'] ?>

<?= $_SERVER['HTTP_USER_AGENT'] ?>

Ønsker opprettelse av foreningsbruker:


Info til IT-gruppa:

Fornavn: "<?=$firstname?>"
Etternavn: "<?=$lastname?>"
E-post: "<?=$email?>"
Ønsket brukernavn: "<?=$username?>"
Mobilnr: <?=($phone ? "\"{$phone}\"" : "ikke registrert")?>


Kommando for å opprette:
/fbs/drift/nybruker/process.sh <?=$filename?>


Tekst til bs-info-lista:
<?=$email?> <?=$firstname?> <?=$lastname?>



Sendt fra <?=$_SERVER['REMOTE_ADDR']?>

<?=$_SERVER['HTTP_USER_AGENT']?>

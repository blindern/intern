# Internside Blindern Studenterhjem

Koden som kjører systemet på https://foreningenbs.no/intern/

Siden har til hensikt og ha litt forskjellige verktøy for å gjøre
ulike oppgaver på studenterhjemmet, slik som å generere rapporter
over forbruk på fellesprinteren, administrere brukere til de ulike
systemene, forbedret arrangementplan, m.m.

Rammeverket som brukes heter Laravel.

## Oppsett

* Npm brukes for å installere bower, grunt osv (package.json)
* Bower brukes for js/css-avhengigheter (bower.json)
* Grunt brukes for å kompilere js/css-filer (Gruntfile.js)

For å sette opp dette:

```
npm install
export PATH=$PATH:`pwd`/node_modules/.bin
bower install
grunt less concat
```

Det må lages en spesiell fil hvor man legger inn passord. Denne skal kalles ```.env.php``` og ligge i rotmappa.
```php
<?php

return array(
	'INTERN_KEY' => 'REPLACE',
	'INTERN_MONGODB_PASS' => 'REPLACE',
	'INTERN_MYSQL_PASS' => 'REPLACE'
);
```

Kan også kjøre ```grunt watch``` mens man gjør endringer.

For kjapp oppdatering av produksjonsserver kjør ```deploy.sh```-scriptet.
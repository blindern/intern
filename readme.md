# Internside Blindern Studenterhjem

Koden som kjører systemet på https://foreningenbs.no/intern/

Siden har til hensikt og ha litt forskjellige verktøy for å gjøre
ulike oppgaver på studenterhjemmet, slik som å generere rapporter
over forbruk på fellesprinteren, administrere brukere til de ulike
systemene, forbedret arrangementplan, m.m.

Rammeverket som brukes heter Laravel.

## Oppsett

### Nødvendige pakker på maskinen
* Vi trenger ```npm``` (```$ sudo apt-get install npm``` på Ubuntu) for å sette opp en del av verktøyene vi bruker
* PHP trenger: ext-curl, ext-mcrypt (pakkene ```php5-curl```, ```php5-mcrypt``` på Ubuntu, kjør også ```php5enmod mcrypt``` på Ubuntu)
* Sett opp PHP sin pakkebehandler: composer (https://getcomposer.org/doc/00-intro.md#globally)

### Installasjon
1. Hent filer fra GitHub: ```$ git clone https://github.com/blindern/intern.git```
2. Gå til mappene filene ble lastet ned
3. Sett opp PHP-avhengigheter: ```$ composer install```
4. Installer globale nodejs-avhengigheter (må ha root-tilgang): ```$ npm install -g bower grunt-cli```
5. Installer lokale nodejs-avhengigheter: ```$ npm install```
6. Sett opp [lokal konfigurasjon](#lokal-konfigurasjon)
7. Fortsett på oppdatering

### Oppdatering
1. Oppdater avhengigheter: ```$ bower install``` (```bower``` laster ned/oppdaterer js/css-avhengigheter)
2. Oppdater statiske filer: ```$ grunt``` (vil også kjøre "watcher", trykk ```Ctrl+C``` for å avslutte)

### Utvikling
1. Kjør ```grunt``` og la den kjøre i bakgrunnen mens man gjør utvikling, så vil nye CSS- og JavaScript-filer bli generert automatisk ved endringer.

### Lokal konfigurasjon

Det må lages en spesiell fil hvor man legger inn passord, så dette ikke legges i Git-repoet. Denne skal kalles ```.env.php``` og ligge i rotmappa.
```php
<?php

return array(
    'INTERN_KEY' => 'REPLACE',
    'INTERN_MONGODB_PASS' => 'REPLACE',
    'INTERN_MYSQL_PASS' => 'REPLACE',
    'INTERN_USERS_API_KEY' => 'REPLACE'
);
```
# Internside Blindern Studenterhjem

Koden som kjører systemet på https://foreningenbs.no/intern/

Siden har til hensikt og ha litt forskjellige verktøy for å gjøre
ulike oppgaver på studenterhjemmet, slik som å generere rapporter
over forbruk på fellesprinteren, administrere brukere til de ulike
systemene, forbedret arrangementplan, m.m.

Rammeverket som brukes heter Laravel 5.

## Oppsett

### Nødvendige pakker på maskinen
* Vi trenger ```npm``` (```$ sudo apt-get install npm``` på Ubuntu) for å sette opp en del av verktøyene vi bruker
* PHP trenger: ext-curl, ext-mcrypt (pakkene ```php5-curl```, ```php5-mcrypt``` på Ubuntu, kjør også ```php5enmod mcrypt``` på Ubuntu)
* Sett opp PHP sin pakkebehandler: composer (https://getcomposer.org/doc/00-intro.md#globally)

### Installasjon
1. Hent filer fra GitHub: ```$ git clone https://github.com/blindern/intern.git```
2. Gå til mappene filene ble lastet ned
3. Kopier filen `.env.example` til `.env` og gjør nødvendige endringer
4. Fortsett på oppdatering

### Oppdatering
1. Installer/oppdater PHP-avhengigheter: ```$ composer install``` (leser fra composer.lock hva som skal installeres)
2. Installer/oppdater NodeJS-avhengigheter: ```$ npm install```
3. Generer statiske filer: `$ npm run build` (evt. `$ npm run build-dev` for utviklingsversjon)

### Utvikling
1. Kjør `$ npm run watch` og la den kjøre i bakgrunnen mens man gjør utvikling, så vil nye CSS- og JavaScript-filer bli generert automatisk ved endringer.

## Oppsett for IT-gruppa
For enklere utvikling kan man lagre utviklerversjonen direkte på foreningens server. Man kan da redigere den ved hjelp av f.eks. [nettverksmappa](https://foreningenbs.no/wiki/Foreningens_dokumentarkiv).

1. Opprett din egen adresse ved å lage en mappe i ```/var/www/subdomains```. Hvis mappen kalles ```eksempel```, vil adressen ```https://eksempel.athene.foreningenbs.no/``` se etter filer i ```/var/www/subdomains/eksempel/public```.
2. Opprett mappen ```/var/www/subdomains/<dinadresseher>/public```
3. Lag filen ```/var/www/subdomains/<dinadresseher>/public/.htaccess``` med følgende innhold:
```
RewriteEngine On
RewriteRule ^$ /intern/ [R,L]
```
4. Utfør [normal installasjon](#installasjon) ovenfor, gå først inn i mappen ```/var/www/subdomains/<dinadresseher>``` før du skriver ```git clone ...```
5. Lag symlink slik at ```/intern/..```-forespørslene sendes til internsystemet: Gå inn i ```/var/www/subdomains/<dinadresseher>/public``` og skriv: ```ln -s ../intern/public intern```
6. Du kan nå åpne din egen versjon av internsia ved å gå til https://<dinadresseher>.athene.foreningenbs.no

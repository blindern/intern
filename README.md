# Internside Blindern Studenterhjem

OBS! Dette prosjektet gjennomgår for tiden en omskriving. Prosjektet
er derfor å anse som ustabilt og detaljene i denne README filen er
utadert.

---

Koden som kjører systemet på https://foreningenbs.no/intern/

Siden har til hensikt og ha litt forskjellige verktøy for å gjøre
ulike oppgaver på studenterhjemmet, slik som å generere rapporter
over forbruk på fellesprinteren, administrere brukere til de ulike
systemene, forbedret arrangementplan, m.m.

Rammeverket som brukes heter Laravel 5.

## Oppsett

- Installer [Node.js](https://nodejs.org/en/download/package-manager/)
- Installer [Docker Engine](https://docs.docker.com/engine/installation/)
- Installer [Docker Compose](https://docs.docker.com/compose/install/)

### Installasjon

- `git clone https://github.com/blindern/intern.git`
- `cd intern`
- Kopier `.env.example` til `.env` og tilpass filen
- `npm install`
- `npm run build`
- `docker-compose run --rm fpm composer install`
- `docker-compose up -d`
- Gå til http://localhost:8081/

For å stoppe serveren:

- `docker-compose down`

### Bruke composer og php-kommandoer

Man kan gå inn i Docker-konteineren for å kjøre composer:

- `docker-compose run --rm fpm bash`
- `./artisan`
- `composer version`

### Utvikling av frontend

- `npm run watch` vil kompilere frontend mens man redigerer filer

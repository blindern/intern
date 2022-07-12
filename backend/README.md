# intern backend

## Development

You need Docker, docker-compose, PHP and Composer.
It is also possible to use Docker to run the backend service
locally, but it is not recomended for active development.

1. Copy `.env.template` to `.env`

   You need to set `INTERN_USERS_API_KEY` in order to be able to log in

   TODO: How to get this value

1. Start local database

   ```bash
   docker-compose up database
   ```

1. Install dependencies

   ```bash
   composer install
   ```

1. Run the application

   ```bash
   php artisan serve --port 8081
   ```

1. Check the app

   http://localhost:8081/intern/api/me

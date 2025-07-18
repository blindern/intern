FROM php:8.3-apache@sha256:e58062dec53ca426816c364824191f7f5881ee3c43d16ada7bd1da6072225cac

ENV LANG=C.UTF-8

RUN \
    # system packages
    apt-get update \
    && apt-get install -y --no-install-recommends \
      # antiword is used for matmeny.
      antiword \
      curl \
      git \
      gosu \
      libfreetype6-dev \
      libjpeg62-turbo-dev \
      # pgsql for printerdb
      libpq-dev \
      libpng-dev \
      libssl-dev \
      unzip \
      wget \
    && rm -rf /var/lib/apt/lists/* \
    \
    # php extensions
    && pecl install mongodb-1.18.0 \
    && docker-php-ext-enable mongodb \
    \
    # pgsql for printerdb
    && docker-php-ext-install pdo_pgsql \
    \
    # set up composer
    && EXPECTED_SIGNATURE=$(wget -q -O - https://composer.github.io/installer.sig) \
    && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && ACTUAL_SIGNATURE=$(php -r "echo hash_file('SHA384', 'composer-setup.php');") \
    && if [ "$EXPECTED_SIGNATURE" != "$ACTUAL_SIGNATURE" ]; then \
          >&2 echo 'ERROR: Invalid installer signature'; \
          rm composer-setup.php; \
          exit 1; \
       fi \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer --quiet \
    && rm composer-setup.php \
    \
    # intern
    && mkdir -p /var/intern/cache \
    && mkdir -p /var/intern/logs \
    && mkdir -p /var/intern/meta \
    && mkdir -p /var/intern/sessions \
    && mkdir -p /var/intern/views \
    && chown -R www-data:www-data /var/intern /var/www /var/www/html \
    \
    && a2enmod rewrite remoteip \
    && sed -i 's|/var/www/html|/var/www/html/public|' /etc/apache2/sites-available/000-default.conf

COPY composer.* /var/www/html/

USER www-data

# create directories that are scanned on composer install
# this is later replaced with new source, but we need this
# here to have cache of composer modules to avoid cache miss
# in case only our code is updated and not dependencies
RUN set -eux; \
    mkdir -p \
      database \
      tests \
    ; \
    echo -e '#!/usr/bin/env php\n<?php' >artisan; \
    echo -e '#!/usr/bin/env php\n<?php' >tests/TestCase.php; \
    composer install; \
    mv vendor /var/www/html-vendor; \
    ln -s /var/www/html-vendor /var/www/html/vendor

COPY --chown=www-data:www-data . /var/www/html/

# we run composer install again so the post process commands
# are run
RUN composer install

USER root

VOLUME ["/var/intern"]

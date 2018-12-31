# this setup is only used for development
# currently in production we don't use Docker
# (it should but no time to set up yet)

FROM php:5.6-fpm
MAINTAINER Henrik Steen <henrist@henrist.net>

ENV GOSU_VERSION 1.9

RUN \
    # system packages
    apt-get update \
    && apt-get install -y --no-install-recommends \
      curl \
      git \
      gosu \
      libfreetype6-dev \
      libjpeg62-turbo-dev \
      libmcrypt-dev \
      libpng-dev \
      libssl-dev \
      unzip \
      wget \
    && rm -rf /var/lib/apt/lists/* \
    \
    # php extensions
    && docker-php-ext-install -j$(nproc) mcrypt \
    && pecl install mongo \
    && docker-php-ext-enable mongo \
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
    && mkdir /var/www/.composer \
    && chown www-data:www-data /var/www/.composer

USER root
COPY container/entrypoint.sh /entrypoint.sh
COPY container/dev.sh /dev.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["php-fpm"]

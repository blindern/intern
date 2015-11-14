#!/bin/bash

# This script can be used to deploy the
# application

# The script will load dependencies and
# compile CSS/JS etc.

#git pull
composer install
npm install
gulp --production

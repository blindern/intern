<?php namespace Blindern\Intern\Auth;

use Jenssegers\Mongodb\Eloquent\Model;

/*
 * Dette objektet har til formål å kunne lagre noen variabler
 * i en lokal database for brukere
 */
class LocalUser extends Model
{
    protected $table = 'users';
}

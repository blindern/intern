<?php namespace Blindern\Intern\Auth;

use MongoDB\Laravel\Eloquent\Model;

/*
 * Dette objektet har til formål å kunne lagre noen variabler
 * i en lokal database for brukere
 */
class LocalUser extends Model
{
    protected $table = 'users';
}

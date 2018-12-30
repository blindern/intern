<?php namespace Blindern\Intern\Auth;

/*
 * Dette objektet har til formål å kunne lagre noen variabler
 * i en lokal database for brukere
 */
class LocalUser extends \Eloquent
{
    protected $table = 'users';
}

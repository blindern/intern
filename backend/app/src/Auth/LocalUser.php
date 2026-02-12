<?php namespace Blindern\Intern\Auth;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

/*
 * Dette objektet har til formål å kunne lagre noen variabler
 * i en lokal database for brukere
 */
class LocalUser extends Model
{
    use HasUlids;

    protected $table = 'users';
}

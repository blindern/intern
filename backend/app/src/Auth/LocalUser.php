<?php namespace Blindern\Intern\Auth;

use Blindern\Intern\Support\HasObjectIds;
use Illuminate\Database\Eloquent\Model;

/*
 * Dette objektet har til formål å kunne lagre noen variabler
 * i en lokal database for brukere
 */
class LocalUser extends Model
{
    use HasObjectIds;

    protected $table = 'users';
}

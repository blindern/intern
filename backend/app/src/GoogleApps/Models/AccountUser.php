<?php namespace Blindern\Intern\GoogleApps\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class AccountUser extends Model
{
    use SoftDeletes;

    protected $table = 'googleapps_accountusers';
    protected $casts = ['deleted_at' => 'datetime'];

    // fields:
    // - username (username in FBS system)

    public function account() {
        return $this->belongsTo(Account::class);
    }
}

<?php namespace Blindern\Intern\GoogleApps\Models;

use Jenssegers\Mongodb\Eloquent\Model;
use Jenssegers\Mongodb\Eloquent\SoftDeletes;

class AccountUser extends Model
{
    use SoftDeletes;

    protected $table = 'googleapps_accountusers';
    protected $dates = ['deleted_at'];

    // fields:
    // - username (username in FBS system)

    public function account() {
        return $this->belongsTo(Account::class);
    }
}

<?php namespace Blindern\Intern\GoogleApps\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes;

class Account extends Model
{
    use SoftDeletes;

    protected $table = 'googleapps_accounts';
    protected $casts = ['deleted_at' => 'datetime'];
    //protected $primaryKey = 'accountname';

    // fields:
    // - accountname (name of account in Google Apps)
    // - users (relation to AccountUser model)

    public function users() {
        return $this->hasMany(AccountUser::class);
    }
}

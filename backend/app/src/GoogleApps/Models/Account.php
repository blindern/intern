<?php namespace Blindern\Intern\GoogleApps\Models;

use Jenssegers\Mongodb\Eloquent\Model;
use Jenssegers\Mongodb\Eloquent\SoftDeletes;

class Account extends Model
{
    use SoftDeletes;

    protected $table = 'googleapps_accounts';
    protected $dates = ['deleted_at'];
    //protected $primaryKey = 'accountname';

    // fields:
    // - accountname (name of account in Google Apps)
    // - users (relation to AccountUser model)

    public function users() {
        return $this->hasMany(AccountUser::class);
    }
}

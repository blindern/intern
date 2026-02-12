<?php namespace Blindern\Intern\GoogleApps\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasUlids, SoftDeletes;

    protected $table = 'googleapps_accounts';

    protected $casts = [
        'aliases' => 'array',
    ];

    // fields:
    // - accountname (name of account in Google Apps)
    // - users (relation to AccountUser model)

    public function users() {
        return $this->hasMany(AccountUser::class);
    }
}

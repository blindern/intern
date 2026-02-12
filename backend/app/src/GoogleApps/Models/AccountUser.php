<?php namespace Blindern\Intern\GoogleApps\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountUser extends Model
{
    use HasUlids, SoftDeletes;

    protected $table = 'googleapps_accountusers';

    // fields:
    // - username (username in FBS system)

    public function account() {
        return $this->belongsTo(Account::class);
    }
}

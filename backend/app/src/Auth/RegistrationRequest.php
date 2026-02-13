<?php namespace Blindern\Intern\Auth;

use Blindern\Intern\Support\HasObjectIds;
use Illuminate\Database\Eloquent\Model;

class RegistrationRequest extends Model
{
    use HasObjectIds;

    protected $table = 'registration_requests';

    protected $fillable = [
        'username',
        'firstname',
        'lastname',
        'email',
        'phone',
        'password_hash',
        'status',
        'group_name',
        'processed_by',
        'processed_at',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];

    protected $hidden = [
        'password_hash',
    ];
}

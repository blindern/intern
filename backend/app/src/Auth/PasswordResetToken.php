<?php namespace Blindern\Intern\Auth;

use Blindern\Intern\Support\HasObjectIds;
use Illuminate\Database\Eloquent\Model;

class PasswordResetToken extends Model
{
    use HasObjectIds;

    protected $table = 'password_reset_tokens';

    protected $fillable = [
        'token_hash',
        'username',
        'email',
        'expires_at',
        'used',
    ];

    protected $hidden = [
        'token_hash',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean',
    ];
}

<?php namespace Blindern\Intern\Bukker\Models;

use MongoDB\Laravel\Eloquent\Model;

class Bukk extends Model
{
    /* field list:
       - name
       - awards (list of Award)
       - died (optional year, can be true if unknown year)
    */

    protected $table = 'bukker';
    protected $hidden = ['created_at', 'updated_at'];

    public function awards() {
      return $this->embedsMany(Award::class);
    }
}

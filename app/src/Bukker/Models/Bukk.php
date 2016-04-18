<?php namespace Blindern\Intern\Bukker\Models;

class Bukk extends \Eloquent
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

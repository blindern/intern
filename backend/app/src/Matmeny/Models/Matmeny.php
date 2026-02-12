<?php namespace Blindern\Intern\Matmeny\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use \Carbon\Carbon;

/**
 * Matmeny
 *
 * fields:
 * - day (mandatory) (format: 'YYYY-MM-DD')
 * - text (optional) some additional description for the day
 * - dishes (optional) array of dishes this day
 */
class Matmeny extends Model
{
    use HasUlids;

    protected $table = 'matmeny';
    protected $visible = array('day', 'text', 'dishes');
    protected $appends = array('date_obj');

    protected $casts = [
        'dishes' => 'array',
    ];

    /**
     * Get date object for this day
     *
     * @return Carbon
     */
    public function getDateObjAttribute()
    {
        return Carbon::parse($this->day);
    }
}

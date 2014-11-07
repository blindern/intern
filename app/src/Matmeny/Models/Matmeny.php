<?php namespace Blindern\Intern\Matmeny\Models;

use \Carbon\Carbon;

/**
 * Matmeny
 *
 * fields:
 * - day (mandatory) (format: 'YYYY-MM-DD')
 * - text (optional) some additional description for the day
 * - dishes (optional) array of dishes this day
 */
class Matmeny extends \Eloquent {
    protected $table = 'matmeny';
    protected $visible = array('day', 'text', 'dishes');
    protected $appends = array('date_obj');

    /**
     * Get date object for this day
     *
     * @return Carbon
     */
    public function getDateObjAttribute() {
        return Carbon::parse($this->day);
    }
}
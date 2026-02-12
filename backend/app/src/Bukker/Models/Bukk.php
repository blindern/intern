<?php namespace Blindern\Intern\Bukker\Models;

use Blindern\Intern\Support\HasObjectIds;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Bukk extends Model
{
    use HasObjectIds;

    /* field list:
       - name
       - awards (JSONB array of award objects)
       - died (optional year, can be "true" if unknown year)
    */

    protected $table = 'bukker';
    protected $hidden = ['created_at', 'updated_at'];

    protected function awards(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $awards = json_decode($value, true) ?? [];
                return array_map(function ($award) {
                    $award['image_preview_url'] = null;
                    if (!empty($award['image_file'])) {
                        $award['image_preview_url'] = 'https://foreningenbs.no/intern/assets/images/bukker/preview/' . $award['image_file'];
                    }
                    unset($award['image_file']);
                    return $award;
                }, $awards);
            },
        );
    }

    /**
     * Set awards from raw data (preserves image_file).
     */
    public function setRawAwards(array $awards): void
    {
        $this->attributes['awards'] = json_encode($awards);
    }

    protected function died(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value === 'true') {
                    return true;
                }
                return $value;
            },
            set: function ($value) {
                if ($value === true) {
                    return 'true';
                }
                return $value;
            },
        );
    }
}

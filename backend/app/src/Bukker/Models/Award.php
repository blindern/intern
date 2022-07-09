<?php namespace Blindern\Intern\Bukker\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class Award extends Model
{
    /* field list:
       - year
       - rank (Halv/Hel/Høy)
       - image_file (optional)
       - devise (optional)
       - comment (optional)
    */

    protected $hidden = ['created_at', 'updated_at', 'image_file'];
    protected $appends = ['image_preview_url', 'image_url'];

    function getImagePreviewUrlAttribute() {
        if ($this->image_file) {
            return 'https://foreningenbs.no/intern/assets/images/bukker/preview/' . $this->image_file;
        }
    }

    function getImageUrlAttribute() {
        if ($this->image_file) {
            //return 'https://foreningenbs.no/intern/assets/images/bukker/large/' . $this->image_file;
        }
    }
}

<?php namespace Blindern\Intern\Books\Models;

use Blindern\Intern\Support\HasObjectIds;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasObjectIds;

    protected $table = 'books';

    protected $casts = [
        'authors' => 'array',
        'isbn_data' => 'array',
    ];

    /**
     * Set a barcode for the book
     *
     * The barcodes are built with a sequence number and a random sequence
     * that are formated in HEX.
     *
     * The sequence should be unique for all books.
     *
     * Format: BS-XXXX-XX
     */
    public function setBarcode($barcode)
    {
        // check for unique number
        if (!preg_match('/(BS-[0-9A-F]+-)[0-9A-F]+/', $barcode, $match)) {
            return 'format';
        }

        if (Book::where('bib_barcode', 'like', $match[1].'%')->first()) {
            return 'unique';
        }

        $this->bib_barcode = $barcode;
        $this->save();
        return true;
    }
}

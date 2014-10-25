<?php namespace API;

use Illuminate\Support\Facades\Input;

class BookController extends \Controller {
    public function isbn() {
        $isbnCode = Input::get("isbn");
        return $isbnCode;
    }
} 
<?php namespace App\Http\Controllers\API;

use \App\Http\Controllers\Controller;

class DugnadenOldController extends Controller
{
    public function index()
    {
        //if (!\Auth::member("dugnaden"))
        if (!\Auth::check()) {
            return array();
        }

        $data = @json_decode(@file_get_contents("https://foreningenbs.no/dugnaden/api.php?method=list"), true);

        return $data;
    }
}

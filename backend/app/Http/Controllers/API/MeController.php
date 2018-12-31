<?php namespace App\Http\Controllers\API;

use \Blindern\Intern\Auth\User;
use \Blindern\Intern\Auth\Group;
use \App\Http\Controllers\Controller;

class MeController extends Controller
{
    public function index()
    {
        $user = \Auth::check() ? \Auth::user() : null;
        $is_office = \Blindern\Intern\Auth\Helper::isOffice();

        $data = array(
          "isLoggedIn" => !!$user,
          "isOffice" => $is_office,
          "user" => $user ? $user->toArray(array(), 2) : null,
          "isUserAdmin" => \Auth::member("useradmin")
        );

        return $data;
    }
}

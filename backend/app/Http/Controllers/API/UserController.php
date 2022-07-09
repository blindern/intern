<?php namespace App\Http\Controllers\API;

use \App\Http\Controllers\Controller;

class UserController extends Controller
{
    public function exceptFields($user = null)
    {
        // begrense felter?
        $except = array();
        //$access = \Auth::member("useradmin") || \Auth::member("kollegiet") || \Auth::member("dugnaden") || \Auth::member('foreningsstyret');
        $access = \Auth::check(); // allow for all logged in users
        if ((!$user || !\Auth::user()->isSame($user)) && !$access) {
            $except[] = 'phone';
            $except[] = 'email';
        }

        return $except;
    }

    public function index()
    {
        $ret = array();
        $users = \User::all();
        foreach ($users as $user) {
            $ret[] = $user->toArray($this->exceptFields($user));
        }

        return $ret;
    }

    public function show($username)
    {
        $user = \User::find($username);
        if (is_null($user)) {
            \App::abort(404);
        }

        $user->loadGroups(false);
        return $user->toArray($this->exceptFields($user), 2);
    }
}

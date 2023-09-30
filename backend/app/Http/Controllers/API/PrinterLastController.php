<?php namespace App\Http\Controllers\API;

use \Blindern\Intern\Auth\User;
use \Blindern\Intern\Printer\Printer;
use \App\Http\Controllers\Controller;

class PrinterLastController extends Controller
{
    public function index()
    {
        $p = new Printer();
        $last = $p->getLastPrints(30);

        // fetch all usernames
        $users = array();
        foreach ($last as $row) {
            $users[] = $row['username'];
        }

        $users = User::all(); // TODO: filter by array_unique($users)
        $names = array();
        foreach ($users as $user) {
            $names[$user->username] = $user->realname;
        }

        // fill with realnames
        foreach ($last as &$row) {
            $rn = isset($names[$row['username']]) ? $names[$row['username']] : $row['username'];
            $row['realname'] = $rn;
        }

        return $last;
    }
}

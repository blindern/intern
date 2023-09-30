<?php namespace App\Http\Controllers\API;

use \Blindern\Intern\Auth\User;
use \Blindern\Intern\Auth\Group;
use \Blindern\Intern\Printer\Printer;
use \Blindern\Intern\Printer\PrinterConfig;
use \App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PrinterUsageController extends Controller
{
    public function index(Request $request)
    {
        $validatedData = $this->validate($request, [
            'from' => 'required|regex:/^\\d\\d\\d\\d-\\d\\d-\\d\\d$/',
            'to' => 'required|regex:/^\\d\\d\\d\\d-\\d\\d-\\d\\d$/',
        ]);

        $from = $validatedData['from'];
        $to = $validatedData['to'];

        $p = new Printer();
        $data['prints'] = $p->getUsageData($from, $to);
        $data['texts'] = PrinterConfig::$texts;
        $data['no_faktura'] = PrinterConfig::$no_faktura;
        $data['from'] = $from;
        $data['to'] = $to;
        $data['daily'] = $p->getDailyUsageData($from, $to);
        $data['sections'] = PrinterConfig::$sections;
        $data['section_default'] = PrinterConfig::$section_default;
        $data['accounts'] = PrinterConfig::$accounts;

        // fetch all usernames
        $usernames = array();
        foreach ($data['prints'] as $group) {
            foreach ($group['users'] as $user) {
                $usernames[] = $user['username'];
            }
        }

        $users = User::all(); // TODO: filter by array_unique($users)
        $realnames = array();
        foreach ($users as $user) {
            $realnames[strtolower($user->username)] = $user->realname;
        }
        $data['realnames'] = $realnames;

        $beboer = Group::find("beboer");
        $beboere = array();
        if ($beboer) {
            $beboere = $beboer->getMembers();
        }

        // find out who is not beboer any longer
        $utflyttet = array();
        foreach ($users as $user) {
            if (!in_array(strtolower($user->username), $beboere)) {
                $utflyttet[] = strtolower($user->username);
            }
        }
        $data['utflyttet'] = $utflyttet;

        return $data;
    }
}

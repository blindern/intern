<?php namespace API;

use \Blindern\Intern\Auth\User;
use \Blindern\Intern\Auth\Group;

class PrinterUsageController extends \Controller {
	public function index()
	{
		// TODO: Error message
		if (!\Auth::member("lpadmin")) return;

		$from = \Input::get("from");
		$to = \Input::get("to");

		// hent data fra printserveren
		$data = @json_decode(@file_get_contents("https://p.blindern-studenterhjem.no/api.php?method=fakturere&from=$from&to=$to"), true);

		// fetch all usernames
		$usernames = array();
		foreach ($data['prints'] as $group)
		{
			foreach ($group['users'] as $user)
			{
				$usernames[] = $user['username'];
			}
		}
		
		$users = User::all(); // TODO: filter by array_unique($users)
		$realnames = array();
		foreach ($users as $user)
		{
			$realnames[strtolower($user->username)] = $user->realname;
		}
		$data['realnames'] = $realnames;

		$beboer = Group::find("beboer");
		$beboere = array();
		if ($beboer)
		{
			$beboere = $beboer->getMembers();
		}

		// find out who is not beboer any longer
		$utflyttet = array();
		foreach ($users as $user)
		{
			if (!in_array(strtolower($user->username), $beboere))
			{
				$utflyttet[] = strtolower($user->username);
			}
		}
		$data['utflyttet'] = $utflyttet;

		return $data;
	}
}

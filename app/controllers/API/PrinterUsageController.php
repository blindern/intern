<?php namespace API;

use \HenriSt\OpenLdapAuth\Helpers\Ldap;

class PrinterUsageController extends \Controller {
	public function index()
	{
		// TODO: Error message
		if (!\Auth::member("lpadmin")) return;

		// set up LDAP
		$config = app()->config['auth']['ldap'];
		$ldap = new Ldap($config);

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
		
		$users = $ldap->get_users_by_usernames(array_unique($usernames));
		$realnames = array();
		foreach ($users as $user)
		{
			$realnames[strtolower($user->username)] = $user->realname;
		}
		$data['realnames'] = $realnames;

		// fetch all members of 'beboer'-group
		$r = ldap_search($ldap->get_connection(), "ou=Groups,dc=blindern-studenterhjem,dc=no", "(&(objectClass=posixGroup)(cn=beboer))", array("memberUid"));
		$e = ldap_get_entries($ldap->get_connection(), $r);

		$beboere = array();
		for ($i = 0; $i < $e['count']; $i++)
		{
			if (!empty($e[$i]['memberuid']))
			{
				for ($j = 0; $j < $e[$i]['memberuid']['count']; $j++)
				{
					$beboere[] = $e[$i]['memberuid'][$j];
				}
			}
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

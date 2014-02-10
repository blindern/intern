<?php namespace API;

use \HenriSt\OpenLdapAuth\Helpers\Ldap;

class PrinterLastController extends \Controller {
	public function index()
	{
		// set up LDAP
		$config = app()->config['auth']['ldap'];
		$ldap = new Ldap($config);

		// hent siste utskrifter fra printserveren
		$last = @json_decode(@file_get_contents("https://p.blindern-studenterhjem.no/api.php?method=pykotalast"), true);

		// fetch all usernames
		$users = array();
		foreach ($last as $row)
		{
			$users[] = $row['username'];
		}

		$users = array_unique($users);
		$names = array();
		foreach ($users as $user)
		{
			$names[$user] = $ldap->get_user_details($user)['realname'];
		}

		// fill with realnames
		foreach ($last as &$row)
		{
			$rn = isset($names[$row['username']]) ? $names[$row['username']] : $row['username'];
			$row['realname'] = $rn;
		}

		return $last;
	}
}

<?php

use \HenriSt\OpenLdapAuth\Helpers\Ldap;

class PrinterController extends Controller {
	public function action_last()
	{
		// hent siste utskrifter fra printserveren
		$last = @json_decode(@file_get_contents("https://p.blindern-studenterhjem.no/api.php?method=pykotalast"), true);

		return View::make("printer/last", array("prints" => $last));
	}

	public function action_fakturere()
	{
		// TODO: Error message
		if (!Auth::member("lpadmin")) return;

		// set up LDAP
		$config = app()->config['auth']['ldap'];
		$ldap = new Ldap($config);

		$from = "2013-04-01";
		$to = "2014-01-31";

		// hent data fra printserveren
		$data = @json_decode(@file_get_contents("https://p.blindern-studenterhjem.no/api.php?method=fakturere&from=$from&to=$to"), true);

		/*
		api data:

		prints
		  [printername]
		    [username]
		      []
		        jobyear
		        jobmonth
		        count_jobs
		        sum_jobsize
		        last_jobdate
		        cost_each
		texts
		  [printername] => text
		no_faktura
		  [] => printername
		from => date
		to => date
		*/

		// fetch all usernames
		$users = array();
		foreach ($data['prints'] as $group)
		{
			foreach (array_keys($group) as $user)
			{
				$users[] = $user;
			}
		}
		$users = array_unique($users);

		// fetch names for users
		$names = array();
		foreach ($users as $user)
		{
			$names[$user] = $ldap->get_user_details($user);
		}
		$data['names'] = $names;

		// sorter gruppene
		foreach ($data['prints'] as &$group)
		{
			$name_sort = array();
			foreach (array_keys($group) as $user)
			{
				$name_sort[] = strtolower(isset($names[$user]) ? $names[$user]['realname'] : $user);
			}

			array_multisort($name_sort, $group);
		}

		// koble til LDAP
		$ad = ldap_connect("ldap://ldap.blindern-studenterhjem.no") or die("Kunne ikke koble til LDAP-database");
		ldap_start_tls($ad);

		// hent alle medlemmer av beboer-, og utflyttet-gruppa
		$r = ldap_search($ad, "ou=Groups,dc=blindern-studenterhjem,dc=no", "(&(objectClass=posixGroup)(|(cn=beboer)(cn=utflyttet)))", array("cn", "gidNumber", "memberUid"));
		$e = ldap_get_entries($ad, $r);

		$grupper = array();
		for ($i = 0; $i < $e['count']; $i++)
		{
			if (!empty($e[$i]['memberuid']))
			{
				for ($j = 0; $j < $e[$i]['memberuid']['count']; $j++)
				{
					$grupper[$e[$i]['cn'][0]][] = $e[$i]['memberuid'][$j];
				}
			}
		}
		$data['grupper'] = $grupper;

		return View::make("printer/fakturere", $data);
	}
}
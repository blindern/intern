<?php namespace App\Http\Controllers;

use \HenriSt\OpenLdapAuth\Helpers\Ldap;

class UsersController extends Controller {
	public function action_userlist() {
		// no access?
		if (!\Auth::member("beboer"))
		{
			return \View::make('auth/noaccess', array("group" => "beboer"));
		}

		// set up LDAP
		$config = app()->config['auth']['ldap'];
		$ldap = new Ldap($config);

		// retrieve info
		$users = $ldap->get_users();
		$groups = $ldap->get_groups();

		foreach ($users as &$user)
		{
			$user['groups'] = array();
		}

		$users_not_found = array();
		foreach ($groups as $group)
		{
			foreach ($group['members'] as $member)
			{
				if (!isset($users[$member]))
				{
					$users_not_found[] = array($group, $member);
				}
				else
				{
					$users[$member]['groups'][] = &$group;
				}
			}
			unset($group);
		}

		$data = array(
			"users" => $users,
			"users_not_found" => $users_not_found,
			"groups" => $groups
		);

		return \View::make('users/userlist', $data);
	}
}
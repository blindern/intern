<?php namespace API;

use \HenriSt\OpenLdapAuth\Helpers\Ldap;

class GroupController extends \Controller {
	public function index()
	{
		$config = app()->config['auth']['ldap'];
		$ldap = new Ldap($config);

		$groups = $ldap->get_groups(false);
		return array_values($groups);
	}

	public function show($group)
	{
		$config = app()->config['auth']['ldap'];
		$ldap = new Ldap($config);

		$group = $ldap->get_groups(true, sprintf('(%s=%s)', $ldap->config['group_fields']['unique_id'], Ldap::escape_string($group)));
		if ($group)
		{
			$uc = new \API\UserController();

			$group = reset($group);
			$members = $group['members'];
			if (count($members))
			{
				// get full objects
				$group['members'] = array();
				$realnames = array();
				foreach ($ldap->get_users_by_usernames($members) as $user)
				{
					$group['members'][] = $user->toArray($uc->exceptFields($user));
					$realnames[] = $user->realname;
				}

				// sort by realname
				array_multisort($realnames, $group['members']);
			}

			return $group;
		}
	}
}
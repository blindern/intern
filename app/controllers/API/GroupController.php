<?php namespace API;

use \Blindern\Intern\Auth\Group;

class GroupController extends \Controller {
	public function index()
	{
		$groups = array();
		foreach (Group::all() as $group)
		{
			$groups[] = $group->toArray();
		}

		return $groups;
	}

	public function show($group)
	{
		$group = Group::find($group);
		if (is_null($group)) {
			\App::abort(404);
		}

		$c = new UserController();

		$group->getMembers();
		return $group->toArray(array(), 2, $c->exceptFields());
	}

	/*			// get full objects
				$group['members'] = array();
				$realnames = array();
				foreach ($ldap->get_users_by_usernames($members) as $user)
				{
					$group['members'][] = $user->toArray($uc->exceptFields($user));
					$realnames[] = $user->realname;
				}

				// sort by realname
				array_multisort($realnames, $group['members']);*/
}
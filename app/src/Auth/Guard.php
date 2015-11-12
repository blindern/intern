<?php namespace Blindern\Intern\Auth;

class Guard extends \Illuminate\Auth\Guard {
	/**
	 * Check if we have access to a group
	 * Guests never have access
	 *
	 * @param string $group Name of group
	 * @param boolean $superadmin Allow superadmin (in group if superadmin)
	 * @return boolean
	 */
	public function member($group, $allow_superadmin = true)
	{
		$user = $this->user();
		if ($user && $user->inGroup($group, $allow_superadmin))
		{
			return true;
		}

		return false;
	}
}
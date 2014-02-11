<?php namespace API;

class UserController extends \Controller {
	public function exceptFields($user = null)
	{
		// begrense felter?
		$except = array();
		if ((!$user || !\Auth::user()->isSame($user)) && !\Auth::member("useradmin"))
		{
			//$except[] = 'phone'; // TODO: not implemented
			$except[] = 'email';
		}

		return $except;
	}

	public function index()
	{
		$ret = array();
		$users = \User::all(true);
		foreach ($users as $user)
		{
			$ret[] = $user->toArray($this->exceptFields($user));
		}

		return $ret;
	}

	public function show($username)
	{
		$user = \User::find($username);
		$user->groups();

		return $user->toArray($this->exceptFields($user));
	}

	// return View::make('auth/noaccess', array("group" => "beboer"));
}

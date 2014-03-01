<?php namespace Blindern\Intern\Auth;

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;
use Httpful\Request;

class Group  {
	/**
	 * Cache objects
	 */
	public static $cache = array();

	/**
	 * Find a specific group
	 *
	 * @param string name of group
	 * @param array data of group of already loaded (to avoid duplicate objects)
	 */
	public static function find($groupname, $data = array())
	{
		if (!isset(static::$cache[$groupname]))
		{
			if (!$data)
			{
				$response = Request::get(Helper::uri('group/'.$groupname))->send();

				if (isset($response->body['result']))
				{
					$data = $response->body['result'];
				}
			}

			if ($data)
			{
				$group = new Group($data);
				static::$cache[$group->unique_id] = $group;
			}
		}

		else
		{
			if (isset($data['members']))
			{
				static::$cache[$groupname]->members = $data['members'];
			}
		}

		return static::$cache[$groupname];
	}

	/**
	 * Find all groups
	 */
	public static function all()
	{
		$response = Request::get(Helper::uri('groups'))->send();

		$groups = array();
		if (isset($response->body['result']))
		{
			foreach ($response->body['result'] as $group)
			{
				$groups[] = static::find($group['unique_id'], $group);
			}
		}

		return $groups;
	}

	/**
	 * All of the group's attributes.
	 *
	 * @var array
	 */
	protected $attributes;

	/**
	 * Attributes updated but not stored
	 *
	 * @var array
	 */
	protected $attributes_updated = array();

	/**
	 * New group object not stored?
	 *
	 * @var bool
	 */
	protected $is_new = false;

	/**
	 * Members of the group
	 *
	 * @var array for username strings
	 */
	protected $members;

	/**
	 * Constructor
	 *
	 * @param  array  $attributes
	 * @return void
	 */
	public function __construct(array $attributes)
	{
		if (isset($attributes['members']))
		{
			$this->setMembers($attributes['members']);
			unset($attributes['members']);
		}

		$this->attributes = $attributes;
		$this->is_new = empty($attributes);
	}

	/**
	 * Store changes to server, including new groups
	 */
	public function store()
	{
		throw new \Exception("Not implemented");
	}

	/**
	 * Set list of members
	 */
	public function setMembers($list)
	{
		$this->members = array();
		foreach ($list as $user)
		{
			$this->members[] = is_array($user) ? User::find($user['unique_id'], $user) : $user;
		}
	}

	/**
	 * Load members-structure if not loaded
	 */
	public function loadMembers()
	{
		/*
		 * we assume the members-array is always filled
		 */
		if (!empty($this->members) && !($this->members[0] instanceof User))
		{
			$response = Request::get(Helper::uri('group/'.$this->unique_id))->send();
			if (isset($response->body['result']['members']))
			{
				$this->setMembers($response->body['result']['groups']);
			}
		}
	}

	/**
	 * Get list of members
	 */
	public function getMembers()
	{
		if ($this->members == null)
		{
			// load members
			$response = Request::get(Helper::uri('group/'.$this->unique_id))->send();
			if (isset($response->body['result']['members']))
			{
				$this->__construct($response->body['result']);
			}
		}

		return (array) $this->members;
	}

	/**
	 * Add user to group
	 */
	public function addUser(User $user)
	{
		// TODO
		throw new \Exception("Not implemented");
	}

	/**
	 * Remove user from group
	 */
	public function removeUser(User $user)
	{
		// TODO
		throw new \Exception("Not implemented");
	}

	/**
	 * Dynamically access the group's attributes.
	 *
	 * @param  string  $key
	 * @return mixed
	 */
	public function __get($key)
	{
		return $this->attributes[$key];
	}

	/**
	 * Dynamically set an attribute on the group.
	 *
	 * @param  string  $key
	 * @param  mixed   $value
	 * @return void
	 */
	public function __set($key, $value)
	{
		$this->attributes[$key] = $value;
		$this->attributes_updated[] = $key;
	}

	/**
	 * Dynamically check if a value is set on the group.
	 *
	 * @param  string  $key
	 * @return bool
	 */
	public function __isset($key)
	{
		return isset($this->attributes[$key]);
	}

	/**
	 * Dynamically unset a value on the group.
	 *
	 * @param  string  $key
	 * @return bool
	 */
	public function __unset($key)
	{
		unset($this->attributes[$key]);
	}

	/**
	 * Array-representation
	 *
	 * @param array Fields to ignore
	 * @param int Expand members? (0=no, 1=only names, 2=structure with group names)
	 * @param array User fields to ignore
	 * @return array
	 */
	public function toArray(array $except = array(), $expand_members = 1, array $except_members = array())
	{
		$d = $this->attributes;
		foreach ($except as $e)
			unset($d[$e]);

		// members?
		if (!is_null($this->members) && $expand_members > 0)
		{
			$members = array();
			foreach ($this->members as $user)
			{
				if ($user instanceof User)
				{
					$except = $expand_members < 3 ? array("") : array();
					$except = array_merge($except, $except_members);
					$members[] = $expand_members != 1 ? $user->toArray($except) : $user->username;
				}
				else
				{
					$members[] = $user;
				}
			}

			return array_merge($d, array("members" => $members));
		}

		return $d;
	}

	/**
	 * Make array for JSON
	 *
	 * @return array
	 */
	/*public function jsonSerialize()
	{
		return $this->toArray();
	}*/
}

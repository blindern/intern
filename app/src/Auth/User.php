<?php namespace Blindern\Intern\Auth;

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;
use Httpful\Request;

class User implements UserInterface, RemindableInterface {
	/**
	 * Cache objects
	 */
	public static $cache = array();

	/**
	 * Find a specific user
	 */
	public static function find($username, $data = array())
	{
		if (!isset(static::$cache[$username]))
		{
			if (!$data)
			{
				$response = Request::get(Helper::uri('user/'.$username))->send();

				if (isset($response->body['result']))
				{
					$data = $response->body['result'];
				}
			}

			if ($data)
			{
				$user = new User($data);
				static::$cache[$user->unique_id] = $user;
			}
		}

		return static::$cache[$username];
	}

	/**
	 * Find all users
	 */
	public static function all()
	{
		$response = Request::get(Helper::uri('users') . "?grouplevel=1")->send();

		$users = array();
		if (isset($response->body['result']))
		{
			foreach ($response->body['result'] as $user)
			{
				$users[] = static::find($user['unique_id'], $user);
			}
		}

		return $users;
	}

	/**
	 * All of the user's attributes.
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
	 * New user object not stored?
	 *
	 * @var bool
	 */
	protected $is_new = false;

	/**
	 * Group list
	 *
	 * @var array of groups
	 */
	protected $groups;

	/**
	 * Create a new generic User object.
	 *
	 * @param  array  $attributes
	 * @return void
	 */
	public function __construct(array $attributes)
	{
		if (isset($attributes['groups']))
		{
			$this->setGroups($attributes['groups']);
			unset($attributes['groups']);
		}

		$this->attributes = $attributes;
		$this->is_new = empty($attributes);
	}

	/**
	 * Get the unique identifier for the user.
	 *
	 * @return mixed
	 */
	public function getAuthIdentifier()
	{
		return $this->attributes['username'];
	}

	/**
	 * Get the password for the user.
	 *
	 * @return string
	 */
	public function getAuthPassword()
	{
		// Not available
		return null;
	}

	/**
	 * Check if user is in a group
	 *
	 * @param string $group Name of group
	 * @param boolean $superadmin Allow superadmin (in group if superadmin)
	 * @return boolean
	 */
	public function inGroup($group, $allow_superadmin = true)
	{
		$this->loadGroups();

		$allow_superadmin = $allow_superadmin ? app()->config['auth']['superadmin_group'] : null;
		foreach ($this->groups as $row)
		{
			$name = $row instanceof Group ? $row->name : $row;
			if ($name == $group || $name == $allow_superadmin)
			{
				return true;
			}
		}

		return false;
	}

	/**
	 * Get list of groupnames
	 *
	 * @return array of groupnames
	 */
	public function groups($refresh = false)
	{
		if ($refresh || is_null($this->groups))
		{
			$this->loadGroups();
		}

		$list = array();
		if (!is_null($this->groups))
		{
			foreach ($this->groups as $group)
			{
				if (is_string($group)) $list[] = $group;
				else $list[] = $group->name;
			}
		}
		
		return $list;
	}

	/**
	 * Set group variable
	 */
	protected function setGroups($list)
	{
		$this->groups = array();
		foreach ($list as $group)
		{
			$this->groups[] = is_array($group) ? Group::find($group['unique_id'], $group) : $group;
		}
	}

	/**
	 * Load groups if not loaded
	 */
	public function loadGroups($force_full_structure = false)
	{
		if (is_null($this->groups) || ($force_full_structure && isset($this->groups[0]) && !($this->groups[0] instanceof Group)))
		{
			$response = Request::get(Helper::uri('user/'.$this->unique_id) . "?grouplevel=2")->send();

			$this->groups = null;
			if (isset($response->body['result']['groups']))
			{
				$this->setGroups($response->body['result']['groups']);
			}
		}
	}

	/**
	 * Store changes to server, including new users
	 */
	public function store()
	{
		// don't have username?
		if (!isset($this->username))
		{
			throw new Exception("Can't store user without username.");
		}

		// new user?
		if ($this->is_new)
		{
			$this->attributes_updated = array();
			if (static::find($this->username))
			{
				throw new Exception("User already exists.");
			}

			// TODO: create user
		}

		if ($this->attributes_updated)
		{
			$new = array();
			foreach ($this->attributes_updated as $field)
			{
				if (!isset($new[$field]))
				{
					$new[$field] = $this->attributes[$field];
				}
			}

			// TODO: update user
			// fields changed are in $new
			$this->attributes_updated = array();
		}
	}

	/**
	 * Get the e-mail address where password reminders are sent.
	 *
	 * @return string
	 */	
	public function getReminderEmail()
	{
		return $this->email;
	}

	/**
	 * Dynamically access the user's attributes.
	 *
	 * @param  string  $key
	 * @return mixed
	 */
	public function __get($key)
	{
		return $this->attributes[$key];
	}

	/**
	 * Dynamically set an attribute on the user.
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
	 * Dynamically check if a value is set on the user.
	 *
	 * @param  string  $key
	 * @return bool
	 */
	public function __isset($key)
	{
		return isset($this->attributes[$key]);
	}

	/**
	 * Dynamically unset a value on the user.
	 *
	 * @param  string  $key
	 * @return bool
	 */
	public function __unset($key)
	{
		unset($this->attributes[$key]);
	}

	/**
	 * Convert to array
	 *
	 * @param array Fields to ignore
	 * @param int Expand group? (0=no, 1=only names, 2=structure without members, 3=structure with members)
	 * @return array
	 */
	public function toArray(array $except = array(), $expand_groups = 1)
	{
		$d = $this->attributes;
		foreach ($except as $e)
			unset($d[$e]);

		// groups?
		if (!is_null($this->groups) && $expand_groups > 0)
		{
			$groups = array();
			foreach ($this->groups as $group)
			{
				if ($group instanceof Group)
				{
					$except = $expand_groups < 3 ? array("members") : array();
					$groups[] = $expand_groups != 1 ? $group->toArray($except, 1) : $group->name;
				}
				else
				{
					$groups[] = $group;
				}
			}

			return array_merge($d, array("groups" => $groups));
		}

		return $d;
	}

	/**
	 * Check for same user
	 *
	 * @param User
	 * @return bool
	 */
	public function isSame(User $user)
	{
		return $this->username == $user->username;
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

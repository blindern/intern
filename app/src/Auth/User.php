<?php namespace Blindern\Intern\Auth;

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class User implements UserInterface, RemindableInterface {
	const REMEMBER_TOKEN = 'remember_token';

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
				$response = Helper::get('user/'.$username);

				if (isset($response->body['result']))
				{
					$data = $response->body['result'];
				}
			}

			if (!$data)
			{
				return null;
			}

			$user = new User($data);
			static::$cache[$user->unique_id] = $user;
		}

		return static::$cache[$username];
	}

	/**
	 * Find a specific user by email address
	 *
	 * The email lookup is not cached
	 *
	 * @param string $email
	 * @return \Blindern\Intern\Auth\User|null
	 */
	public static function findByEmail($email)
	{
		$response = Helper::get('users?emails='.urlencode($email));

		// there might be multiple users returned, we only use the first one returned
		if (isset($response->body['result']) && count($response->body['result']) > 0)
		{
			$data = $response->body['result'][0];

			return static::find($data['username'], $data);
		}
	}

	/**
	 * Find all users
	 */
	public static function all()
	{
		$response = Helper::get('users?grouplevel=1');

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
	 * List of group relations
	 *
	 * @var array
	 */
	protected $group_relations;

	/**
	 * List of ownership relations
	 *
	 * @var array
	 */
	protected $groupowner_relations;

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

		if (isset($attributes['groups_relation']))
		{
			$this->group_relations = $attributes['groups_relation'];
			unset($attributes['groups_relation']);

			if (is_null($this->groups))
			{
				$this->groups = array_keys($this->group_relations);
			}
		}

		if (isset($attributes['groupsowner_relation']))
		{
			$this->groupowner_relations = $attributes['groupsowner_relation'];
			unset($attributes['groupsowner_relation']);
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
	 * Get the token value for the "remember me" session.
	 *
	 * @return string
	 */
	public function getRememberToken()
	{
		$u = $this->getLocalUser();
		if (isset($u->remember_token))
			return $u->remember_token;
	}

	/**
	 * Set the token value for the "remember me" session.
	 *
	 * @param  string  $value
	 * @return void
	 */
	public function setRememberToken($value)
	{
		$u = $this->getLocalUser();
		$u->remember_token = $value;
		$u->save();
	}

	/**
	 * Get the column name for the "remember me" token.
	 *
	 * @return string
	 */
	public function getRememberTokenName()
	{
		return static::REMEMBER_TOKEN;
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
		/*foreach ($this->groups_relation as $name => $bygroup)
		{
			if ($name == $group || $name == $allow_superadmin)
			{
				return true;
			}
		}*/

		return false;
	}

	/**
	 * Get list of groupnames
	 *
	 * @return array of groupnames
	 */
	public function groups($refresh = false)
	{
		if ($refresh || (is_null($this->groups) && is_null($this->groups_relation)))
		{
			$this->loadGroups();
		}

		if (!is_null($this->groups))
		{
			$list = array();
			foreach ($this->groups as $group)
			{
				if (is_string($group)) $list[] = $group;
				else $list[] = $group->name;
			}
			return $list;
		}

		if (!is_null($this->groups_relation))
		{
			return array_keys($this->groups_relation);
		}
		
		return array();
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
			$response = Helper::get('user/'.$this->unique_id."?grouplevel=2");

			$this->groups = null;
			if (isset($response->body['result']['groups']))
			{
				$this->setGroups($response->body['result']['groups']);
			}

			$this->group_relations = $response->body['result']['groups_relation'];
			$this->groupowner_relations = $response->body['result']['groupsowner_relation'];
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
	 * Get object for local user storage
	 */
	public function getLocalUser()
	{
		static $user = null;
		if (is_null($user))
		{
			try {
				$user = LocalUser::where('username', $this->attributes['username'])->firstOrFail();
			} catch (ModelNotFoundException $e) {
				$user = new LocalUser;
				$user->username = $this->attributes['username'];
				$user->save();
			}
		}
		return $user;
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
			$d = array_merge($d, array("groups" => $groups));
		}

		if ($expand_groups > 0)
		{
			$d = array_merge($d, array("group_relations" => $this->group_relations));
			$d = array_merge($d, array("groupowner_relations" => $this->groupowner_relations));
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

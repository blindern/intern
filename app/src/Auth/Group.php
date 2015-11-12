<?php namespace Blindern\Intern\Auth;

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;

class Group
{
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
        if (!isset(static::$cache[$groupname])) {
            if (!$data) {
                $response = Helper::get('group/'.$groupname);

                if (isset($response->body['result'])) {
                    $data = $response->body['result'];
                }
            }

            if ($data) {
                $group = new Group($data);
                static::$cache[$group->unique_id] = $group;
            }
        } else {
            if (isset($data['members'])) {
                static::$cache[$groupname]->members = $data['members'];
            }
        }

        return !isset(static::$cache[$groupname]) ? null : static::$cache[$groupname];
    }

    /**
     * Find all groups
     */
    public static function all()
    {
        $response = Helper::get('groups');

        $groups = array();
        if (isset($response->body['result'])) {
            foreach ($response->body['result'] as $group) {
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

    /*
     * owners => list of owners grouped by users and subgroups
     * members => list of members grouped by users and subgroups
     * members_relation => expanded list of members with source group in subarray
     * members_data => user-model collection
     */

    /**
     * Members of the group
     *
     * @var array(x => array(y1, y2)) as in user x is in the array because of y1 and y2
     */
    protected $members_relation;

    /**
     * Member objects
     */
    protected $members_objs;

    /**
     * Members, subgrouped in 'users' and 'groups'
     */
    protected $members;

    /**
     * Owners, subgrouped in 'users' and 'groups'
     */
    protected $owners;

    /**
     * Constructor
     *
     * @param  array  $attributes
     * @return void
     */
    public function __construct(array $attributes)
    {
        if (isset($attributes['members'])) {
            $this->members = $attributes['members'];
            unset($attributes['members']);
        }

        if (isset($attributes['members_data'])) {
            $this->setMembers($attributes['members_data']);
            unset($attributes['members_data']);
        }

        if (isset($attributes['members_relation'])) {
            $this->members_relation = $attributes['members_relation'];
            unset($attributes['members_relation']);
        }

        if (isset($attributes['owners'])) {
            $this->owners = $attributes['owners'];
            unset($attributes['owners']);
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
        $this->members_objs = array();
        if (!isset($list)) {
            return;
        }
        foreach ($list as $user) {
            $this->members_objs[] = is_array($user) ? User::find($user['unique_id'], $user) : $user;
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
        if (!empty($this->members) && !($this->members[0] instanceof User)) {
            $response = Helper::get('group/'.$this->unique_id);
            if (isset($response->body['result']['members'])) {
                $this->setMembers($response->body['result']['members']);
            }
        }
    }

    /**
     * Get list of members
     *
     * @return array for user names
     */
    public function getMembers()
    {
        if (!is_null($this->members_relation)) {
            return array_keys($this->members_relation);
        }

        if ($this->members_objs == null) {
            // load members
            $response = Helper::get('group/'.$this->unique_id);
            if (isset($response->body['result']['members'])) {
                $this->__construct($response->body['result']);
            }
        }

        if ($this->members_objs != null) {
            $list = array();
            foreach ($this->members_objs as $user) {
                $list[] = $user instanceof User ? $user->username : $user;
            }

            return $list;
        }
    }

    /**
     * Get objects of members
     *
     * @return array of user objects, if it is loaded, else null
     */
    public function getMemberObjs()
    {
        if (!empty($this->members_objs) && ($this->members_objs[0] instanceof User)) {
            return $this->members_objs;
        }
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
        foreach ($except as $e) {
            unset($d[$e]);
        }

        // members?
        if (!is_null($this->members_objs) && $expand_members > 0) {
            $members = array();
            foreach ($this->members_objs as $user) {
                if ($user instanceof User) {
                    $except = $expand_members < 3 ? array("") : array();
                    $except = array_merge($except, $except_members);
                    $members[] = $expand_members != 1 ? $user->toArray($except) : $user->username;
                } else {
                    $members[] = $user;
                }
            }

            $d = array_merge($d, array("members" => $members));
        }

        if ($expand_members > 0) {
            $d = array_merge($d, array("owners" => $this->owners));
            $d = array_merge($d, array("members_real" => $this->members));
            $d = array_merge($d, array("members_relation" => $this->members_relation));
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

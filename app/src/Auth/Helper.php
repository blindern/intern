<?php namespace Blindern\Intern\Auth;

class Helper {
	public static function uri($path)
	{
		return rtrim(app()->config['auth']['blindern-auth']['api'], "/") . "/" . $path;
	}
}
<?php namespace Blindern\Intern\Auth;

use Httpful\Request;

class Helper {
	/**
	 * Convert a API-call to the correct URI
	 *
	 * @param string $path
	 * @return string
	 */
	public static function uri($path)
	{
		return rtrim(app()->config['auth']['blindern-auth']['api'], "/") . "/" . $path;
	}

	/**
	 * Create a GET-request to the API, sign with HMAC
	 *
	 * @param string $path
	 * @param bool $send
	 * @return \Httpful\Request
	 */
	public static function get($path, $send = true)
	{
		$req = Request::get(Helper::uri($path));
		$hmac = new HMAC();
		$hmac->prepareRequest($req);

		if ($send)
			return $req->send();

		return $req;
	}

	/**
	 * Create a POST-request to the API, sign with HMAC
	 *
	 * @param string $path
	 * @param mixed $payload
	 * @param bool $send
	 * @return \Httpful\Request
	 */
	public static function post($path, $payload, $send = true)
	{
		$req = Request::post(Helper::uri($path), $payload)->contentType('form');
		$hmac = new HMAC();
		$hmac->prepareRequest($req);

		if ($send)
			return $req->send();

		return $req;
	}

	/**
	 * Check if this IP belongs to the administration office
	 */
	public static function isOffice()
	{
		if (!isset($_SERVER['REMOTE_ADDR']))
			return null;

		$network = "158.36.185.160/28";
		return self::cidrMatch($_SERVER['REMOTE_ADDR'], $network);
	}

	/**
	 * Check IP against CIDR
	 * @see http://stackoverflow.com/questions/594112/matching-an-ip-to-a-cidr-mask-in-php5
	 */
	public static function cidrMatch($ip, $range)
	{
		list ($subnet, $bits) = explode('/', $range);
		$ip = ip2long($ip);
		$subnet = ip2long($subnet);
		$mask = -1 << (32 - $bits);
		$subnet &= $mask; # nb: in case the supplied subnet wasn't correctly aligned
		return ($ip & $mask) == $subnet;
	}
}
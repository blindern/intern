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
}
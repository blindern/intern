<?php namespace Blindern\Intern\Auth;

/**
 * Allow for HMAC-signed requests to the API
 */
class HMAC
{
    /**
     * Overload parent function so we add HMAC-headers
     */
    public function prepareRequest(\Httpful\Request $req)
    {
        $time = time();
        $req->addHeader('X-API-Time', $time);

        $url = \parse_url($req->uri);
        $path = (isset($url['path']) ? $url['path'] : '/').(isset($url['query']) ? '?'.$url['query'] : '');

        $hash = $this->generateHMACHash($time, $req->method, $path, $req->payload);
        $req->addHeader('X-API-Hash', $hash);
    }

    /**
     * Generate a HMAC-hash
     */
    protected function generateHMACHash($time, $method, $uri, $post_variables)
    {
        $data = json_encode(array((string)$time, $method, $uri, (array)$post_variables));
        return hash_hmac('sha256', $data, $this->getPrivateKey());
    }

    /**
     * Get private key
     */
    protected function getPrivateKey()
    {
        return \Config::get('auth.blindern-auth.api-key');
    }
}

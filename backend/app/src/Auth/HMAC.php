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
     *
     * @param string|int $time
     * @param string $method
     * @param string $uri
     * @param string|array $post_variables String for JSON body, array for form data
     */
    public function generateHMACHash($time, $method, $uri, $post_variables)
    {
        if (is_string($post_variables)) {
            // JSON body: include as-is (already a JSON string)
            $payload = $post_variables;
        } else {
            $payload = (array)$post_variables;
        }
        $data = json_encode(array((string)$time, $method, $uri, $payload));
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

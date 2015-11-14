<?php namespace Blindern\Intern\Helpers;

use \Response;

/**
 * Collection for Flash
 */
class FlashCollection implements \Illuminate\Contracts\Support\Arrayable
{
    protected $container;

    /**
     * Create the container with an optional list of Flash-objects
     *
     * @param optional Flash
     * @param ...
     * @return FlashContainer
     */
    public static function forge()
    {
        $c = new static();
        foreach (func_get_args() as $flash) {
            $c->add($flash);
        }
        return $c;
    }

    /**
     * Add a flash
     *
     * @param Flash
     * @return this
     */
    public function add(Flash $flash)
    {
        $this->container[] = $flash;
        return $this;
    }

    /**
     * Convert into a header array, can be merged with other headers
     *
     * @return array
     */
    public function toHeader()
    {
        return array('X-Flashes' => json_encode($this->toArray()['flashes']));
    }

    /**
     * Convert to Response-object (json)
     *
     * This is a shortcut for easier response object for flashes
     *
     * @param array $data
     * @param int HTTP status code
     * @return Response
     */
    public function asResponse($data = null, $statusCode = 200)
    {
        return Response::json($data, $statusCode, $this->toHeader());
    }

    /**
     * Get array representation
     *
     * @return array
     */
    public function toArray()
    {
        $arr = array();
        foreach ($this->container as $flash) {
            $arr[] = $flash->toArray();
        }
        return array('flashes' => $arr);
    }
}

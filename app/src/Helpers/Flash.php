<?php namespace Blindern\Intern\Helpers;

/**
 * Simple flash (status) boxes to be used in HTML-template
 */
class Flash implements \Illuminate\Support\Contracts\ArrayableInterface {
	/**
	 * Create object
	 */
	public static function forge($message, $type = null)
	{
		return new static($message, $type);
	}

	/**
	 * The message
	 * @var string
	 */
	protected $message;

	/**
	 * The type
	 * @var string
	 */
	protected $type;

	/**
	 * @param string The message
	 * @param optional string Type
	 */
	public function __construct($message, $type = null)
	{
		$this->message = $message;
		if ($type) $this->type = $type;
	}

	/**
	 * Set as error type
	 * @return this
	 */
	public function setError()
	{
		$this->type = 'danger';
		return $this;
	}

	/**
	 * Set as success type
	 * @return this
	 */
	public function setSuccess()
	{
		$this->type = 'success';
		return $this;
	}

	/**
	 * Convert into a FlashCollection
	 *
	 * @return FlashCollection
	 */
	public function toCollection()
	{
		return FlashCollection::forge($this);
	}

	/**
	 * Convert into a header array, can be merged with other headers
	 *
	 * @return array
	 */
	public function toHeader()
	{
		$c = FlashCollection::forge($this);
		return $c->toHeader();
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
		return $this->toCollection()->asResponse($data, $statusCode);
	}

	/**
	 * Get array representation
	 */
	public function toArray()
	{
		$ret = array('message' => $this->message);
		if ($this->type) $ret['type'] = $this->type;
		return $ret;
	}
}
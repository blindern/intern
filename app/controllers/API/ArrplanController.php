<?php namespace API;

use \HappeningNew;
use \Eluceo\iCal\Component\Calendar;
use \Eluceo\iCal\Component\Event;
use \Eluceo\iCal\Property\Event\RecurrenceRule;

class ArrplanController extends \Controller {
	public function index()
	{
		$res = HappeningNew::getHappenings(isset($_GET['invalidate']));

		$data = array();
		foreach ($res as $row)
		{
			$data[] = $row->toArray();
		}

		return $data;
	}
}
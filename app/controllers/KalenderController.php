<?php

use \Eluceo\iCal\Component\Calendar;
use \Eluceo\iCal\Component\Event;
use \Eluceo\iCal\Property\Event\RecurrenceRule;

class KalenderController extends BaseController {
	/**
	 * Handle the main calendar-view
	 */
	public function action_index() {
		$happenings = Happening::orderBy('start')->whereNull('frequency')->get();
		
		$result = Happening::orderByRaw('WEEKDAY(start), TIME(start)')->whereNotNull('frequency')->get();
		$recurring = array();
		foreach ($result as $row)
		{
			$recurring[] = $row;
		}
		
		return View::make("kalender/index", array(
			"happenings" => $happenings,
			"recurring"  => $recurring
		));
	}

	/**
	 * Handle and render the iCal-version
	 */
	public function action_ics() {
		$happenings = Happening::all();

		$cal = new Calendar("blindern-studenterhjem.no");
		$cal->setName("Blindern Studenterhjem");

		foreach ($happenings as $happening)
		{
			$cal->addEvent($happening->getEvent());
		}

		$response = Response::make($cal->render(), 200, array(
			#'Content-Type' => 'text/calendar; charset=utf-8',
			#'Content-Disposition' => 'attachment; filename="cal.ics"'
		));

		return $response;
	}
}
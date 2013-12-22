<?php

use \Eluceo\iCal\Component\Calendar;
use \Eluceo\iCal\Component\Event;

class KalenderController extends BaseController {
	public function action_index() {
		return View::make("kalender/index");
	}

	public function action_ical() {
		$happenings = Happening::all();

		$cal = new Calendar("blindern-studenterhjem.no");
		$cal->setName("Blindern Studenterhjem");

		foreach ($happenings as $happening)
		{
			$x = new Event();
			$x->setDtStart(new \DateTime($happening->start));
			$x->setDtEnd(new \DateTime($happening->end));
			$x->setNoTime((bool)$happening->allday);
			$x->setSummary(strip_tags($happening->title));
			$x->setDescription(strip_tags($happening->info));
			$x->setLocation($happening->place);
			$cal->addEvent($x);
		}

		$response = Response::make($cal->render(), 200, array(
			#'Content-Type' => 'text/calendar; charset=utf-8',
			#'Content-Disposition' => 'attachment; filename="cal.ics"'
		));

		return $response;
	}
}
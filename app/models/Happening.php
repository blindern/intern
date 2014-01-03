<?php

use Carbon\Carbon;
use \Eluceo\iCal\Component\Calendar;
use \Eluceo\iCal\Component\Event;
use \Eluceo\iCal\Property\Event\RecurrenceRule;

class Happening extends Eloquent {
	protected $table = 'happenings';

	/**
	 * Get prettyformatted duration
	 *
	 * @return string
	 */
	public function getDuration()
	{
		$start = Carbon::parse($this->start);
		$end = Carbon::parse($this->end);

		if ($start->toDateString() == $end->toDateString())
		{
			return Carbon::parse($this->start)->formatLocalized('%e. %B');
		}

		elseif ($start->format("m") == $end->format("m"))
		{
			return sprintf("%s-%s", $start->formatLocalized('%e.'), $end->formatLocalized('%e. %B'));
		}

		return sprintf("%s - %s", $start->formatLocalized('%e. %b'), $end->formatLocalized('%e. %b'));
	}

	/**
	 * Get prettyformatted duration for recurring event
	 *
	 * @return string
	 */
	public function getDurationRecurring()
	{
		$start = Carbon::parse($this->start);

		return ucfirst(Carbon::parse($this->start)->formatLocalized('%Aer kl %H.%M'));
	}

	/**
	 * Return the end date/time to be used in ical format
	 *
	 * @return \DateTime
	 */
	public function getCalEnd()
	{
		$end = new \DateTime($this->end);
		
		// in the database this field is inclusive
		// for ical it is exclusive, so we need to add one day
		// only needed if it is an all day-event, else it will have correct end time
		if ($this->allday)
		{
			$end->modify("+1 day");
		}

		return $end;
	}

	/**
	 * Get a event object representing this happening
	 *
	 * @return \Eluceo\iCal\Component\Event
	 */
	public function getEvent()
	{
		$desc = '';
		if ($this->by)
		{
			$desc = sprintf("[%s]", strip_tags($this->by));
		}
		if ($this->info)
		{
			if ($this->by) $desc .= "\n";
			$desc .= strip_tags(nl2br($this->info));
		}

		$x = new Event();
		$x->setUseTimezone(true);
		$x->setDtStart(new \DateTime($this->start));
		$x->setDtEnd($this->getCalEnd());
		$x->setNoTime((bool)$this->allday);
		$x->setSummary(strip_tags($this->title));
		$x->setDescription($desc);
		$x->setLocation($this->place);

		if ($this->frequency)
		{
			$r = new RecurrenceRule();
			$r->setFreq($this->frequency);
			$r->setInterval($this->interval);
			$r->setCount($this->count);
			$x->setRecurrenceRule($r);
		}

		return $x;
	}
}
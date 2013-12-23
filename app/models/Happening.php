<?php

use Carbon\Carbon;

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
}
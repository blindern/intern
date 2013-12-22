<?php

use Carbon\Carbon;

class Happening extends Eloquent {
	protected $table = 'happenings';

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
}
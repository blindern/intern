<?php

use Carbon\Carbon;
use \Eluceo\iCal\Component\Calendar;
use \Eluceo\iCal\Component\Event;
use \Eluceo\iCal\Property\Event\RecurrenceRule;

/*
 * TODO: Support skips on repeats (split into multiple events)
 */

class HappeningNew {
	public static function getHappenings()
	{
		$url = "https://foreningenbs.no/w/api.php?format=json&action=query&titles=Arrangementplan_til_nettsiden&prop=revisions&rvprop=content";
		$data = file_get_contents($url);
		
		$data = json_decode($data, true);
		if ($data === false || !isset($data['query']['pages']))
		{
			return array();
		}

		$data = $data['query']['pages'];
		$data = current($data);
		$data = $data['revisions'][0]['*'];
		if (preg_match_all("~<pre>(.+?)</pre>~ms", $data, $matches))
		{
			// see wiki-page for syntax info
			$lines = preg_split("/\\r?\\n/", implode("\n", $matches[1]));

			$res = array();
			$res_times = array();
			$cur = null;
			$blanks = 0;
			$get_title = false;
			$is_info = false;
			foreach ($lines as $row)
			{
				// skip empty and comments
				if (empty($row) || substr($row, 0, 1) == "#" || substr($row, 2, 1) == "#")
				{
					if (empty($row)) $blanks++;
					continue;
				}

				// new?
				if (substr($row, 0, 2) != "  ")
				{
					$cur = null;
					$is_info = false;

					// match date
					if (preg_match("~^(\\d{4}-\\d\\d-\\d\\d)( \\d\\d:\\d\\d)?(->(\\d{4}-\\d\\d-\\d\\d)? ?(\\d\\d:\\d\\d)?)?$~", $row, $matches))
					{
						// 1 => from date
						// 2 => from time
						// 4 =>   to date
						// 5 =>   to time

						$from = $matches[1] . (!empty($matches[2]) ? $matches[2] : '');
						$to = $from;
						if (isset($matches[4]))
						{
							$to = empty($matches[4]) ? $matches[1] : $matches[4];
							$to .= (isset($matches[5]) ? ' ' . $matches[5] : '');
						}

						$cur = new static();
						$cur->start = $from;
						$cur->end   = $to;
						$cur->allday     = empty($matches[2]) || empty($matches[5]);

						$get_title = true;
					}
				}

				else
				{
					if ($get_title)
					{
						// must be title
						$cur->title = trim($row);
						$res[] = $cur;
						$res_times[] = $cur->start . $cur->end;
						$get_title = false;
					}

					else
					{
						if (substr($row, 2, 3) == "BY:")
						{
							$cur->by = trim(substr($row, 5));
							$is_info = false;
						}

						elseif (substr($row, 2, 6) == "PLACE:")
						{
							$cur->place = trim(substr($row, 8));
							$is_info = false;
						}

						elseif (substr($row, 2, 5) == "INFO:")
						{
							$cur->info = trim(substr($row, 7));
							$blanks = 0;
							$is_info = true;
						}

						elseif (substr($row, 2, 7) == "REPEAT:")
						{
							$cur->setRepeat(trim(substr($row, 9)));
							$is_info = false;
						}

						// additional information (on new line)
						elseif (substr($row, 2, 2) == "  " && $is_info)
						{
							while ($blanks-- > -1)
							{
								$cur->info .= "\n";
							}
							$cur->info .= trim($row);
							$blanks = 0;
						}
					}
				}
			}

			// sort it
			array_multisort($res_times, $res);

			return $res;
		}
	}

	public $title;
	public $by;
	public $place;
	public $start;
	public $end;
	public $info;
	public $allday;

	public $frequency;
	public $interval;
	public $count;

	public function setRepeat($text)
	{
		// syntax: <repeat type>:<number of repeats>:<interval>:<numbers to skip>
		if (preg_match("~^(DAILY|WEEKLY|MONTHLY):(\\d+)(:(\\d+)(:(\\d+(,\\d+)*))?)?$~m", $text, $matches))
		{
			$this->frequency = $matches[1];
			$this->count = $matches[2];
			$this->interval = isset($matches[3]) ? $matches[3] : 1;

			// TODO: $matches[5];
		}
	}

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
			return Carbon::parse($this->start)->formatLocalized('%A %e. %B');
		}

		elseif ($start->format("m") == $end->format("m"))
		{
			return sprintf("%s-%s", $start->formatLocalized('%a %e.'), $end->formatLocalized('%a %e. %B'));
		}

		return sprintf("%s - %s", $start->formatLocalized('%a %e. %b'), $end->formatLocalized('%a %e. %b'));
	}

	/**
	 * Get prettyformatted duration for recurring event
	 *
	 * @return string
	 */
	public function getDurationRecurring()
	{
		$start = Carbon::parse($this->start);
		return ucfirst($start->formatLocalized('%Aer kl %H.%M'));
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

	/**
	 * Check if event is recurring
	 */
	public function isRecurring()
	{
		return !!$this->frequency;
	}

	/**
	 * Check if ended
	 */
	public function expired()
	{
		$end = new \DateTime($this->end);
		return $end->format("U") < time();
	}
}
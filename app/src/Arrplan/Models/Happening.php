<?php namespace Blindern\Intern\Arrplan\Models;

use Carbon\Carbon;
use Eluceo\iCal\Component\Calendar;
use Eluceo\iCal\Component\Event;
use Eluceo\iCal\Property\Event\RecurrenceRule;
use Illuminate\Contracts\Support\Arrayable;

/*
 * TODO: Support skips on repeats (split into multiple events)
 */

class Happening implements Arrayable, \JsonSerializable
{
    const CACHE_NAME = "happenings";

    public static function getHappenings($invalidate_cache = null)
    {
        $data = $invalidate_cache ? null : \Cache::get(static::CACHE_NAME);
        if (is_null($data)) {
            $data = static::getHappeningsFromWiki();
            \Cache::put(static::CACHE_NAME, $data, 180);
        }

        return $data;
    }

    /**
     * Get the next events, by its end date
     * Date of today counts as next event
     * Recurring events does not count
     */
    public static function getNext($num = 5)
    {
        $res = array();
        foreach (static::getHappenings() as $ev) {
            if ($ev->isRecurring()) {
                continue;
            }
            if ($ev->isComment()) {
                continue;
            }
            if ($ev->expired()) {
                continue;
            }
            $res[] = $ev;
            if (count($res) >= $num) {
                break;
            }
        }
        return $res;
    }

    private static function getHappeningsFromWiki()
    {
        $url = "https://foreningenbs.no/w/api.php?format=json&action=query&titles=Arrangementplan_til_nettsiden&prop=revisions&rvprop=content";
        $data = file_get_contents($url);

        $data = json_decode($data, true);
        if ($data === false || !isset($data['query']['pages'])) {
            return array();
        }

        $data = $data['query']['pages'];
        $data = current($data);
        $data = $data['revisions'][0]['*'];
        if (preg_match_all("~<pre>(.+?)</pre>~ms", $data, $matches)) {
            // see wiki-page for syntax info
            $lines = preg_split("/\\r?\\n/", implode("\n", $matches[1]));

            $res = array();
            $res_times = array();
            $cur = null;
            $blanks = 0;
            $get_title = false;
            $is_info = false;
            foreach ($lines as $row) {
                // skip empty and comments
                if (empty($row) || substr($row, 0, 1) == "#" || substr($row, 2, 1) == "#") {
                    if (empty($row)) {
                        $blanks++;
                    }
                    continue;
                }

                // new?
                if (substr($row, 0, 2) != "  ") {
                    $cur = null;
                    $is_info = false;

                    // match date
                    if (preg_match("~^(\\d{4}-\\d\\d-\\d\\d)( \\d\\d:\\d\\d)?(->(\\d{4}-\\d\\d-\\d\\d)? ?(\\d\\d:\\d\\d)?)? ?(.*)$~", $row, $matches)) {
                        // 1 => from date
                        // 2 => from time
                        // 4 =>   to date
                        // 5 =>   to time
                        // 6 => title with options

                        $from = $matches[1] . (!empty($matches[2]) ? $matches[2] : '');
                        $to = $from;
                        if (isset($matches[4])) {
                            $to = empty($matches[4]) ? $matches[1] : $matches[4];
                            $to .= (isset($matches[5]) ? ' ' . $matches[5] : '');
                        }

                        $cur = new static();
                        $cur->start = trim($from);
                        $cur->end   = trim($to);
                        $cur->allday     = empty($matches[2]) || empty($matches[5]);

                        // title can be specified at the date/time-line, or it's own line
                        if ($matches[6]) {
                            preg_match("~^(.+?)(\\s+\\((.+?)\\))?(\\s+(LOW|MEDIUM|HIGH))?$~", $matches[6], $submatches);

                            $cur->title = trim($submatches[1]);
                            $res[] = $cur;
                            $res_times[] = $cur->start . $cur->end;
                            $get_title = false;

                            if (!empty($submatches[3])) {
                                $cur->by = trim($submatches[3]);
                            }

                            if (!empty($submatches[5])) {
                                $pri = trim($submatches[5]);
                                switch ($pri) {
                                case "LOW":
                                    $cur->priority = "low";
                                    break;
                                case "HIGH":
                                    $cur->priority = "high";
                                    break;
                                default:
                                    $cur->priority = "medium";
                                }
                            }
                        } else {
                            $get_title = true;
                        }
                    }

                    // comment?
                    // comments are special and only contains date and comments!
                    elseif (preg_match("~^COMMENT (\\d{4}-\\d\\d-\\d\\d)$~", $row, $matches)) {
                        $from = $matches[1];
                        $to = $from;

                        $cur = new static();
                        $cur->isComment = true;
                        $cur->start = trim($from);
                        $cur->end   = trim($to);

                        $res[] = $cur;
                        $res_times[] = $cur->start . $cur->end;
                        $blanks = 0;
                    }
                } elseif ($cur->isComment()) {
                    while ($blanks > 0) {
                        $cur->comment .= "\n";
                        $blanks--;
                    }
                    $cur->comment .= trim(substr($row, 2));
                    $blanks = 0;
                } else {
                    if ($get_title) {
                        // must be title
                        $cur->title = trim($row);
                        $res[] = $cur;
                        $res_times[] = $cur->start . $cur->end;
                        $get_title = false;
                    } else {
                        if (substr($row, 2, 3) == "BY:") {
                            $cur->by = trim(substr($row, 5));
                            $is_info = false;
                        } elseif (substr($row, 2, 6) == "PLACE:") {
                            $cur->place = trim(substr($row, 8));
                            $is_info = false;
                        } elseif (substr($row, 2, 4) == "PRI:") {
                            $pri = trim(substr($row, 6));
                            switch ($pri) {
                            case "LOW":
                                $cur->priority = "low";
                                break;
                            case "HIGH":
                                $cur->priority = "high";
                                break;
                            default:
                                $cur->priority = "medium";
                            }
                            $is_info = false;
                        } elseif (substr($row, 2, 5) == "INFO:") {
                            $cur->info = trim(substr($row, 7));
                            $blanks = 0;
                            $is_info = true;
                        } elseif (substr($row, 2, 7) == "REPEAT:") {
                            $cur->setRepeat(trim(substr($row, 9)));
                            $is_info = false;
                        }

                        // additional information (on new line)
                        elseif (substr($row, 2, 2) == "  " && $is_info) {
                            while ($blanks > 0) {
                                $cur->info .= "\n";
                                $blanks--;
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

    public $isComment;
    public $comment;

    public $title;
    public $by;
    public $place;
    public $priority = "medium";
    public $start;
    public $end;
    public $info;
    public $allday;

    public $frequency;
    public $interval;
    public $count;

    public function setRepeat($text)
    {
        // syntax: <repeat type>:<number of repeats>[:<interval>[:<list of numbers to skip>]]
        if (preg_match("~^(DAILY|WEEKLY|MONTHLY):((\\d{4}-\\d\\d-\\d\\d)|(\\d+))(:(\\d+)(:(\\d+(,\\d+)*))?)?$~m", $text, $matches)) {
            $this->frequency = $matches[1];

            if (!empty($matches[4])) {
                $this->count = $matches[4];
            } else {
                $this->setCountFromUntil($matches[2]);
            }

            $this->interval = isset($matches[6]) ? (int) $matches[6] : 1;

            // TODO: $matches[8]; (the ones to skip)
        }
    }

    private function setCountFromUntil($until_date) {
        $start = Carbon::parse($this->start);
        $start->setTime(0, 0, 0);

        $until = Carbon::parse($until_date);
        $until->addDay();

        switch ($this->frequency) {
        case 'DAILY':
            $this->count = $start->diffInDays($until) + 1;
            break;
        case 'WEEKLY':
            $this->count = $start->diffInWeeks($until) + 1;
            break;
        case 'MONTHLY':
            $this->count = $start->diffInMonths($until) + 1;
            break;
        default:
            throw new \Exception("Unknown happening frequency", $this->frequency);
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

        if ($start->toDateString() == $end->toDateString()) {
            return Carbon::parse($this->start)->formatLocalized('%A %e. %B');
        } elseif ($start->format("m") == $end->format("m")) {
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

        if ($this->start == $this->end) {
            return ucfirst($start->formatLocalized('%Aer'));
        } else {
            return ucfirst($start->formatLocalized('%Aer kl %H.%M'));
        }
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
        if ($this->allday) {
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
        if ($this->by) {
            $desc = sprintf("[%s]", strip_tags($this->by));
        }
        if ($this->info) {
            if ($this->by) {
                $desc .= "\n";
            }
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

        if ($this->frequency) {
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
     * Check if event is simply a comment
     */
    public function isComment()
    {
        return $this->isComment;
    }

    /**
     * Check if ended
     */
    public function expired()
    {
        $end = new \DateTime($this->end);
        $now = new \DateTime();
        $now->setTime(0, 0, 0);
        return $end->format("U") < $now->format("U");
    }

    /**
     * Get array representation (for API)
     */
    public function toArray()
    {
        if ($this->isComment()) {
            return array(
                "type" => "comment",
                "date" => (new \DateTime($this->start))->format("Y-m-d"),
                "comment" => $this->comment
            );
        }

        $d = array(
            "type" => ($this->isRecurring() ? "event_recurring" : "event"),
            "title" => $this->title,
            "by" => $this->by,
            "place" => $this->place,
            "priority" => $this->priority,
            "start" => $this->start,
            "end" => $this->end,
            "info" => $this->info,
            "allday" => $this->allday
        );

        if ($this->isRecurring()) {
            $d["frequency"] = $this->frequency;
            $d["interval"] = $this->interval;
            $d["count"] = $this->count;
        }

        // this should really be done in the view, but we simplify..
        $d['expired'] = $this->expired();
        $d['duration'] = ($this->isRecurring() ? $this->getDurationRecurring() : $this->getDuration());

        return $d;
    }

    public function jsonSerialize()
    {
        return $this->toArray();
    }
}

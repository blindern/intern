<?php namespace Blindern\Intern\Arrplan\Models;

use Carbon\Carbon;
use Illuminate\Contracts\Support\Arrayable;
use Spatie\IcalendarGenerator\Components\Event;
use Spatie\IcalendarGenerator\Enums\RecurrenceFrequency;
use Spatie\IcalendarGenerator\ValueObjects\RRule;

class Happening implements Arrayable, \JsonSerializable
{
    const CACHE_NAME = "happenings";

    public static function getHappenings($invalidate_cache = null)
    {
        $data = $invalidate_cache ? null : \Cache::get(static::CACHE_NAME);
        if (is_null($data)) {
            $data = static::loadHappenings();
            \Cache::put(static::CACHE_NAME, $data, 180);
        }

        return $data;
    }

    private static function loadHappenings()
    {
        $events = array_merge(
            HappeningMediaWiki::loadExternalEvents(),
            HappeningConfluence::loadExternalEvents()
        );

        $event_times = array();
        foreach ($events as $event) {
            $event_times[] = $event->start . $event->end;
        }

        array_multisort($event_times, $events);
        return $events;
    }

    /**
     * Get the next events, by its end date
     * Date of today counts as next event
     */
    public static function getNext($num = 5)
    {
        $res = array();

        foreach (static::getHappenings() as $ev) {
            /*if ($ev->isRecurring()) {
                continue;
            }*/
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

    public $isDuplicateRecurringEvent; // if this is a duplicate event of a recurring event

    /**
     * Get prettyformatted duration
     *
     * @return string
     */
    public function getDuration()
    {
        $start = Carbon::parse($this->start)->locale('nb_NO');
        $end = Carbon::parse($this->end)->locale('nb_NO');

        if ($start->toDateString() == $end->toDateString()) {
            $time = $start->secondsSinceMidnight() > 0 ? ' [kl] HH.mm' : '';
            return Carbon::parse($this->start)->isoFormat('dddd D. MMMM' . $time);
        } elseif ($start->format("m") == $end->format("m")) {
            return sprintf("%s-%s", $start->isoFormat('ddd D.'), $end->isoFormat('ddd D. MMMM'));
        }

        return sprintf("%s - %s", $start->isoFormat('ddd D. MMM'), $end->isoFormat('ddd D. MMM'));
    }

    /**
     * Get prettyformatted duration for recurring event
     *
     * @return string
     */
    public function getDurationRecurring()
    {
        $start = Carbon::parse($this->start)->locale('nb_NO');

        if ($this->start == $this->end) {
            return ucfirst($start->isoFormat('dddd[er]'));
        } else {
            return ucfirst($start->isoFormat('dddd[er kl] HH.mm'));
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
     * @return \Spatie\IcalendarGenerator\Components\Event
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

        $event = Event::create(strip_tags($this->title));

        if ($desc) {
            $event->description($desc);
        }

        if ($this->place) {
            $event->address($this->place);
        }

        $event->startsAt(new \DateTime($this->start));
        $event->endsAt($this->getCalEnd());

        if ((bool) $this->allday) {
            $event->fullDay();
        }

        if ($this->frequency) {
            $rrule = RRule::frequency(RecurrenceFrequency::from($this->frequency));
            $rrule->interval($this->interval);
            $rrule->times($this->count);

            $event->rrule($rrule);
        }

        return $event;
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
     * Calculate and store the count of repeats of a recurring event
     */
    protected function setCountFromUntil($until_date) {
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

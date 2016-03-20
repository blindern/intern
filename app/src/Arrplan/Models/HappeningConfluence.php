<?php namespace Blindern\Intern\Arrplan\Models;

use Carbon\Carbon;
use ICal; // https://github.com/johngrogg/ics-parser

class HappeningConfluence extends Happening
{
    public static function loadExternalEvents()
    {
        $calendars = [
            // Prioriterte hendelser
            [
                "priority" => "high",
                "url" => "https://foreningenbs.no/confluence/rest/calendar-services/1.0/calendar/export/subcalendar/private/e5a4f5a3d6e9f59c56ed11357aeac75cc0e7797b.ics"
            ],

            // Praktisk info
            [
                "priority" => "medium",
                "url" => "https://foreningenbs.no/confluence/rest/calendar-services/1.0/calendar/export/subcalendar/private/beec89491d0657c568d32b7e5006aa155d7fef20.ics"
            ],

            // Ukesaktiviteter o.l.
            [
                "priority" => "low",
                "url" => "https://foreningenbs.no/confluence/rest/calendar-services/1.0/calendar/export/subcalendar/private/4f9b8510644e16ccf56a11517c1e5575cd495946.ics"
            ]
        ];

        $recurring_events_parsed = [];

        $events = [];
        foreach ($calendars as $calendar) {
            $ical = new ICal();
            $ical->initURL($calendar['url']);

            foreach ($ical->events() as $event) {
                $new = new static();

                $start = Carbon::parse($event['DTSTART']);
                $end = Carbon::parse($event['DTEND']);

                $new->allday = $start->secondsSinceMidnight() == 0 && $start->copy()->modify("+1 day") == $end;
                if ($new->allday) {
                    $new->start = $start->toDateString();
                    $new->end = $start->toDateString();
                } else {
                    $new->start = $start->toDateTimeString();
                    $new->end = $end->toDateTimeString();
                }

                $new->title = $event['SUMMARY'];

                if (isset($event['LOCATION'])) {
                    $new->place = $event['LOCATION'];
                }

                $new->priority = $calendar['priority'];

                if (isset($event['RRULE'])) {
                    // the ics-parser expands all recurring events into seperate events
                    // we can detect this by looking at UID-field, which will be the same for duplicates
                    // if this is a duplicate, add it as a special event so can show it on
                    // "upcoming events" page
                    if (in_array($event['UID'], $recurring_events_parsed)) {
                        $new->isDuplicateRecurringEvent = true;
                    } else {
                        $recurring_events_parsed[] = $event['UID'];

                        if (preg_match('/FREQ=(.+?);.*UNTIL=(.+?);.*INTERVAL=(.+?)(;|$)/', $event['RRULE'], $match)) {
                            $new->frequency = $match[1];
                            $new->interval = (int) $match[3];
                            $new->setCountFromUntil($match[2]);
                        }
                    }
                }

                $list[] = $new;
            }
        }

        return $list;
    }
}
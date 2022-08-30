<?php namespace Blindern\Intern\Arrplan\Models;

use Carbon\Carbon;
use ICal\ICal; // https://github.com/johngrogg/ics-parser

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

        $tz_correct = new \DateTimeZone('Europe/Oslo');

        $events = [];
        foreach ($calendars as $calendar) {
            $ical = new ICal();
            $ical->initURL($calendar['url'], array(
                "skipRecurrence" => true,
            ));

            /** @var \ICal\Event $event */

            foreach ($ical->events() as $event) {
                $new = new static();

                $start = Carbon::parse($event->dtstart);
                $end = Carbon::parse($event->dtend);

                $new->allday = $start->secondsSinceMidnight() == 0 && $start->copy()->modify("+1 day") == $end;
                if ($new->allday) {
                    $new->start = $start->toDateString();
                    $new->end = $start->toDateString();
                } else {
                    $start->timezone = $tz_correct;
                    $new->start = $start->toDateTimeString();
                    $end->timezone = $tz_correct;
                    $new->end = $end->toDateTimeString();
                }

                $new->title = $event->summary;

                if (isset($event->location)) {
                    $new->place = $event->location;
                }

                $new->priority = $calendar['priority'];

                if (isset($event->rrule)) {
                    // the ics-parser expands all recurring events into seperate events
                    // we can detect this by looking at UID-field, which will be the same for duplicates
                    // if this is a duplicate, add it as a special event so can show it on
                    // "upcoming events" page
                    if (isset($recurring_events_parsed[$event->uid])) {
                        $main_event = $recurring_events_parsed[$event->uid];
                        $new->isDuplicateRecurringEvent = true;

                        // correct for dst as the ics-parser does this wrong (and confluence sends wrong data)
                        if (!$main_event->allday) {
                            $start->addSeconds($main_event->start_object->offset);
                            $end->addSeconds($main_event->start_object->offset);
                            $new->start = $start->toDateTimeString();
                            $new->end = $end->toDateTimeString();
                        }
                    } else {
                        $new->start_object = $start;
                        $recurring_events_parsed[$event->uid] = $new;

                        if (preg_match('/FREQ=(.+?);.*UNTIL=(.+?);.*INTERVAL=(.+?)(;|$)/', $event->rrule, $match)) {
                            $new->frequency = $match[1];
                            $new->interval = (int) $match[3];
                            $new->setCountFromUntil($match[2]);
                        }

                        if (preg_match('/FREQ=(.+?);.*COUNT=(.+?);.*INTERVAL=(.+?)(;|$)/', $event->rrule, $match)) {
                            $new->frequency = $match[1];
                            $new->interval = (int) $match[3];
                            $new->count = (int) $match[2];
                        }
                    }
                }

                $list[] = $new;
            }
        }

        return $list;
    }
}

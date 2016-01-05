<?php namespace App\Http\Controllers;

use Carbon\Carbon;
use Eluceo\iCal\Component\Calendar;
use Eluceo\iCal\Component\Event;
use Blindern\Intern\Matmeny\Models\Matmeny;

class MatmenyController extends Controller
{
    public function index()
    {
        $from = new Carbon;
        $from->setISODate($from->format("o"), $from->format("W"), 1);
        $from->modify("-1 week");

        $to = new Carbon;
        $to->setISODate($to->format("o"), $to->format("W"), 7);
        $to->modify("+1 week");

        $days = Matmeny::orderBy('day')
                ->whereBetween('day', array(
                        $from->format("Y-m-d"),
                        $to->format("Y-m-d")))
                ->get();

        // set keys
        $days2 = array();
        foreach ($days as $day) {
            $days2[$day->day] = $day;
        }

        // make array of weeks containing all days in the week
        // we start at $from, then go 7 and 7 days for each week
        // the array must be dayname then week (to format the table in view)
        $data = array();
        $d = $from;
        for ($i = 0; $i < 3; $i++) {
            for ($j = 0; $j < 7; $j++) {
                // make day if needed
                if (!isset($data[$j])) {
                    $data[$j] = array();
                }

                // add the day to array
                $date = $d->format("Y-m-d");
                $day = isset($days2[$date])
                        ? $days2[$date]->toArray()
                        : null;
                $data[$j][$date] = $day;

                // advance to next day
                $d->modify("+1 day");
            }
        }

        return \View::make('matmeny', array(
            'days' => $data
        ));
    }

    /**
     * Handle and render the iCal-version
     */
    public function ics()
    {
        $cal = new Calendar("foreningenbs.no/matmeny");
        $cal->setName("Matmeny Blindern Studenterhjem");

        $from = new Carbon;
        $from->modify('-6 weeks');
        $to = new Carbon;
        $to->modify('+2 weeks');

        $days = Matmeny::orderBy('day')
                ->whereBetween('day', array(
                        $from->format("Y-m-d"),
                        $to->format("Y-m-d")))
                ->get();

        foreach ($days as $day) {
            $event = new Event();
            $event->setUseTimezone(true);
            $event->setDtStart(new \DateTime($day['day']));
            $end = new \DateTime($day['day']);
            $end->modify('+1 day');
            $event->setDtEnd($end);
            $event->setNoTime(true);

            $text = implode(', ', $day['dishes']);
            if (!empty($day['text'])) {
                $text .= ' (' . $day['text'] . ')';
            }

            $event->setSummary($text);
            $cal->addEvent($event);
        }

        $response = \Response::make($cal->render(), 200, array(
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'inline; filename="matmeny.ics"'
        ));

        return $response;
    }
}

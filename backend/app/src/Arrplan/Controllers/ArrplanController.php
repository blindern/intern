<?php namespace Blindern\Intern\Arrplan\Controllers;

use \Blindern\Intern\Arrplan\Models\Happening;
use \Eluceo\iCal\Component\Calendar;
use \Eluceo\iCal\Component\Event;
use \Eluceo\iCal\Property\Event\RecurrenceRule;
use \App\Http\Controllers\Controller;

class ArrplanController extends Controller
{
    /**
     * Handle the main calendar-view
     */
    public function action_index()
    {
        $data = Happening::getHappenings();

        /*$happenings = Happening::orderBy('start')->whereNull('frequency')->get();

        $result = Happening::orderByRaw('WEEKDAY(start), TIME(start)')->whereNotNull('frequency')->get();*/
        $happenings = array();
        $recurring = array();
        foreach ($data as $row) {
            if ($row->isRecurring()) {
                $recurring[] = $row;
            } else {
                $happenings[] = $row;
            }
        }

        return \View::make("kalender/index", array(
            "happenings" => $happenings,
            "recurring"  => $recurring
        ));
    }

    /**
     * Handle and render the iCal-version
     */
    public function action_ics()
    {
        //$happenings = Happening::all();
        $happenings = Happening::getHappenings();

        $cal = new Calendar("foreningenbs.no");
        $cal->setName("Blindern Studenterhjem");

        foreach ($happenings as $happening) {
            if ($happening->isComment() || $happening->isDuplicateRecurringEvent) {
                continue;
            }
            $cal->addEvent($happening->getEvent());
        }

        $response = \Response::make($cal->render(), 200, array(
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'inline; filename="cal.ics"'
        ));

        return $response;
    }
}

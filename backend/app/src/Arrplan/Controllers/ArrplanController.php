<?php namespace Blindern\Intern\Arrplan\Controllers;

use \Blindern\Intern\Arrplan\Models\Happening;
use \Eluceo\iCal\Component\Calendar;
use \App\Http\Controllers\Controller;

class ArrplanController extends Controller
{
    /**
     * Handle and render the iCal-version
     */
    public function ics()
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

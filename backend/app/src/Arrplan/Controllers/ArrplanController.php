<?php namespace Blindern\Intern\Arrplan\Controllers;

use \Blindern\Intern\Arrplan\Models\Happening;
use \App\Http\Controllers\Controller;
use Spatie\IcalendarGenerator\Components\Calendar;

class ArrplanController extends Controller
{
    /**
     * Handle and render the iCal-version
     */
    public function ics()
    {
        //$happenings = Happening::all();
        $happenings = Happening::getHappenings();

        $calendar = Calendar::create("foreningenbs.no");
        $calendar->description("Blindern Studenterhjem");

        foreach ($happenings as $happening) {
            if ($happening->isComment() || $happening->isDuplicateRecurringEvent) {
                continue;
            }
            $calendar->event($happening->getEvent());
        }

        $response = \Response::make($calendar->get(), 200, array(
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'inline; filename="cal.ics"'
        ));

        return $response;
    }
}

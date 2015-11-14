<?php namespace App\Http\Controllers\API;

use \HappeningNew;
use \Eluceo\iCal\Component\Calendar;
use \Eluceo\iCal\Component\Event;
use \Eluceo\iCal\Property\Event\RecurrenceRule;
use \App\Http\Controllers\Controller;

class ArrplanController extends Controller
{
    public function index()
    {
        $res = HappeningNew::getHappenings(isset($_GET['invalidate']));

        $data = array();
        foreach ($res as $row) {
            $data[] = $row->toArray();
        }

        return $data;
    }

    public function next()
    {
        $count = max(1, \Input::get('count', 5));
        return HappeningNew::getNext($count);
    }
}

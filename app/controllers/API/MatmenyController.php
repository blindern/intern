<?php namespace API;

use Carbon\Carbon;
use Blindern\Intern\Matmeny\Models\Matmeny;
use Blindern\Intern\Matmeny\FileParser;
use Blindern\Intern\Matmeny\FileParserException;
use Blindern\Intern\Matmeny\FileParserFormatException;

class MatmenyController extends \Controller {
    /**
     * Hent matmeny for forrige, denne og neste uke
     * evt. etter dato spesifisert i ?from og ?to
     */
    public function index() {
        if (isset($_GET['from'])) {
            $from = $_GET['from'];
        } else {
            $from = new Carbon;
            $from->setISODate($from->format("o"), $from->format("W"), 1);
            $from = $from->modify("-1 week")->format("Y-m-d");
        }

        if (isset($_GET['to'])) {
            $to = $_GET['to'];
        } else {
            $to = new Carbon;
            $to->setISODate($to->format("o"), $to->format("W"), 7);
            $to = $to->modify("+1 week")->format("Y-m-d");
        }

        return Matmeny::orderBy('day')
                ->whereBetween('day', array($from, $to))
                ->get();
    }

    /**
     * Konverter word-dokument til ukemeny
     */
    public function convert() {
        if (!isset($_FILES['file']['tmp_name']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
            return 'error';
        }

        $contents = file_get_contents($_FILES['file']['tmp_name']);

        try {
            $parser = new FileParser($contents);
            return $parser->getDays();
        } catch (FileParserFormatException $e) {
            return 'error-format';
        } catch (FileParserException $e) {
            return 'unknown-error';
        }
    }

    /**
     * Lagre endringer for en mengde datoer
     */
    public function store() {
        // tilgangsbegrensning
        if (\Auth::guest() && !\Blindern\Intern\Auth\Helper::isOffice()) {
            return Response::json(null, 401, (new Flash("Denne siden krever at du logger inn."))->setError()->toHeader());
        }
        if (!\Blindern\Intern\Auth\Helper::isOffice() &&
                !\Auth::member('admin') &&
                !\Auth::member('kollegiet')) {
            return Response::json(null, 403, (new Flash("Du har ikke tilgang til denne siden."))->setError()->toHeader());
        }

        if (!is_array(\Input::get('days'))) {
            return 'format-error';
        }

        // valider data og bygg ny data
        $change = array();
        foreach (\Input::get('days') as $day) {
            if (!isset($day['day'])) return 'format-error';

            $d = Carbon::parse($day['day']);
            if ($d->format("Y-m-d") != $day['day']) return 'format-error';

            if (isset($day['dishes'])) {
                if (!is_array($day['dishes'])) return 'format-error';
                foreach ($day['dishes'] as $dish) {
                    if (!is_scalar($dish)) return 'format-error';
                }
            }

            $change[$day['day']] = array(
                'dishes' => !empty($day['dishes']) ? $day['dishes'] : null,
                'text' => !empty($day['text']) ? $day['text'] : null
            );
        }

        // gjør endringene
        $ret = array();
        foreach ($change as $day => $data) {
            $delete = empty($data['dishes']) && empty($data['text']);
            $m = Matmeny::where('day', $day)->first();
            if (!$m) {
                if ($delete) continue;
                $m = new Matmeny;
                $m->day = $day;
            } elseif ($delete) {
                $m->delete();
                continue;
            }

            $m->dishes = $data['dishes'];
            $m->text = $data['text'];
            $m->save();
            $ret[] = $m;
        }

        return $ret;
    }
}
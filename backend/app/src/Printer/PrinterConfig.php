<?php namespace Blindern\Intern\Printer;

class PrinterConfig {
    public static $texts = array(
        "beboer" => "Faktureres den enkelte beboer gjennom BS og utbetales av BS.",
        "dugnaden" => "Dekkes av BS.",
        "ffhost" => "Kostnadsføres direkte på festforeningen for høstsemesteret.",
        "ffvaar" => "Kostnadsføres direkte på festforeningen for vårsemesteret.",
        "fs" => "Kostnadsføres direkte på foreningsstyret.",
        "hyttestyret" => "Kostnadsføres direkte på hyttestyret.",
        "kollegiet" => "Dekkes av BS.",
        "printeroppmann" => "Ikke inntektsbringende.",
        "uka" => "Kostnadsføres direkte på UKA.",
        "velferden" => "Kostnadsføres direkte på velferden.",
    );

    public static $no_faktura = array(
        "printeroppmann",
    );

    public static $section_default = "fbs";

    public static $sections = array(
        "beboer" => array(
            "printers" => array("beboer"),
            "is_beboer" => true,
            "title" => "Faktureres enkeltbeboere",
            "description" => ""
        ),
        "other" => array(
            "printers" => array("kollegiet", "dugnaden"),
            "is_beboer" => false,
            "title" => "Faktureres administrasjonen",
            "description" => "Faktureres/dekkes gjennom BS og utbetales av BS."
        ),
        "fbs" => array(
            "printers" => array("ffhost", "ffvaar", "fs", "hyttestyret", "printeroppmann", "uka", "velferden"),
            "is_beboer" => false,
            "title" => "Kostnadsføres internt i FBS",
            "description" => "Føres som en kostnad direkte i foreningens regnskap samtidig med inntekten. Skal ikke utbetales fra BS."
        )
    );

    public static $accounts = array(
        array(
            "printers" => null,
            "account" => 3261,
            "text" => "Avdeling/prosjekt: Foreningsstyret/printer",
        ),
        array(
            "printers" => array("beboer", "kollegiet", "dugnaden"),
            "account" => "1500",
            "text" => "Kunde: Blindern Studenterhjem"
        ),
        array(
            "printers" => array("ffhost"),
            "account" => "6820",
            "text" => "Avdeling/prosjekt: Festforening høst"
        ),
        array(
            "printers" => array("ffvaar"),
            "account" => "6820",
            "text" => "Avdeling/prosjekt: Festforening vår"
        ),
        array(
            "printers" => array("fs"),
            "account" => "6820",
            "text" => "Avdeling/prosjekt: Foreningsstyret"
        ),
        array(
            "printers" => array("velferden"),
            "account" => "6820",
            "text" => "Avdeling/prosjekt: Foreningsstyret/Velferden"
        ),
        array(
            "printers" => array("hyttestyret"),
            "account" => "6820",
            "text" => "Avdeling/prosjekt: Hyttestyret"
        ),
        array(
            "printers" => array("uka"),
            "account" => "6820",
            "text" => "Avdeling/prosjekt: UKA"
        )
    );

    public static $amount = array(
        0 => 0.5,
        '2014-03' => 0.4

        //'2013-10' => 0.7,
        //'2014-01' => 0.4,

        // examples:
        #"2014-05" => 0.3, // from 2014-05-01
        #"2014-06" => 0.5  // from 2014-06-01

        // list must be ordered by date
        // only works by months
    );

    /**
     * Get amount for a specified month
     *
     * @param string eg. '2014-01'
     */
    public static function getCost($month_date)
    {
        static $cache;
        list($year, $month) = explode("-", $month_date);

        if (isset($cache[$month_date])) return $cache[$month_date];

        $last_amount = 0;
        foreach (self::$amount as $start => $amount)
        {
            if ($start == 0)
            {
                $last_amount = $amount;
            }

            else
            {
                list($check_year, $check_month) = explode("-", $start);
                if ($check_year < $year || ($check_year == $year && $check_month <= $month))
                {
                    $last_amount = $amount;
                }
            }
        }

        $cache[$month_date] = $last_amount;
        return $last_amount;
    }
}

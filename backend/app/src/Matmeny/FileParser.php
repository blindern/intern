<?php namespace Blindern\Intern\Matmeny;

/**
 * Convert Word-document with weekly menu to a array representing the week
 */
class FileParser
{
    /**
     * The final result
     *
     * Will be a array of 7 elements with another array for each day
     */
    private $days;

    /**
     * Constructor. Generates a array of days from the data provided
     *
     * @param binary data of the file (the binary for the Word-document)
     */
    public function __construct($data)
    {
        // store data temporarily
        $temp_file = tempnam(sys_get_temp_dir(), 'bs-intern-matmeny');
        $f = fopen($temp_file, "w");
        fwrite($f, $data);
        fclose($f);

        // convert
        $text = shell_exec("antiword -w 0 ".escapeshellarg($temp_file));

        // delete temp file
        unlink($temp_file);

        // parse data
        if (empty($text)) {
            throw new FileParserEmptyResultException("Is antiword available on system?");
        }
        $this->parse($text);
    }

    /**
     * Parse the contents saved in $this->text
     */
    private function parse($text)
    {
        // split text so that 1 => "Mandag", 3 => "Tirsdag", 5 => "Onsdag" etc.
        // and indexes 0, 2, 6, .. is content between these daynames
        $days = "(Mandag|Tirsdag|Onsdag|Torsdag|Fredag|Lørdag|Søndag)";
        $result = preg_split("/$days/u", $text, null, PREG_SPLIT_DELIM_CAPTURE);

        // it should generate 15 items (7 daynames + 7 contents + data before first dayname)
        if (count($result) != 15) {
            throw new FileParserTooFewDaysException("Splitted string should be 15 elements, it is ".count($result).".");
        }

        // extract contents
        $data = array();
        reset($result);
        next($result); // jump to first dayname
        $day_id = 1; // 1 --> 7
        while (($row = current($result)) !== false) {
            // the current element should be daynam
            $dag = $row;
            if (strlen($dag) > 10) {
                throw new FileParserFormatException();
            }

            // next element will be contents for the day
            $content = next($result);

            // clean up the contents for the day
            $data[$day_id++] = $this->parse_part($content);

            // prepare next day
            next($result);
        }

        $this->days = $data;
    }

    /**
     *  Convert the contents for a day in the document to a array
     */
    private function parse_part($content)
    {
        // extract the rows and clear most whitespace
        // contents will always be inside |..| because of the table in the document
        if (!preg_match_all("/^(\s+|\\|\s+)\\|(.+?)\s+\\|/mu", $content, $matches)) {
            return "";
        }

        $res = array();
        foreach ($matches[2] as $row) {
            $row = trim($row);
            if ($row == "") {
                continue;
            }

            // if everything is uppercase, make only first char uppercase
            if (mb_strtoupper($row) == $row) {
                $row = mb_substr($row, 0, 1).mb_strtolower(mb_substr($row, 1));
            }

            $res[] = $row;
        }

        return $res;
    }

    /**
     * Get the days generated from the parsing of the document
     */
    public function getDays()
    {
        return $this->days;
    }
}

class FileParserException extends \Exception
{
}
class FileParserEmptyResultException extends FileParserException
{
}
class FileParserFormatException extends FileParserException
{
}
class FileParserTooFewDaysException extends FileParserFormatException
{
}

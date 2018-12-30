<?php namespace Blindern\Intern\Arrplan\Models;

use Carbon\Carbon;

/*
 * TODO: Support skips on repeats (split into multiple events)
 */

class HappeningMediaWiki extends Happening
{
    public static function loadExternalEvents()
    {
        $url = "https://foreningenbs.no/w/api.php?format=json&action=query&titles=Arrangementplan_til_nettsiden&prop=revisions&rvprop=content";
        $data = file_get_contents($url);

        $data = json_decode($data, true);
        if ($data === false || !isset($data['query']['pages'])) {
            return array();
        }

        $data = $data['query']['pages'];
        $data = current($data);
        $data = $data['revisions'][0]['*'];
        if (preg_match_all("~<pre>(.+?)</pre>~ms", $data, $matches)) {
            // see wiki-page for syntax info
            $lines = preg_split("/\\r?\\n/", implode("\n", $matches[1]));

            $res = array();
            $cur = null;
            $blanks = 0;
            $get_title = false;
            $is_info = false;
            foreach ($lines as $row) {
                // skip empty and comments
                if (empty($row) || substr($row, 0, 1) == "#" || substr($row, 2, 1) == "#") {
                    if (empty($row)) {
                        $blanks++;
                    }
                    continue;
                }

                // new?
                if (substr($row, 0, 2) != "  ") {
                    $cur = null;
                    $is_info = false;

                    // match date
                    if (preg_match("~^(\\d{4}-\\d\\d-\\d\\d)( \\d\\d:\\d\\d)?(->(\\d{4}-\\d\\d-\\d\\d)? ?(\\d\\d:\\d\\d)?)? ?(.*)$~", $row, $matches)) {
                        // 1 => from date
                        // 2 => from time
                        // 4 =>   to date
                        // 5 =>   to time
                        // 6 => title with options

                        $from = $matches[1] . (!empty($matches[2]) ? $matches[2] : '');
                        $to = $from;
                        if (isset($matches[4])) {
                            $to = empty($matches[4]) ? $matches[1] : $matches[4];
                            $to .= (isset($matches[5]) ? ' ' . $matches[5] : '');
                        }

                        $cur = new static();
                        $cur->start = trim($from);
                        $cur->end   = trim($to);
                        $cur->allday     = empty($matches[2]) || empty($matches[5]);

                        // title can be specified at the date/time-line, or it's own line
                        if ($matches[6]) {
                            preg_match("~^(.+?)(\\s+\\((.+?)\\))?(\\s+(LOW|MEDIUM|HIGH))?$~", $matches[6], $submatches);

                            $cur->title = trim($submatches[1]);
                            $res[] = $cur;
                            $get_title = false;

                            if (!empty($submatches[3])) {
                                $cur->by = trim($submatches[3]);
                            }

                            if (!empty($submatches[5])) {
                                $pri = trim($submatches[5]);
                                switch ($pri) {
                                case "LOW":
                                    $cur->priority = "low";
                                    break;
                                case "HIGH":
                                    $cur->priority = "high";
                                    break;
                                default:
                                    $cur->priority = "medium";
                                }
                            }
                        } else {
                            $get_title = true;
                        }
                    }

                    // comment?
                    // comments are special and only contains date and comments!
                    elseif (preg_match("~^COMMENT (\\d{4}-\\d\\d-\\d\\d)$~", $row, $matches)) {
                        $from = $matches[1];
                        $to = $from;

                        $cur = new static();
                        $cur->isComment = true;
                        $cur->start = trim($from);
                        $cur->end   = trim($to);

                        $res[] = $cur;
                        $blanks = 0;
                    }
                } elseif ($cur->isComment()) {
                    while ($blanks > 0) {
                        $cur->comment .= "\n";
                        $blanks--;
                    }
                    $cur->comment .= trim(substr($row, 2));
                    $blanks = 0;
                } else {
                    if ($get_title) {
                        // must be title
                        $cur->title = trim($row);
                        $res[] = $cur;
                        $get_title = false;
                    } else {
                        if (substr($row, 2, 3) == "BY:") {
                            $cur->by = trim(substr($row, 5));
                            $is_info = false;
                        } elseif (substr($row, 2, 6) == "PLACE:") {
                            $cur->place = trim(substr($row, 8));
                            $is_info = false;
                        } elseif (substr($row, 2, 4) == "PRI:") {
                            $pri = trim(substr($row, 6));
                            switch ($pri) {
                            case "LOW":
                                $cur->priority = "low";
                                break;
                            case "HIGH":
                                $cur->priority = "high";
                                break;
                            default:
                                $cur->priority = "medium";
                            }
                            $is_info = false;
                        } elseif (substr($row, 2, 5) == "INFO:") {
                            $cur->info = trim(substr($row, 7));
                            $blanks = 0;
                            $is_info = true;
                        } elseif (substr($row, 2, 7) == "REPEAT:") {
                            $cur->setRepeat(trim(substr($row, 9)));
                            $is_info = false;
                        }

                        // additional information (on new line)
                        elseif (substr($row, 2, 2) == "  " && $is_info) {
                            while ($blanks > 0) {
                                $cur->info .= "\n";
                                $blanks--;
                            }
                            $cur->info .= trim($row);
                            $blanks = 0;
                        }
                    }
                }
            }

            return $res;
        }
    }

    private function setRepeat($text)
    {
        // syntax: <repeat type>:<number of repeats>[:<interval>[:<list of numbers to skip>]]
        if (preg_match("~^(DAILY|WEEKLY|MONTHLY):((\\d{4}-\\d\\d-\\d\\d)|(\\d+))(:(\\d+)(:(\\d+(,\\d+)*))?)?$~m", $text, $matches)) {
            $this->frequency = $matches[1];

            if (!empty($matches[4])) {
                $this->count = $matches[4];
            } else {
                $this->setCountFromUntil($matches[2]);
            }

            $this->interval = isset($matches[6]) ? (int) $matches[6] : 1;

            // TODO: $matches[8]; (the ones to skip)
        }
    }
}
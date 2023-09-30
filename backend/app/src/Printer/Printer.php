<?php namespace Blindern\Intern\Printer;

class Printer {
    /**
     * Connection to psql
     */
    public $conn;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->conn = new \PDO(
            \Config::get('services.printerdb.dsn'),
            \Config::get('services.printerdb.username'),
            \Config::get('services.printerdb.password'),
        );
        $this->conn->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
    }

    /**
     * Get list of last prints
     *
     * @param int Number of prints to show
     * @return array
     */
    public function getLastPrints($num)
    {
        $num = (int) $num;

        // hent siste 30 stk utskrifter
        $sql = "
          SELECT j.jobsize, j.jobdate, LOWER(u.username) username, p.printername
          FROM jobhistory j
            JOIN users u ON j.userid = u.id
            JOIN printers p ON j.printerid = p.id
          ORDER BY j.jobdate DESC
          LIMIT $num";
        $last = $this->conn->prepare($sql);
        $last->execute();

        return $last->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get list of usage
     *
     * @param string Date from (must be valid)
     * @param stirng Date to (must be valid)
     * @return array
     */
    public function getUsageData($from, $to, $username = null, $group = null)
    {
        $extra = '';
        $prepares = array();
        if ($username)
        {
            $extra .= ' AND u.username = ?';
            $prepares[] = $username;
        }
        if ($group)
        {
            $extra .= ' AND p.printername = ?';
            $prepares[] = $group;
        }

        $sql = "
          SELECT to_char(j.jobdate, 'YYYY') jobyear, to_char(j.jobdate, 'MM') jobmonth,
                 COUNT(j.id) count_jobs, SUM(j.jobsize) sum_jobsize, MAX(j.jobdate) last_jobdate,
                 LOWER(u.username) username,
                 p.printername
          FROM jobhistory j
               JOIN users u ON j.userid = u.id
               JOIN printers p ON j.printerid = p.id
          WHERE j.jobdate::date >= date '$from' AND j.jobdate::date <= date '$to'$extra
          GROUP BY LOWER(u.username), p.printername, jobyear, jobmonth
          ORDER BY jobyear, jobmonth, p.printername, LOWER(u.username)";

        $sth = $this->conn->prepare($sql);
        $sth->execute($prepares);

        $list = array();
        $d = $sth->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($d as $row) {
            $row['cost_each'] = PrinterConfig::getCost($row['jobyear'].'-'.$row['jobmonth']);
            $row['username'] = strtolower($row['username']);
            $list[$row['printername']][$row['username']][] = $row;
        }

        /*
        data:
            [printername]
              [username]
                []
                  jobyear
                  jobmonth
                  count_jobs
                  sum_jobsize
                  last_jobdate
                  cost_each
        */

        // set up correct array
        /*
        data:
            []
                printername
                users
                    []
                        username
                        prints
                            []
                                jobyear
                                ...

        */
        $n = array();
        foreach ($list as $printername => $users)
        {
            $x_users = array();
            foreach ($users as $username => $prints)
            {
                $x_users[] = array(
                    "username" => strtolower($username),
                    "prints" => $prints
                );
            }
            $n[] = array(
                "printername" => $printername,
                "users" => $x_users
            );
        }

        return $n;
    }

    /**
     * Get daily usage numbers
     *
     * @param string Date from (must be valid)
     * @param stirng Date to (must be valid)
     * @return array
     */
    public function getDailyUsageData($from, $to, $username = null, $group = null)
    {
        $extra = '';
        $prepares = array();
        if ($username)
        {
            $extra .= ' AND u.username = ?';
            $prepares[] = $username;
        }
        if ($group)
        {
            $extra .= ' AND p.printername = ?';
            $prepares[] = $group;
        }

        $sql = "
          SELECT to_char(j.jobdate, 'YYYY-MM-DD') jobday,
                 COUNT(j.id) count_jobs, SUM(j.jobsize) sum_jobsize
          FROM jobhistory j
          WHERE j.jobdate::date >= date '$from' AND j.jobdate::date <= date '$to'$extra
          GROUP BY jobday
          ORDER BY jobday";

        $sth = $this->conn->prepare($sql);
        $sth->execute($prepares);

        $list = array();
        return $sth->fetchAll(\PDO::FETCH_ASSOC);
    }
}

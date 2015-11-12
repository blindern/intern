<!DOCTYPE html>
<html>
<head>
<meta name="robots" content="noindex, nofollow" />
<title>Matmeny</title>
<style>
.table {
    border: 1px solid black;
    border-collapse: collapse;
    margin-bottom: 1em;
}

.table th {
    text-align: left;
    background-color: #EEEEEE;
}

.table td, .table th {
    border: 1px solid black;
    padding: 2px 4px;
}
</style>
</head>
<body>
<table class="table matmeny">
    <thead>
        <tr>
            <th>&nbsp;</th>
            <th>Forrige uke</th>
            <th>Denne uke</th>
            <th>Neste uke</th>
        </tr>
    </thead>
    <tbody>

        <?php

        $today = \Carbon\Carbon::now()->format("Y-m-d");
        $daynames = array('Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag');
        foreach ($days as $i => $day) {
            echo '
        <tr>
            <th>'.$daynames[$i].'</th>';

            foreach ($day as $date => $day_in_week) {
                $styles = '';
                if ($date == $today) $styles .= 'background-color:#00FF00;';

                $val = array();
                if ($day_in_week) {
                    if (!empty($day_in_week['text']))
                        $val = array('<span style="color:red">'.htmlspecialchars($day_in_week['text']).'</span>');
                    if (isset($day_in_week['dishes']))
                        $val = array_merge($val, array_map('htmlspecialchars', $day_in_week['dishes']));
                }

                if (count($val) == 0) {
                    $styles .= 'font-style:italic;color:#CCC';
                    $val[] = 'Ingen data';
                }

                echo '
            <td style="'.$styles.'">'.implode('<br>', $val).'</td>';
            }

            echo '
        </tr>';
        }

        ?>

    </tbody>
</table>
<p><span style="background-color: #00FF00">Grønt</span> er dagens. Kjøkkensjefen oppdaterer selv denne menyen på nett.</p>
</body>
</html>
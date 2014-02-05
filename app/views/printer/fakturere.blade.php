@extends('layout')

@section('title')
	Fakturering av utskrifter
@stop

@section('content')
	<?php

	$list = array();
	foreach ($prints as $printer => $rows) {
		$group = $printer == "beboer" ? "beboer" : "gruppe";
		$list[$group][$printer] = $rows;
	}

	/*$texts = array(
		"printoppmann" => "Skal ikke faktureres!",
		"fs" => "Skal ikke faktureres!",
		"beboer" => "Faktureres per beboer!",
		"ffvaar" => "Faktureres festforeningen for vårsemesteret.",
		"ffhost" => "Faktureres festforeningen for høstsemesteret."
	);
	$no_faktura = array(
		"printoppmann",
		"fs"
	);*/

	$sum_cash = 0;

	echo '
	<p style="color: #FF0000">Tidsperiode:<br />
	Fra: '.$from.'<br />
	Til: '.$to.'</p>';

	$out = '
	<div class="row">';

	#foreach ($list as $printer => $users) {
	foreach ($list as $group => $printers) {
		$is_group = $group != "beboer";
		if ($is_group) ksort($printers);
		$group_sum_pages = 0;
		$group_sum_cash = 0;
		$group_sum_cash_alt = 0;

		$out .= '
	<div class="printergroup col-md-6">';

		if (!$is_group) {
			$out .= '
	<h2>Fakturering enkeltbeboere</h2>';
		} else {
			$out .= '
	<h2>Fakturering grupper</h2>';
		}

		$out .= '
	<table class="table table-striped table-condensed" style="width: auto">
		<thead>
			<tr>
				<th>Navn</th>
				<th>Beløp</th>'.($is_group ? '
				<th>Kommentar</th>' : '').'
			</tr>
		</thead>
		<tbody>';

		foreach ($printers as $printer => $users) {
			$printer_sum_pages = 0;
			
			foreach ($users as $user => $printlist) {
				$user_sum_pages = 0;
				foreach ($printlist as $month) {
					$user_sum_pages += $month['sum_jobsize'];
				}
				$amount = $month['cost_each']; // TODO: support different amount for different months
				$n = number_format($user_sum_pages*$amount, 2, ",", " ");

				$name = $names[$user] ? $names[$user]['realname'] : $user;

				$beboerstatus = !in_array(strtolower($user), $grupper['beboer']) ? " <b>Utflyttet?</b>" : "";

				if (!$is_group) $out .= '
			<tr>
				<td>'.$name.$beboerstatus.'</td>
				<td style="text-align: right">'.$n.'</td>
			</tr>';

				$printer_sum_pages += $user_sum_pages;
			}

			$group_sum_pages += $printer_sum_pages;

			$cash = in_array($printer, $no_faktura) ? 0 : $printer_sum_pages*$amount;
			$cash_alt = in_array($printer, $no_faktura) ? $printer_sum_pages*$amount : false;
			$group_sum_cash += $cash;
			$group_sum_cash_alt += $cash_alt;

			if ($is_group) {
				$n = number_format($cash, 2, ",", " ");

				$t = array();
				if (isset($texts[$printer])) $t[] = $texts[$printer];
				if ($cash_alt !== false) $t[] = "(ikke fakturert: kr ".number_format($cash_alt, 2, ",", " ").")";
				if (count($t) == 0) $t[] = '&nbsp;';

				$out .= '
			<tr>
				<td>'.htmlspecialchars($printer).'</td>
				<td style="text-align: right">'.$n.'</td>
				<td>'.implode("<br />", $t).'</td>
			</tr>';
			}

		}

		$out .= '
		</tbody>
	</table>';

		$out .= '
	<p>Totalt '.$group_sum_pages.' sider = <b>kr '.number_format($group_sum_cash, 2, ",", " ").'</b>'.($group_sum_cash_alt ? ' (ikke fakturert: kr '.number_format($group_sum_cash_alt, 2, ",", " ").')' : '').'</p>
	</div>';

		$sum_cash += $group_sum_cash;
	}

	$out .= '
	</div>';

	echo '
	<p><b>Totalt til fakturering: kr '.number_format($sum_cash, 2, ",", " ").'</b></p>'.$out;
	?>
@stop
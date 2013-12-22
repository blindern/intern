@extends('layout')

@section('title')
	Brukerliste
@stop

@section('content')
<?php

$tr = array(array(), array());
$users_not_beboer = array(); // vis folk som ikke er i beboer-gruppa til slutt
for ($x = 0; $x < 2; $x++) {
	foreach ($users as $user) {
		if ($x == 0)
		{
			// check if is beboer
			$is_beboer = false;
			foreach ($user['groups'] as $group)
			{
				if ($group['name'] == 'beboer')
				{
					$is_beboer = true;
					break;
				}
			}

			if (!$is_beboer)
			{
				$users_not_beboer[] = $user;
				continue;
			}
		}
		
		$realname = $user['realname'] ?: '<i>Ukjent</i>';
		
		if (!Auth::member("lpadmin")) $mail = '<i>Skjult</i>';
		else $mail = $user['email'] ?: '<i>Ukjent</i>';

		if ($user['groups']) {
			$new = array();
			foreach ($user['groups'] as $group)
			{
				$new[] = $group['name'];
			}
			$user['groups'] = $new;
		}
		$groups = $user['groups'] ? implode(", ", array_map("htmlspecialchars", $user['groups'])) : '<i>Ingen grupper</i>';

		$tr[$x][] = '
		<tr>
			<td>'.htmlspecialchars($user['username']).'</td>
			<td>'.$realname.'</td>
			<td>'.$mail.'</td>
			<td>'.$groups.'</td>
		</tr>';
	}
	
	$users = $users_not_beboer;
}

?>
<p>Denne brukerlisten kan ses av alle innloggede brukere som ligger i <i>beboer</i>-gruppen.</p>

<div class="panel panel-primary">
	<div class="panel-heading">Beboere</div>
	<table class="table table-striped table-hover table-condensed">
		<thead>
			<tr>
				<th>Brukernavn</th>
				<th>Navn</th>
				<th>E-post</th>
				<th>Grupper</th>
			</tr>
		</thead>
		<tbody><?php echo implode($tr[0]); ?></tbody>
	</table>
</div>

<div class="panel panel-info">
	<div class="panel-heading">Andre brukere</div>
	<table class="table table-striped table-hover table-condensed">
		<thead>
			<tr>
				<th>Brukernavn</th>
				<th>Navn</th>
				<th>E-post</th>
				<th>Grupper</th>
			</tr>
		</thead>
		<tbody><?php echo implode($tr[1]); ?></tbody>
	</table>
</div>
@stop
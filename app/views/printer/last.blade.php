@extends('layout')

@section('title')
	Siste utskrifter
@stop

@section('content')
	<table class="table table-striped nowrap">
	<thead>
		<tr>
			<th>Tid</th>
			<th>Bruker</th>
			<th>Navn</th>
			<th>Printer</th>
			<th>Antall sider</th>
		</tr>
	</thead>
	<tbody>

	@foreach ($prints as $row)

	<?php
	$d = Carbon\Carbon::parse($row['jobdate']);
	$user = Auth::getProvider()->retrieveById($row['username']);
	$name = $user && isset($user->realname) ? htmlspecialchars($user->realname) : '<i>Ukjent</i>';
	?>

		<tr>
			<td>{{{ $d->format("Y-m-d H:i") }}}</td>
			<td>{{{ $row['username'] }}}</td>
			<td>{{ $name }}</td>
			<td>{{{ $row['printername'] }}}</td>
			<td style="text-align: right">{{{ $row['jobsize'] }}}</td>
		</tr>

	@endforeach
	</tbody>
</table>
@stop
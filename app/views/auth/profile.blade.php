@extends('layout')

@section('title')
	Brukerprofil
@stop

@section('content')
<?php

$user = Auth::user();
$groups = $user->groups();

?>
<ul>
	<li>Brukernavn: {{{ $user->username }}}</li>
	<li>Navn: {{{ $user->realname }}}</li>
	<li>E-post: {{{ $user->email }}}</li>
	<li>Grupper:
		<ul>
			@if (count($groups) == 0)
			<li>Ingen grupper!</li>
			@else
				@foreach ($groups as $group)
			<li>{{{ $group['name'] }}}</li>
				@endforeach
			@endif
		</ul>
	</li>
</ul>
@stop
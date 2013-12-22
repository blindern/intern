@extends('layout')

@section('title')
	Kalender
@stop

@section('content')
	<h2>Importer til egen kalender</h2>
	<p>Inntil videre er kalenderen kun tilgjengelig i kalenderformat, det vil si at du må importere den til en annen kalender.</p>
	<p>Du kan få kalenderen automatisk inn i Google Calender eller en annen kalender du måtte ha. For dette trenger du å legge inn denne adressen i kalenderen din:<br />
		<a href="{{{ URL::to('kalender.ical') }}}">{{{ URL::to('kalender.ical') }}}</a>
	</p>
@stop
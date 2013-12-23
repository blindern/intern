@extends('layout')

@section('title')
	Arrangementplan
@stop

@section('content')
	<h2>Arrangementer</h2>
		@foreach ($happenings as $r)
	<div class="row">
		<div class="col-xs-3 text-right">{{{ $r->getDuration() }}}</div>
		<div class="col-xs-9">{{ $r->title }}</div>
	</div>
		@endforeach
	
	<h2>Importer til egen kalender</h2>
	<p>Du kan få kalenderen automatisk inn i Google Calender eller en annen kalender du måtte ha. For dette trenger du å legge inn denne adressen i kalenderen din:<br />
		<a href="{{{ URL::to('arrplan.ical') }}}">{{{ URL::to('arrplan.ical') }}}</a>
	</p>
@stop
@extends('layout')

@section('title')
	Arrangementplan på Blindern Studenterhjem
@stop

@section('content')
	<div class="fbs_happenings">
		<p>Arrangementplanen kan endres i wikien: <a href="https://foreningenbs.no/wiki/Arrangementplan_til_nettsiden">https://foreningenbs.no/wiki/Arrangementplan_til_nettsiden</a></p>
		<h2>Arrangementer</h2>
		
		@foreach ($happenings as $r)
			<div class="row<?php if ($r->expired()) echo ' old-happening'; ?>">
				<div class="col-xs-3 text-right">{{{ $r->getDuration() }}}</div>
				<div class="col-xs-9">{{ $r->title }}@if ($r->by) <span style="color: #AAA">[{{ $r->by }}]</span>@endif</div>
			</div>
		@endforeach

		<h2>Øvrige aktiviteter</h2>

		@foreach ($recurring as $r)
			<div class="row">
				<div class="col-xs-3 text-right">{{{ $r->getDurationRecurring() }}}</div>
				<div class="col-xs-9">{{ $r->title }}@if ($r->by) <span style="color: #AAA">[{{ $r->by }}]</span>@endif</div>
			</div>
		@endforeach
		
		<h2>Importer til egen kalender</h2>
		<p>Du kan få kalenderen automatisk inn i Google Calender eller en annen kalender du måtte ha. For dette trenger du å legge inn denne adressen i kalenderen din:<br />
			<a href="{{{ URL::to('arrplan.ics') }}}">{{{ URL::to('arrplan.ics') }}}</a>
		</p>
	</div>
@stop
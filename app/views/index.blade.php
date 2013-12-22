@extends('layout')

@section('title')
	Blindern Studenterhjem Intern
@stop

@section('content')
	<p>Velg en av handlingene i menyen ovenfor.
		@if (!Auth::user())
	 	Du får flere handlinger ved å være logget inn.
	 	@endif
	 </p>
@stop
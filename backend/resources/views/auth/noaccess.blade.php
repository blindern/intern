@extends('layout')

@section('title')
	Ikke tilgang
@stop

@section('content')
	Du har ikke tilgang til denne siden. Den er forbeholdt brukere i gruppen <i>{{{ $group }}}</i>.
@stop
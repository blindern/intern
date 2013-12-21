@extends('layout')

@section('title')
	Brukerprofil
@stop

@section('content')
<?php

$user = Auth::user();

?>
<ul>
	<li>Brukernavn: {{{ $user->username }}}</li>
	<li>Navn: {{{ $user->realname }}}</li>
	<li>E-post: {{{ $user->email }}}</li>
	<li>Grupper:
		<ul>
			<?php
			/*if (count($user['groups']) == 0)
			{
			?>
			<li>Ingen grupper!</li>
			<?php
			} else {
				foreach ($user['groups'] as $group)
				{
					?>
			<li><?php echo $group[1]; ?></li>
					<?php
				}
			}*/
			?>
		</ul>
	</li>
</ul>
@stop
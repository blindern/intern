@extends('layout')

@section('title')
	Logg inn
@stop

@section('content')

<p>For å logge inn her må du benytte foreningsbrukeren din. Det er den du også bruker på foreningens printer, wiki m.v.</p>

<div class="row">
	<div class="col-md-6">
		<h2>Eksisterende bruker</h2>

		{{ Form::open(array("class" => "form-horizontal", "role" => "form")) }}

			<?php if (isset($login_error)): ?>
				<div class="error"><?php echo $login_error; ?></div>
			<?php endif; ?>

			<div class="form-group">
				<label for="form_username" class="col-lg-2 control-label">Brukernavn</label>
				<div class="col-lg-10">
					{{ Form::text('username', Input::get('username'), array("placeholder" => "Brukernavn", "class" => "form-control", "id" => "form_username")) }}
				</div>
			</div>

			<div class="form-group">
				<label for="form_password" class="col-lg-2 control-label">Passord</label>
				<div class="col-lg-10">
					{{ Form::password('password', array("placeholder" => "Passord", "class" => "form-control", "id" => "form_password")) }}
				</div>
			</div>

			<div class="form-group">
				<div class="col-lg-offset-2 col-lg-10">
					<div class="checkbox">
						<label>
							{{ Form::checkbox("remember_me", 1, true) }} Forbli pålogget
						</label>
					</div>
				</div>
			</div>

			<div class="form-group">
				<div class="col-lg-offset-2 col-lg-10">
					{{ Form::submit('Logg inn', array("name" => "submit", "class" => "btn btn-default")) }}
				</div>
			</div>

		{{ Form::close() }}
	</div> <!-- end col -->

	<div class="col-md-6">

		<h2>Opprett ny bruker</h2>

		<?php if (isset($reg_msg)): ?>
			<p class="bg-<?php if ($reg_msg_class) echo $reg_msg_class; else echo "primary"; ?>" style="padding: 15px"><?php echo $reg_msg; ?></p>
		<?php endif; ?>

		<?php if (!isset($reg_msg_class) || $reg_msg_class != "success"): ?>

		<p>Dette er en tjeneste for beboere ved Blindern Studenterhjem. Har du øvrige spørsmål ta kontakt med <a href="http://blindern-studenterhjem.no/administrasjonen">hjemmets administrasjon</a>.</p>

		<p style="color: #FF0000">Opplysningene du oppgir, med unntak av passord, vil bli gjort kjent for andre brukere.</p>
		<p>Du vil kunne bruke dette brukernavnet og passordet til å logge inn på forskjellige tjenester på BS (som f.eks. printeren i biblionette, wikien og Blindernåret).</p>

		{{ Form::open(array("class" => "form-horizontal", "role" => "form", "method" => "post", "autocomplete" => "off")) }}

			<div class="form-group">
				<label for="regform_username" class="col-lg-4 control-label">Brukernavn</label>
				<div class="col-lg-8">
					{{ Form::text('username', '', array("placeholder" => "Brukernavn", "class" => "form-control", "id" => "regform_username")) }}
					<span class="help-block">(<b>Små bokstaver</b>, uten mellomrom, bruk gjerne UiO-brukernavn evt. fornavn med to bokstaver fra etternavn)</span>
				</div>
			</div>

			<div class="form-group">
				<label for="regform_fornavn" class="col-lg-4 control-label">Fullt navn</label>
				<div class="col-lg-4">
					{{ Form::text('fornavn', '', array("placeholder" => "Fornavn", "class" => "form-control", "id" => "regform_fornavn")) }}
				</div>
				<div class="col-lg-4">
					{{ Form::text('etternavn', '', array("placeholder" => "Etternavn", "class" => "form-control", "id" => "regform_etternavn")) }}
				</div>
			</div>

			<div class="form-group">
				<label for="regform_email" class="col-lg-4 control-label">E-post</label>
				<div class="col-lg-8">
					{{ Form::text('email', '', array("placeholder" => "E-postadresse", "class" => "form-control", "id" => "regform_email")) }}
				</div>
			</div>

			<div class="form-group">
				<label for="regform_phone" class="col-lg-4 control-label">Mobil (valgfritt)</label>
				<div class="col-lg-8">
					{{ Form::text('phone', '', array("placeholder" => "Mobilnummer (valgfritt)", "class" => "form-control", "id" => "regform_phone")) }}
				</div>
			</div>

			<div class="form-group">
				<label for="regform_pw" class="col-lg-4 control-label">Passord</label>
				<div class="col-lg-8">
					{{ Form::password('password', array("placeholder" => "Passord", "class" => "form-control", "id" => "regform_pw")) }}
					<span class="help-block">(Minst 8 tegn. Passordet overføres kryptert og blir lagret uten mulighet for å lese passordet.)</span>
				</div>
			</div>

			<div class="form-group">
				<div class="col-lg-offset-4 col-lg-8">
					<label for="internmail">
						<input type="checkbox" name="internmail" id="internmail" />
						Legg meg samtidig til på internmailen
					</label>
				</div>
			</div>

			<div class="form-group">
				<div class="col-lg-offset-4 col-lg-8">
					{{ Form::submit('Registrer', array("class" => "btn btn-default")) }}
					<span class="help-block">Du vil bli lagt til manuelt, så noe ventetid må påregnes.</span>
				</div>
			</div>
			
		{{ Form::close() }}
		<?php endif; ?>

	</div>

</div>

@stop
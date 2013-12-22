<?php

class PrinterController extends Controller {
	public function action_last()
	{
		// hent siste utskrifter fra printserveren
		$last = @json_decode(@file_get_contents("https://p.blindern-studenterhjem.no/api.php?method=pykotalast"), true);

		return View::make("printer/last", array("prints" => $last));
	}
}
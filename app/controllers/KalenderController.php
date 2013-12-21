<?php

class KalenderController extends BaseController {
	public function index() {
		return View::make("kalender/index");
	}
}
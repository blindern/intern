<?php namespace App\Http\Controllers;

class JsController extends Controller {
	/**
	 * Pass the js-view
	 */
	public function index() {
		return \View::make("layout");
	}
}
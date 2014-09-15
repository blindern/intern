<?php

class JsController extends BaseController {
	/**
	 * Pass the js-view
	 */
	public function index() {
		return View::make("layout");
	}
}
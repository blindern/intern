<?php

class HappeningSeeder extends Seeder {
	public function run()
	{
		$h = new Happening();
		$h->title = 'Juleverksted';
		$h->by = 'Pigefaarsamlingen';
		$h->place = 'Peisestua';
		$h->start = '2013-12-01';
		$h->end = '2013-12-01';
		$h->save();

		$h = new Happening();
		$h->title = 'Spillkveld';
		$h->by = 'BSG';
		$h->place = 'Peisestua';
		$h->start = '2013-12-05';
		$h->end = '2013-12-05';
		$h->save();

		$h = new Happening();
		$h->title = 'Julemøte';
		$h->by = 'Festforeningen';
		$h->place = 'Spisesalen/peisestua';
		$h->start = '2013-12-06';
		$h->end = '2013-12-06';
		$h->save();

		$h = new Happening();
		$h->title = 'Nyttårsfeiring på Småbruket';
		$h->by = 'Hyttestyret';
		$h->place = 'Småbruket';
		$h->start = '2013-12-30';
		$h->end = '2014-01-03';
		$h->save();
	}
}
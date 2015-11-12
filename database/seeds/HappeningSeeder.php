<?php

class HappeningSeeder extends Seeder {
	public function run()
	{
		Happening::truncate();
		date_default_timezone_set("Europe/Oslo");

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
		$h->end = '2014-01-02';
		$h->save();

		$h = new Happening();
		$h->title = 'Uoffisiell velkommen hjem-fest';
		$h->by = 'Festforeningen';
		$h->place = 'Billa';
		$h->start = '2014-01-08';
		$h->end = '2014-01-08';
		$h->save();

		$h = new Happening();
		$h->title = 'Offisiell velkommen hjem-fest';
		$h->by = 'Festforeningen';
		$h->place = 'Billa';
		$h->start = '2014-01-11';
		$h->end = '2014-01-11';
		$h->save();

		$h = new Happening();
		$h->title = 'Onsdagsbilla';
		$h->by = 'Festforeningen';
		$h->place = 'Billa';
		$h->allday = false;
		$h->start = new \DateTime('2014-01-15 21:00');
		$h->end = new \DateTime('2014-01-16 01:00');
		$h->frequency = 'WEEKLY';
		$h->count = 18;
		$h->save();
	}
}
<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class GoogleappsAccountusers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('googleapps_accountusers', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamps();
            $table->unique(['account_id', 'username']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('googleapps_accountusers');
    }
}

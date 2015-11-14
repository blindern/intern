<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateHappeningsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create("happenings", function (Blueprint $table) {
            $table->increments("id");
            $table->string("title", 150);
            $table->dateTime("start");
            $table->dateTime("end");
            $table->boolean("allday")->default(true);
            $table->text("info")->nullable();
            $table->string("by", 100)->nullable();
            $table->string("place", 100)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop("happenings");
    }
}

<?php

use Illuminate\Database\Migrations\Migration;

class ExtendHappeningsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('happenings', function ($table) {
            $table->enum('frequency', array('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'))->nullable();
            $table->smallInteger('interval')->default(1);
            $table->smallInteger('count')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('happenings', function ($table) {
            $table->dropColumn('frequency');
            $table->dropColumn('interval');
            $table->dropColumn('count');
        });
    }
}

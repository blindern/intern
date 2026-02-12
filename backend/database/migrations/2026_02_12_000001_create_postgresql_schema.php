<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->jsonb('authors')->nullable();
            $table->string('pubdate')->nullable();
            $table->text('description')->nullable();
            $table->string('isbn')->nullable();
            $table->jsonb('isbn_data')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('bib_barcode')->nullable();
            $table->string('bib_comment')->nullable();
            $table->string('bib_room')->nullable();
            $table->string('bib_section')->nullable();
            $table->timestampsTz(3);
        });

        Schema::create('bukker', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('died')->nullable();
            $table->string('comment')->nullable();
            $table->jsonb('awards')->nullable();
            $table->timestampsTz(3);
        });

        Schema::create('matmeny', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->date('day')->unique();
            $table->text('text')->nullable();
            $table->jsonb('dishes')->nullable();
            $table->timestampsTz(3);
        });

        Schema::create('googleapps_accounts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('accountname');
            $table->string('group')->nullable();
            $table->jsonb('aliases')->nullable();
            $table->timestampsTz(3);
            $table->softDeletesTz('deleted_at', 3);
        });

        Schema::create('googleapps_accountusers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('account_id');
            $table->string('username');
            $table->boolean('notification')->default(false);
            $table->timestampsTz(3);
            $table->softDeletesTz('deleted_at', 3);

            $table->foreign('account_id')->references('id')->on('googleapps_accounts')->cascadeOnDelete();
        });

        // Partial unique index to allow soft-deleted duplicates
        DB::statement('CREATE UNIQUE INDEX googleapps_accountusers_account_username_unique ON googleapps_accountusers (account_id, username) WHERE deleted_at IS NULL');

        Schema::create('users', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('username')->unique();
            $table->rememberToken();
            $table->timestampsTz(3);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('googleapps_accountusers');
        Schema::dropIfExists('googleapps_accounts');
        Schema::dropIfExists('users');
        Schema::dropIfExists('matmeny');
        Schema::dropIfExists('bukker');
        Schema::dropIfExists('books');
    }
};

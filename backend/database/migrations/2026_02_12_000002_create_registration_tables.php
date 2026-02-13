<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_requests', function (Blueprint $table) {
            $table->string('id', 24)->primary();
            $table->string('username');
            $table->string('firstname');
            $table->string('lastname');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('password_hash');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->string('group_name')->nullable();
            $table->string('processed_by')->nullable();
            $table->timestampTz('processed_at', 3)->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestampsTz(3);
        });

        // Prevent duplicate pending requests for same username or email
        DB::statement("CREATE UNIQUE INDEX registration_requests_username_pending ON registration_requests (username) WHERE status = 'pending'");
        DB::statement("CREATE UNIQUE INDEX registration_requests_email_pending ON registration_requests (email) WHERE status = 'pending'");

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('id', 24)->primary();
            $table->string('token_hash')->unique();
            $table->string('username');
            $table->string('email');
            $table->timestampTz('expires_at', 3);
            $table->boolean('used')->default(false);
            $table->timestampsTz(3);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('registration_requests');
    }
};

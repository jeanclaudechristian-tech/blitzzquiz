<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ===========================
        // USERS
        // ===========================
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Basic info
            $table->string('email')->unique();
            $table->string('password');
            $table->string('nickname', 50);

            // Role
            $table->enum('role', ['STUDENT', 'TEACHER', 'ADMIN'])
                  ->default('STUDENT');

            // Avatar
            $table->string('avatar')->nullable();

            // Social login
            $table->string('google_id')->unique()->nullable();
            $table->string('apple_id')->unique()->nullable();

            $table->timestamps();
        });


        DB::statement("
            ALTER TABLE users
            ADD CONSTRAINT users_login_method_check
            CHECK (
                email IS NOT NULL
                OR google_id IS NOT NULL
                OR apple_id IS NOT NULL
            )
        ");

        // ===========================
        // PASSWORD RESET TOKENS
        // ===========================
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // ===========================
        // SESSIONS
        // ===========================
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};

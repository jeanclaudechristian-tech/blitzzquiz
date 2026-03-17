<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('type'); // 'scolaire' ou 'professionnel'
            $table->timestamps();
        });

        $categories = [
            ['name' => 'Math', 'type' => 'scolaire'],
            ['name' => 'Français', 'type' => 'scolaire'],
            ['name' => 'Sciences', 'type' => 'scolaire'],
            ['name' => 'Histoire', 'type' => 'scolaire'],
            ['name' => 'Sport', 'type' => 'scolaire'],
            ['name' => 'Trivia', 'type' => 'scolaire'],
            ['name' => 'Art', 'type' => 'scolaire'],
            ['name' => 'Technologie Info.', 'type' => 'professionnel'],
            ['name' => 'Santé', 'type' => 'professionnel'],
            ['name' => 'Légal', 'type' => 'professionnel'],
            ['name' => 'Construction', 'type' => 'professionnel'],
            ['name' => 'Ingénieur', 'type' => 'professionnel'],
            ['name' => 'Scientifique', 'type' => 'professionnel'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->insert(array_merge($cat, ['created_at' => now(), 'updated_at' => now()]));
        }
    }

    public function down(): void { Schema::dropIfExists('categories'); }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->foreignId('category_id')->after('description')->nullable()->constrained('categories')->onDelete('set null');
            $table->unsignedInteger('plays_count')->after('is_public')->default(0);
        });

        // Migration des données (Lien par nom)
        $quizzes = DB::table('quizzes')->get();
        foreach ($quizzes as $quiz) {
            if (!empty($quiz->category)) {
                $cat = DB::table('categories')->where('name', $quiz->category)->first();
                if ($cat) DB::table('quizzes')->where('id', $quiz->id)->update(['category_id' => $cat->id]);
            }
        }

        // 🎯 MISE À JOUR DU MOTEUR DE RECHERCHE (Trigger SQL)
        // On modifie la fonction pour qu'elle n'utilise plus NEW.category (qui va être supprimée)
        DB::statement("
            CREATE OR REPLACE FUNCTION update_quiz_search_vector()
            RETURNS trigger AS \$\$
            DECLARE
                cat_name TEXT;
            BEGIN
                -- On récupère le nom de la catégorie via l'ID pour l'indexer
                SELECT name INTO cat_name FROM categories WHERE id = NEW.category_id;
                
                NEW.search_vector :=
                    setweight(to_tsvector('french', coalesce(NEW.titre, '')), 'A') ||
                    setweight(to_tsvector('french', coalesce(cat_name, '')), 'B') ||
                    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'C');
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql
        ");

        // Enfin, on supprime l'ancienne colonne
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }

    public function down(): void {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->string('category')->nullable();
            $table->dropConstrainedForeignId('category_id');
            $table->dropColumn('plays_count');
        });
    }
};
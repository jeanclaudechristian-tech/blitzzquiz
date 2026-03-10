<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE quizzes ADD COLUMN search_vector tsvector");

        DB::statement("
            UPDATE quizzes SET search_vector =
                setweight(to_tsvector('french', coalesce(titre, '')), 'A') ||
                setweight(to_tsvector('french', coalesce(category, '')), 'B') ||
                setweight(to_tsvector('french', coalesce(description, '')), 'C')
        ");

        DB::statement("CREATE INDEX quizzes_search_idx ON quizzes USING GIN(search_vector)");

        DB::statement("
            CREATE OR REPLACE FUNCTION update_quiz_search_vector()
            RETURNS trigger AS \$\$
            BEGIN
                NEW.search_vector :=
                    setweight(to_tsvector('french', coalesce(NEW.titre, '')), 'A') ||
                    setweight(to_tsvector('french', coalesce(NEW.category, '')), 'B') ||
                    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'C');
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql
        ");

        DB::statement("
            CREATE TRIGGER quiz_search_vector_trigger
            BEFORE INSERT OR UPDATE ON quizzes
            FOR EACH ROW EXECUTE FUNCTION update_quiz_search_vector()
        ");
    }

    public function down(): void
    {
        DB::statement("DROP TRIGGER IF EXISTS quiz_search_vector_trigger ON quizzes");
        DB::statement("DROP FUNCTION IF EXISTS update_quiz_search_vector");
        DB::statement("DROP INDEX IF EXISTS quizzes_search_idx");
        DB::statement("ALTER TABLE quizzes DROP COLUMN IF EXISTS search_vector");
    }
};
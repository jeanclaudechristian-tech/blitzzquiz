-- Reset de la base en conservant les comptes protégés (ex: superadmin + admin principal)
-- Compatible PostgreSQL / Supabase
--
-- Usage:
-- 1) Ajuste v_keep_user_emails et/ou v_keep_user_ids ci-dessous.
-- 2) Exécute le script en une seule fois.
-- 3) Vérifie les SELECT de fin.

BEGIN;

DO $$
DECLARE
    -- Comptes à conserver par email (ajoute/enlève ce que tu veux garder)
    v_keep_user_emails TEXT[] := ARRAY[
        'superadmin@blitzzquiz.com',
        'masterg78zsy@gmail.com'
    ];

    -- Comptes à conserver par id (optionnel)
    v_keep_user_ids BIGINT[] := ARRAY[]::BIGINT[];

    v_kept_count INTEGER;
BEGIN
    CREATE TEMP TABLE tmp_keep_users (
        id BIGINT PRIMARY KEY
    ) ON COMMIT DROP;

    -- Conserver par emails
    INSERT INTO tmp_keep_users (id)
    SELECT DISTINCT u.id
    FROM users u
    JOIN unnest(v_keep_user_emails) AS e(email)
      ON lower(u.email) = lower(e.email)
    WHERE u.email IS NOT NULL;

    -- Conserver par ids
    INSERT INTO tmp_keep_users (id)
    SELECT DISTINCT u.id
    FROM users u
    JOIN unnest(v_keep_user_ids) AS i(id)
      ON u.id = i.id
    ON CONFLICT (id) DO NOTHING;

    SELECT COUNT(*) INTO v_kept_count FROM tmp_keep_users;
    IF v_kept_count = 0 THEN
        RAISE EXCEPTION 'Aucun compte protégé trouvé. Vérifie v_keep_user_emails / v_keep_user_ids.';
    END IF;

    -- 1) Données métier reliées aux users/quizzes/groups
    --    (ordre sûr même avec FK)
    TRUNCATE TABLE
        results,
        assignments,
        user_groups,
        questions,
        quizzes,
        groups
    RESTART IDENTITY CASCADE;

    -- 2) Nettoyage des artefacts de session/tokens
    DELETE FROM personal_access_tokens
    WHERE tokenable_type = 'App\\Models\\User'
      AND tokenable_id NOT IN (SELECT id FROM tmp_keep_users);

    DELETE FROM sessions
    WHERE user_id IS NOT NULL
      AND user_id NOT IN (SELECT id FROM tmp_keep_users);

    DELETE FROM password_reset_tokens
    WHERE email IN (
        SELECT email
        FROM users
        WHERE id NOT IN (SELECT id FROM tmp_keep_users)
          AND email IS NOT NULL
    );

    -- 3) Nettoyage users: on garde uniquement les comptes protégés
    DELETE FROM users
    WHERE id NOT IN (SELECT id FROM tmp_keep_users);
END $$;

COMMIT;

-- Vérifications
SELECT id, email, nickname, role, is_disabled
FROM users
ORDER BY id;

SELECT
  (SELECT COUNT(*) FROM users) AS users_count,
  (SELECT COUNT(*) FROM quizzes) AS quizzes_count,
  (SELECT COUNT(*) FROM questions) AS questions_count,
  (SELECT COUNT(*) FROM groups) AS groups_count,
  (SELECT COUNT(*) FROM user_groups) AS user_groups_count,
  (SELECT COUNT(*) FROM assignments) AS assignments_count,
  (SELECT COUNT(*) FROM results) AS results_count;

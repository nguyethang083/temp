create schema if not exists "next_auth";

create table "next_auth"."accounts" (
    "id" uuid not null default gen_random_uuid(),
    "type" text not null,
    "provider" text not null,
    "providerAccountId" text not null,
    "refresh_token" text,
    "access_token" text,
    "expires_at" bigint,
    "token_type" text,
    "scope" text,
    "id_token" text,
    "session_state" text,
    "oauth_token_secret" text,
    "oauth_token" text,
    "userId" uuid
);


create table "next_auth"."sessions" (
    "id" uuid not null default gen_random_uuid(),
    "expires" timestamp with time zone not null,
    "sessionToken" text not null,
    "userId" uuid
);


create table "next_auth"."users" (
    "id" uuid not null default gen_random_uuid(),
    "name" text,
    "email" text,
    "emailVerified" timestamp with time zone,
    "image" text
);


create table "next_auth"."verification_tokens" (
    "identifier" text,
    "token" text not null,
    "expires" timestamp with time zone not null
);


CREATE UNIQUE INDEX accounts_pkey ON next_auth.accounts USING btree (id);

CREATE UNIQUE INDEX email_unique ON next_auth.users USING btree (email);

CREATE UNIQUE INDEX provider_unique ON next_auth.accounts USING btree (provider, "providerAccountId");

CREATE UNIQUE INDEX sessions_pkey ON next_auth.sessions USING btree (id);

CREATE UNIQUE INDEX sessiontoken_unique ON next_auth.sessions USING btree ("sessionToken");

CREATE UNIQUE INDEX token_identifier_unique ON next_auth.verification_tokens USING btree (token, identifier);

CREATE UNIQUE INDEX users_pkey ON next_auth.users USING btree (id);

CREATE UNIQUE INDEX verification_tokens_pkey ON next_auth.verification_tokens USING btree (token);

alter table "next_auth"."accounts" add constraint "accounts_pkey" PRIMARY KEY using index "accounts_pkey";

alter table "next_auth"."sessions" add constraint "sessions_pkey" PRIMARY KEY using index "sessions_pkey";

alter table "next_auth"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "next_auth"."verification_tokens" add constraint "verification_tokens_pkey" PRIMARY KEY using index "verification_tokens_pkey";

alter table "next_auth"."accounts" add constraint "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES next_auth.users(id) ON DELETE CASCADE not valid;

alter table "next_auth"."accounts" validate constraint "accounts_userId_fkey";

alter table "next_auth"."accounts" add constraint "provider_unique" UNIQUE using index "provider_unique";

alter table "next_auth"."sessions" add constraint "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES next_auth.users(id) ON DELETE CASCADE not valid;

alter table "next_auth"."sessions" validate constraint "sessions_userId_fkey";

alter table "next_auth"."sessions" add constraint "sessiontoken_unique" UNIQUE using index "sessiontoken_unique";

alter table "next_auth"."users" add constraint "email_unique" UNIQUE using index "email_unique";

alter table "next_auth"."verification_tokens" add constraint "token_identifier_unique" UNIQUE using index "token_identifier_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION next_auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select
    coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
$function$
;

grant delete on table "next_auth"."accounts" to "service_role";

grant insert on table "next_auth"."accounts" to "service_role";

grant references on table "next_auth"."accounts" to "service_role";

grant select on table "next_auth"."accounts" to "service_role";

grant trigger on table "next_auth"."accounts" to "service_role";

grant truncate on table "next_auth"."accounts" to "service_role";

grant update on table "next_auth"."accounts" to "service_role";

grant delete on table "next_auth"."sessions" to "service_role";

grant insert on table "next_auth"."sessions" to "service_role";

grant references on table "next_auth"."sessions" to "service_role";

grant select on table "next_auth"."sessions" to "service_role";

grant trigger on table "next_auth"."sessions" to "service_role";

grant truncate on table "next_auth"."sessions" to "service_role";

grant update on table "next_auth"."sessions" to "service_role";

grant delete on table "next_auth"."users" to "service_role";

grant insert on table "next_auth"."users" to "service_role";

grant references on table "next_auth"."users" to "service_role";

grant select on table "next_auth"."users" to "service_role";

grant trigger on table "next_auth"."users" to "service_role";

grant truncate on table "next_auth"."users" to "service_role";

grant update on table "next_auth"."users" to "service_role";

grant delete on table "next_auth"."verification_tokens" to "service_role";

grant insert on table "next_auth"."verification_tokens" to "service_role";

grant references on table "next_auth"."verification_tokens" to "service_role";

grant select on table "next_auth"."verification_tokens" to "service_role";

grant trigger on table "next_auth"."verification_tokens" to "service_role";

grant truncate on table "next_auth"."verification_tokens" to "service_role";

grant update on table "next_auth"."verification_tokens" to "service_role";


create type "public"."attempt_status_enum" as enum ('in_progress', 'completed', 'timed_out', 'graded');

create type "public"."question_difficulty_enum" as enum ('TH', 'VD', 'VDC');

create type "public"."question_type_enum" as enum ('multiple_choice', 'self_write', 'essay');

create type "public"."test_type_enum" as enum ('Exam', 'Practice', 'Assessment');

create table "public"."attempt_answers" (
    "id" uuid not null default uuid_generate_v4(),
    "attempt_id" uuid not null,
    "test_question_id" uuid not null,
    "user_answer" text,
    "is_correct" boolean,
    "points_awarded" integer,
    "submitted_at" timestamp with time zone default now(),
    "answer_sequence" integer,
    "time_spent_seconds" integer
);


alter table "public"."attempt_answers" enable row level security;

create table "public"."questions" (
    "id" uuid not null default uuid_generate_v4(),
    "content" text not null,
    "image_url" text,
    "question_type" question_type_enum not null,
    "options" jsonb,
    "correct_answer" text not null,
    "explanation" text,
    "hint" text,
    "difficulty_level" question_difficulty_enum,
    "topic_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid
);


alter table "public"."questions" enable row level security;

create table "public"."test_attempts" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "test_id" uuid not null,
    "start_time" timestamp with time zone not null default now(),
    "end_time" timestamp with time zone,
    "score" integer,
    "status" attempt_status_enum not null default 'in_progress'::attempt_status_enum,
    "passed" boolean,
    "created_at" timestamp with time zone default now(),
    "last_viewed_test_question_id" uuid,
    "remaining_time_seconds" integer
);


alter table "public"."test_attempts" enable row level security;

create table "public"."test_questions" (
    "id" uuid not null default uuid_generate_v4(),
    "test_id" uuid not null,
    "question_id" uuid not null,
    "point_value" integer not null default 1,
    "question_order" integer
);


alter table "public"."test_questions" enable row level security;

create table "public"."tests" (
    "id" uuid not null default uuid_generate_v4(),
    "title" text not null,
    "instructions" text,
    "topic_id" uuid,
    "grade_level" text,
    "difficulty" text,
    "test_type" test_type_enum not null default 'Practice'::test_type_enum,
    "time_limit_minutes" integer,
    "passing_score" integer,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "created_by" uuid
);


alter table "public"."tests" enable row level security;

create table "public"."topics" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "grade_level" text not null,
    "description" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "order" smallint
);


alter table "public"."topics" enable row level security;

CREATE UNIQUE INDEX attempt_answers_pkey ON public.attempt_answers USING btree (id);

CREATE INDEX idx_attempt_answers_attempt ON public.attempt_answers USING btree (attempt_id);

CREATE INDEX idx_attempt_answers_test_question ON public.attempt_answers USING btree (test_question_id);

CREATE INDEX idx_questions_created_by ON public.questions USING btree (created_by);

CREATE INDEX idx_questions_difficulty ON public.questions USING btree (difficulty_level);

CREATE INDEX idx_questions_question_type ON public.questions USING btree (question_type);

CREATE INDEX idx_questions_topic_id ON public.questions USING btree (topic_id);

CREATE INDEX idx_test_attempts_last_viewed ON public.test_attempts USING btree (last_viewed_test_question_id);

CREATE INDEX idx_test_attempts_status ON public.test_attempts USING btree (status);

CREATE INDEX idx_test_attempts_test ON public.test_attempts USING btree (test_id);

CREATE INDEX idx_test_attempts_user ON public.test_attempts USING btree (user_id);

CREATE INDEX idx_test_attempts_user_test ON public.test_attempts USING btree (user_id, test_id);

CREATE INDEX idx_test_questions_question_id ON public.test_questions USING btree (question_id);

CREATE INDEX idx_test_questions_test_id ON public.test_questions USING btree (test_id);

CREATE INDEX idx_tests_created_by ON public.tests USING btree (created_by);

CREATE INDEX idx_tests_grade_level ON public.tests USING btree (grade_level);

CREATE INDEX idx_tests_is_active ON public.tests USING btree (is_active);

CREATE INDEX idx_tests_test_type ON public.tests USING btree (test_type);

CREATE INDEX idx_tests_topic_id ON public.tests USING btree (topic_id);

CREATE INDEX idx_topics_grade_level ON public.topics USING btree (grade_level);

CREATE INDEX idx_topics_is_active ON public.topics USING btree (is_active);

CREATE INDEX idx_topics_name ON public.topics USING btree (name);

CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (id);

CREATE UNIQUE INDEX test_attempts_pkey ON public.test_attempts USING btree (id);

CREATE UNIQUE INDEX test_questions_pkey ON public.test_questions USING btree (id);

CREATE UNIQUE INDEX test_questions_test_id_question_id_key ON public.test_questions USING btree (test_id, question_id);

CREATE UNIQUE INDEX tests_pkey ON public.tests USING btree (id);

CREATE UNIQUE INDEX topics_name_key ON public.topics USING btree (name);

CREATE UNIQUE INDEX topics_pkey ON public.topics USING btree (id);

CREATE UNIQUE INDEX unique_attempt_test_question ON public.attempt_answers USING btree (attempt_id, test_question_id);

alter table "public"."attempt_answers" add constraint "attempt_answers_pkey" PRIMARY KEY using index "attempt_answers_pkey";

alter table "public"."questions" add constraint "questions_pkey" PRIMARY KEY using index "questions_pkey";

alter table "public"."test_attempts" add constraint "test_attempts_pkey" PRIMARY KEY using index "test_attempts_pkey";

alter table "public"."test_questions" add constraint "test_questions_pkey" PRIMARY KEY using index "test_questions_pkey";

alter table "public"."tests" add constraint "tests_pkey" PRIMARY KEY using index "tests_pkey";

alter table "public"."topics" add constraint "topics_pkey" PRIMARY KEY using index "topics_pkey";

alter table "public"."attempt_answers" add constraint "attempt_answers_attempt_id_fkey" FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE not valid;

alter table "public"."attempt_answers" validate constraint "attempt_answers_attempt_id_fkey";

alter table "public"."attempt_answers" add constraint "attempt_answers_test_question_id_fkey" FOREIGN KEY (test_question_id) REFERENCES test_questions(id) ON DELETE CASCADE not valid;

alter table "public"."attempt_answers" validate constraint "attempt_answers_test_question_id_fkey";

alter table "public"."attempt_answers" add constraint "unique_attempt_test_question" UNIQUE using index "unique_attempt_test_question";

alter table "public"."questions" add constraint "questions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."questions" validate constraint "questions_created_by_fkey";

alter table "public"."questions" add constraint "questions_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL not valid;

alter table "public"."questions" validate constraint "questions_topic_id_fkey";

alter table "public"."test_attempts" add constraint "test_attempts_last_viewed_test_question_id_fkey" FOREIGN KEY (last_viewed_test_question_id) REFERENCES test_questions(id) ON DELETE SET NULL not valid;

alter table "public"."test_attempts" validate constraint "test_attempts_last_viewed_test_question_id_fkey";

alter table "public"."test_attempts" add constraint "test_attempts_remaining_time_seconds_check" CHECK (((remaining_time_seconds IS NULL) OR (remaining_time_seconds >= 0))) not valid;

alter table "public"."test_attempts" validate constraint "test_attempts_remaining_time_seconds_check";

alter table "public"."test_attempts" add constraint "test_attempts_test_id_fkey" FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE not valid;

alter table "public"."test_attempts" validate constraint "test_attempts_test_id_fkey";

alter table "public"."test_attempts" add constraint "test_attempts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."test_attempts" validate constraint "test_attempts_user_id_fkey";

alter table "public"."test_questions" add constraint "test_questions_point_value_check" CHECK ((point_value >= 0)) not valid;

alter table "public"."test_questions" validate constraint "test_questions_point_value_check";

alter table "public"."test_questions" add constraint "test_questions_question_id_fkey" FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE not valid;

alter table "public"."test_questions" validate constraint "test_questions_question_id_fkey";

alter table "public"."test_questions" add constraint "test_questions_test_id_fkey" FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE not valid;

alter table "public"."test_questions" validate constraint "test_questions_test_id_fkey";

alter table "public"."test_questions" add constraint "test_questions_test_id_question_id_key" UNIQUE using index "test_questions_test_id_question_id_key";

alter table "public"."tests" add constraint "tests_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."tests" validate constraint "tests_created_by_fkey";

alter table "public"."tests" add constraint "tests_passing_score_check" CHECK (((passing_score IS NULL) OR (passing_score >= 0))) not valid;

alter table "public"."tests" validate constraint "tests_passing_score_check";

alter table "public"."tests" add constraint "tests_time_limit_minutes_check" CHECK (((time_limit_minutes IS NULL) OR (time_limit_minutes > 0))) not valid;

alter table "public"."tests" validate constraint "tests_time_limit_minutes_check";

alter table "public"."tests" add constraint "tests_topic_id_fkey" FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL not valid;

alter table "public"."tests" validate constraint "tests_topic_id_fkey";

alter table "public"."topics" add constraint "topics_name_key" UNIQUE using index "topics_name_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."attempt_answers" to "anon";

grant insert on table "public"."attempt_answers" to "anon";

grant references on table "public"."attempt_answers" to "anon";

grant select on table "public"."attempt_answers" to "anon";

grant trigger on table "public"."attempt_answers" to "anon";

grant truncate on table "public"."attempt_answers" to "anon";

grant update on table "public"."attempt_answers" to "anon";

grant delete on table "public"."attempt_answers" to "authenticated";

grant insert on table "public"."attempt_answers" to "authenticated";

grant references on table "public"."attempt_answers" to "authenticated";

grant select on table "public"."attempt_answers" to "authenticated";

grant trigger on table "public"."attempt_answers" to "authenticated";

grant truncate on table "public"."attempt_answers" to "authenticated";

grant update on table "public"."attempt_answers" to "authenticated";

grant delete on table "public"."attempt_answers" to "service_role";

grant insert on table "public"."attempt_answers" to "service_role";

grant references on table "public"."attempt_answers" to "service_role";

grant select on table "public"."attempt_answers" to "service_role";

grant trigger on table "public"."attempt_answers" to "service_role";

grant truncate on table "public"."attempt_answers" to "service_role";

grant update on table "public"."attempt_answers" to "service_role";

grant delete on table "public"."questions" to "anon";

grant insert on table "public"."questions" to "anon";

grant references on table "public"."questions" to "anon";

grant select on table "public"."questions" to "anon";

grant trigger on table "public"."questions" to "anon";

grant truncate on table "public"."questions" to "anon";

grant update on table "public"."questions" to "anon";

grant delete on table "public"."questions" to "authenticated";

grant insert on table "public"."questions" to "authenticated";

grant references on table "public"."questions" to "authenticated";

grant select on table "public"."questions" to "authenticated";

grant trigger on table "public"."questions" to "authenticated";

grant truncate on table "public"."questions" to "authenticated";

grant update on table "public"."questions" to "authenticated";

grant delete on table "public"."questions" to "service_role";

grant insert on table "public"."questions" to "service_role";

grant references on table "public"."questions" to "service_role";

grant select on table "public"."questions" to "service_role";

grant trigger on table "public"."questions" to "service_role";

grant truncate on table "public"."questions" to "service_role";

grant update on table "public"."questions" to "service_role";

grant delete on table "public"."test_attempts" to "anon";

grant insert on table "public"."test_attempts" to "anon";

grant references on table "public"."test_attempts" to "anon";

grant select on table "public"."test_attempts" to "anon";

grant trigger on table "public"."test_attempts" to "anon";

grant truncate on table "public"."test_attempts" to "anon";

grant update on table "public"."test_attempts" to "anon";

grant delete on table "public"."test_attempts" to "authenticated";

grant insert on table "public"."test_attempts" to "authenticated";

grant references on table "public"."test_attempts" to "authenticated";

grant select on table "public"."test_attempts" to "authenticated";

grant trigger on table "public"."test_attempts" to "authenticated";

grant truncate on table "public"."test_attempts" to "authenticated";

grant update on table "public"."test_attempts" to "authenticated";

grant delete on table "public"."test_attempts" to "service_role";

grant insert on table "public"."test_attempts" to "service_role";

grant references on table "public"."test_attempts" to "service_role";

grant select on table "public"."test_attempts" to "service_role";

grant trigger on table "public"."test_attempts" to "service_role";

grant truncate on table "public"."test_attempts" to "service_role";

grant update on table "public"."test_attempts" to "service_role";

grant delete on table "public"."test_questions" to "anon";

grant insert on table "public"."test_questions" to "anon";

grant references on table "public"."test_questions" to "anon";

grant select on table "public"."test_questions" to "anon";

grant trigger on table "public"."test_questions" to "anon";

grant truncate on table "public"."test_questions" to "anon";

grant update on table "public"."test_questions" to "anon";

grant delete on table "public"."test_questions" to "authenticated";

grant insert on table "public"."test_questions" to "authenticated";

grant references on table "public"."test_questions" to "authenticated";

grant select on table "public"."test_questions" to "authenticated";

grant trigger on table "public"."test_questions" to "authenticated";

grant truncate on table "public"."test_questions" to "authenticated";

grant update on table "public"."test_questions" to "authenticated";

grant delete on table "public"."test_questions" to "service_role";

grant insert on table "public"."test_questions" to "service_role";

grant references on table "public"."test_questions" to "service_role";

grant select on table "public"."test_questions" to "service_role";

grant trigger on table "public"."test_questions" to "service_role";

grant truncate on table "public"."test_questions" to "service_role";

grant update on table "public"."test_questions" to "service_role";

grant delete on table "public"."tests" to "anon";

grant insert on table "public"."tests" to "anon";

grant references on table "public"."tests" to "anon";

grant select on table "public"."tests" to "anon";

grant trigger on table "public"."tests" to "anon";

grant truncate on table "public"."tests" to "anon";

grant update on table "public"."tests" to "anon";

grant delete on table "public"."tests" to "authenticated";

grant insert on table "public"."tests" to "authenticated";

grant references on table "public"."tests" to "authenticated";

grant select on table "public"."tests" to "authenticated";

grant trigger on table "public"."tests" to "authenticated";

grant truncate on table "public"."tests" to "authenticated";

grant update on table "public"."tests" to "authenticated";

grant delete on table "public"."tests" to "service_role";

grant insert on table "public"."tests" to "service_role";

grant references on table "public"."tests" to "service_role";

grant select on table "public"."tests" to "service_role";

grant trigger on table "public"."tests" to "service_role";

grant truncate on table "public"."tests" to "service_role";

grant update on table "public"."tests" to "service_role";

grant delete on table "public"."topics" to "anon";

grant insert on table "public"."topics" to "anon";

grant references on table "public"."topics" to "anon";

grant select on table "public"."topics" to "anon";

grant trigger on table "public"."topics" to "anon";

grant truncate on table "public"."topics" to "anon";

grant update on table "public"."topics" to "anon";

grant delete on table "public"."topics" to "authenticated";

grant insert on table "public"."topics" to "authenticated";

grant references on table "public"."topics" to "authenticated";

grant select on table "public"."topics" to "authenticated";

grant trigger on table "public"."topics" to "authenticated";

grant truncate on table "public"."topics" to "authenticated";

grant update on table "public"."topics" to "authenticated";

grant delete on table "public"."topics" to "service_role";

grant insert on table "public"."topics" to "service_role";

grant references on table "public"."topics" to "service_role";

grant select on table "public"."topics" to "service_role";

grant trigger on table "public"."topics" to "service_role";

grant truncate on table "public"."topics" to "service_role";

grant update on table "public"."topics" to "service_role";

create policy "Allow user to manage answers for their own attempts"
on "public"."attempt_answers"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM test_attempts
  WHERE ((test_attempts.id = attempt_answers.attempt_id) AND (test_attempts.user_id = next_auth.uid())))));


create policy "Allow authenticated users read access"
on "public"."questions"
as permissive
for select
to public
using ((next_auth.uid() IS NOT NULL));


create policy "Allow user to manage their own attempts"
on "public"."test_attempts"
as permissive
for all
to public
using ((next_auth.uid() = user_id));


create policy "Allow authenticated users read access"
on "public"."test_questions"
as permissive
for select
to public
using ((next_auth.uid() IS NOT NULL));


create policy "Allow active tests read access for authenticated users"
on "public"."tests"
as permissive
for select
to public
using (((is_active = true) AND (next_auth.uid() IS NOT NULL)));


create policy "Allow authenticated users read access"
on "public"."topics"
as permissive
for select
to public
using ((next_auth.uid() IS NOT NULL));


CREATE TRIGGER set_questions_timestamp BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_tests_timestamp BEFORE UPDATE ON public.tests FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_topics_timestamp BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();



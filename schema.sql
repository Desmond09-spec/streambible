-- Run this in your Supabase SQL Editor FIRST before running the migration script
-- Go to: https://supabase.com/dashboard/project/jtybmsqzmntglmvypkur/sql/new

CREATE TABLE IF NOT EXISTS verses (
  id          BIGSERIAL PRIMARY KEY,
  translation VARCHAR(10) NOT NULL,
  book_code   VARCHAR(5)  NOT NULL,
  chapter     SMALLINT    NOT NULL,
  verse       SMALLINT    NOT NULL,
  text        TEXT        NOT NULL,
  UNIQUE (translation, book_code, chapter, verse)
);

CREATE INDEX IF NOT EXISTS idx_verses_lookup 
  ON verses (translation, book_code, chapter, verse);

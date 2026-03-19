-- Run this in the Supabase SQL Editor to set up your database

-- Players table
create table if not exists players (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  email text unique,
  password text not null,
  is_commissioner boolean default false,
  created_at timestamp with time zone default now()
);

-- Picks table (one row per player per sport)
create table if not exists picks (
  id uuid default gen_random_uuid() primary key,
  username text not null references players(username) on delete cascade,
  sport text not null,
  picks jsonb default '{}',
  updated_at timestamp with time zone default now(),
  unique(username, sport)
);

-- Results table (one row per game)
create table if not exists results (
  id uuid default gen_random_uuid() primary key,
  game_id text unique not null,
  winner text,
  updated_at timestamp with time zone default now()
);

-- Events table (pick deadlines and event management)
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  sport_id text not null,
  description text,
  deadline timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Disable Row Level Security (simple setup for private group)
alter table players disable row level security;
alter table picks disable row level security;
alter table results disable row level security;
alter table events disable row level security;

-- Insert the commissioner account
-- IMPORTANT: Change the email and password below before running!
insert into players (username, email, password, is_commissioner)
values ('Marcin', 'marcin.rojek@gmail.com', 'dodeca2025', true)
on conflict (username) do nothing;

-- Bracker v2 database schema

-- Profiles: extends Supabase Auth users
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  api_key uuid unique not null default gen_random_uuid(),
  total_xp bigint not null default 0,
  total_builds bigint not null default 0,
  total_posts bigint not null default 0,
  total_tokens bigint not null default 0,
  current_streak int not null default 0,
  last_build_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Builds: one row per build event
create table public.builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  repo text,
  diff_summary text,
  conversation_summary text,
  tokens_used int default 0,
  commit_message text,
  lines_changed int default 0,
  xp_earned int not null default 0,
  streak int not null default 0,
  created_at timestamptz not null default now()
);

-- Posts: one row per social media post
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  platform text not null default 'twitter',
  content text,
  xp_earned int not null default 50,
  created_at timestamptz not null default now()
);

-- Indexes
create index builds_user_id_idx on public.builds(user_id);
create index builds_created_at_idx on public.builds(created_at desc);
create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index profiles_username_idx on public.profiles(username);
create index profiles_api_key_idx on public.profiles(api_key);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.builds enable row level security;
alter table public.posts enable row level security;

-- Profiles: public read, owner insert/update
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Builds: public read, owner insert
create policy "Builds are viewable by everyone"
  on public.builds for select using (true);

create policy "Users can insert their own builds"
  on public.builds for insert with check (auth.uid() = user_id);

-- Posts: public read, owner insert
create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Users can insert their own posts"
  on public.posts for insert with check (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: create profile on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Realtime: enable for builds and posts
alter publication supabase_realtime add table public.builds;
alter publication supabase_realtime add table public.posts;

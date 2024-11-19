create table public.articles (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    url text not null,
    description text not null,
    category text not null,
    breed_ids uuid[] not null default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.articles enable row level security;

create policy "Enable read access for all users" on public.articles
    for select using (true);

create policy "Enable insert for authenticated users only" on public.articles
    for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.articles
    for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.articles
    for delete using (auth.role() = 'authenticated');
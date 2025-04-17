# Website

## TODOs

- Verify that the icon stuff works
- Stripe when I've got it working on some other site
- Resend? Setup readme and supabase integration readme next time I create a domain
- Fix this next time you setup a domain. See https://shipfa.st/docs/features/emails

## Setup

- Fill in the values in [src/app/site-config.ts](src/app/site-config.ts)
- And the domain in [next-sitemap.config.js](next-sitemap.config.js)
- Change the name in [package.json](package.json)
- Change .cursorrules to describe your project

### Icon Setup

- Create a single PNG icon (512x512px) and place in public/icon.png
- Will be used for modern browsers and as source for favicon
- Create a favicon with e.g. [favicon.io](https://favicon.io/) and place under src/app/favico.ico

- Create an Open Graph image (1200x630px) and place it in public directory as public/og-image.png

### Supabase

- Create a project in Supabase and copy the config values to .env.local
- Enable Google OAuth under Authentication (read next step)
- At the same time create a project in [Google Cloud](https://console.cloud.google.com/) and a new OAuth config. Authorized JavaScript origins=http://localhost:3000 and Authorized redirect URIs=http://localhost:3000/auth/callback and what Supabase OAuth provides e.g. https://fbucgqejoaejvmnhpjym.supabase.co/auth/v1/callback
- Fill in Client ID and Secret in Google Cloud
- In Supabase dashboard, go to Authentication then URL Configuration and add https://your-domain.com to Site URL. Then add https://your-domain.com/** and http://localhost:3000/** to Redirect URLs.
- Create a profile table in the SQL editor

```
-- Create the profiles table in the public schema
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    image TEXT,
    customer_id TEXT,
    price_id TEXT,
    has_access BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = (now() AT TIME ZONE 'UTC');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create a function to automatically add a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, image, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    (now() AT TIME ZONE 'UTC'),
    (now() AT TIME ZONE 'UTC')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the handle_new_user function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- Enable RLS

```
-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to read their own data
CREATE POLICY read_own_profile_data ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a policy to allow users to update their own data
CREATE POLICY update_own_profile_data ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Create a policy to allow users to insert their own data
CREATE POLICY insert_own_profile_data ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create a policy to allow users to delete their own data
CREATE POLICY delete_own_profile_data ON public.profiles
FOR DELETE
USING (auth.uid() = id);
```

### Terms of Service + Privacy Policy

Go to /privacy/page.tsx and terms/page.tsx and use cursor to create the real TOS by adding some relevant files into the prompt.

### Vercel Deployment

**Initiate Setup:**

```bash
cd git/root
vercel login
vercel
# Answer questions and specify ./website for code dir
```

Follow the CLI prompts.

**Configure on Vercel Dashboard:**

- Add git repository
- Add env variables
- Add domain, use www. as canoical version

### Resend / Emails

Also need to check supabase integration

And create some nice template for login emails and forgot password - maybe use the tulipsocial one?

# The Dodecathlon v2

Full-featured season-long sports picks competition with user accounts, email notifications, and real-time scoring.

---

## Setup Instructions

### Step 1 — Set up the database in Supabase

1. Go to [supabase.com](https://supabase.com) and open your **dodecathlon** project
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open the file `SETUP_DATABASE.sql` from this folder, copy everything, and paste it into the editor
5. Click **Run**
6. You should see "Success" — your database is ready

---

### Step 2 — Push to GitHub

1. Go to [github.com](https://github.com) and create a new repository called `dodecathlon`
2. Set it to **Public**
3. Upload all files from this folder, keeping the folder structure intact
4. Commit the files

---

### Step 3 — Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and click **Add new site** → **Import an existing project**
2. Click **GitHub** and select your `dodecathlon` repository
3. Build settings will auto-detect — just click **Deploy site**
4. Wait about 2 minutes for the first deploy

---

### Step 4 — Add environment variables in Netlify

This is important — without these, the site can't talk to your database or send emails.

1. In Netlify, go to **Site settings** → **Environment variables**
2. Click **Add a variable** and add each of these one at a time:

| Key | Value |
|-----|-------|
| `REACT_APP_SUPABASE_URL` | `https://mueonmzaiobyigeoktri.supabase.co` |
| `REACT_APP_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_i3UWlbsaGU7SY14uXiLowQ_ELORXtJu` |
| `SUPABASE_SECRET_KEY` | `sb_secret_5CgEnTp9-whgAqpplNZWGg_qtmIvFEI` |
| `RESEND_API_KEY` | `re_V1LoymLy_EyEmkXbFqbVgMYvWeEoNAsZa` |

3. After adding all four, go to **Deploys** and click **Trigger deploy** → **Deploy site**

---

### Step 5 — You're live!

Your site URL will be something like `https://amazing-name-123456.netlify.app`

You can find it at the top of your Netlify dashboard. Share this URL with all players!

---

## How to update the site

Whenever we add a new sport or feature:
1. Claude generates updated code
2. You replace the files in your GitHub repository
3. Netlify automatically redeploys within 2 minutes

---

## Commissioner login

- Username: `Marcin`
- Password: `dodeca2025`

Change your password after first login via the Profile page.

---

## Adding other players

Log in as commissioner → Commissioner panel → Players tab → fill in username, email, and a temporary password → Add. Share the site URL and their credentials with each player.

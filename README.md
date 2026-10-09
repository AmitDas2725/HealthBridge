# HealthBridge

HealthBridge is a full-stack doctor finder app built for people who need trusted medical help in a new locality. It helps users search doctors by disease, specialization, and city, detect nearby clinics on a live map, ask an AI symptom checker for safe first-level guidance, and book appointments after logging in.

This project stays under the `HealthBridge` name and uses MySQL as requested.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL
- Maps: Leaflet + OpenStreetMap
- AI: OpenRouter or OpenAI API with a safe fallback mode
- Auth: JWT + bcrypt

## Recommended Node version

Use Node `20.19.x` for this project.

Why:

- Expo SDK 54 expects at least Node `20.19.x`
- Using Node 25 can break Expo CLI tooling and package resolution

The repo now includes:

- `.nvmrc` with `20.19.0`
- `package.json` engine hint for Node 20

If you are temporarily staying on a newer local Node version, the mobile workspace now includes `ansi-escapes` directly because Expo CLI was failing on some setups with a missing module error during `expo install --fix`.

## Current HealthBridge features

### Patient features

- Search doctors by disease or symptoms such as gastric or fever
- Search doctors by specialization such as cardiologist or dermatologist
- Common specialty misspellings such as `gastrologist` are normalized to the closest supported search
- Search doctors by city
- Doctor list can be used as a filtered results area that shows only the doctors matching the current search or nearby lookup
- Dedicated `Doc List` page to browse all doctors and search by doctor name or specialization
- On the home page, matching doctor cards can auto-load into the result section as symptom, specialization, and place filters are filled
- Filter doctors by minimum rating
- Filter doctors who are available today
- View top-rated doctors
- View full doctor profiles
- Book appointments after login
- Use AI symptom checker to get:
  - possible conditions
  - recommended doctor type
  - safe general advice

### Map features

- Map on the home page
- Nearby doctors shown as markers
- Marker popup with doctor name and clinic name
- Browser geolocation support
- “Doctors Near Me” flow
- OpenStreetMap-based location experience without paid map setup
- Odisha-ready sample locations including Bhubaneswar, Cuttack, and Puri

### Real-world ideas added

- Verified doctor badges
- Teleconsultation availability tags
- “Available today” filter
- “Top rated” filter
- Next available time shown on cards
- My appointments view after login

## Folder structure

```text
HealthBridge/
  apps/
    mobile/
      App.js
      app.json
      package.json
    web/
      package.json
      index.html
      vite.config.js
      src/
        App.jsx
        main.jsx
        styles.css
        context/
          AuthContext.jsx
        components/
          ChatbotPanel.jsx
          DoctorCard.jsx
          DoctorMap.jsx
          Header.jsx
          SearchFilters.jsx
        pages/
          BookingPage.jsx
          DoctorDetailsPage.jsx
          HomePage.jsx
          LoginPage.jsx
        services/
          api.js
  db/
    schema.sql
    seed.sql
  server/
    package.json
    src/
      app.js
      db.js
      index.js
      middleware/
        requireAuth.js
      routes/
        ai.js
        appointments.js
        auth.js
        doctors.js
      services/
        chatbotService.js
        doctorService.js
  .env.example
  package.json
  README.md
```

## Database design

HealthBridge currently uses these MySQL tables:

- `users`
- `doctors`
- `appointments`

### Doctor fields

Each doctor record contains:

- `name`
- `specialization`
- `experience`
- `rating`
- `city`
- `clinic_name`
- `address`
- `latitude`
- `longitude`
- `consultation_fee`
- `next_available`
- `available_today`
- `image_url`
- `phone`
- `languages`
- `about`
- `disease_tags`
- `verified`
- `teleconsultation`

These fields are used both for search and map markers.

## Environment setup

Copy `.env.example` to `.env` in the project root.

```env
PORT=4000
CLIENT_URL=http://localhost:5173

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=healthbridge

JWT_SECRET=super-secret-healthbridge-key

OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=HealthBridge

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### Environment notes

- `PORT`: backend API port
- `CLIENT_URL`: frontend URL for CORS
- `MYSQL_*`: MySQL credentials
- `JWT_SECRET`: token signing secret for login
- `OPENROUTER_API_KEY`: preferred API key for OpenRouter model access
- `OPENROUTER_MODEL`: model slug from OpenRouter, for example `openai/gpt-4o-mini`
- `OPENROUTER_SITE_URL`: app URL sent with OpenRouter requests
- `OPENROUTER_APP_NAME`: app name sent with OpenRouter requests
- `OPENAI_API_KEY`: optional, but needed for live AI symptom responses
- `OPENAI_MODEL`: model used for the AI symptom checker

### OpenRouter setup

If you want HealthBridge to use OpenRouter first, add these values in the root `.env`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=HealthBridge
```

HealthBridge AI now follows this provider order:

1. `OPENROUTER_API_KEY`
2. `OPENAI_API_KEY`
3. local fallback symptom guide

## How to start HealthBridge

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Create the MySQL database

Run these files in MySQL:

```sql
SOURCE db/schema.sql;
SOURCE db/seed.sql;
```

This creates the database and loads sample doctors.

If your SQL editor gives errors on `SOURCE`, run [reset.sql](C:/Users/Amit%20Das/Desktop/HealthBridge/db/reset.sql:1) instead. It is self-contained and resets the schema plus sample data in one file.

The sample dataset now includes a larger Odisha-focused doctor list so common searches such as `gastric`, `gastroenterologist`, or `gastrology` can return multiple realistic doctor results instead of only one.

### 3. Configure environment variables

Create `.env` from `.env.example` and update values for your machine.

### 4. Start the backend

```bash
npm run dev:server
```

Backend runs at:

```text
http://localhost:4000
```

Before logging in, run the schema and seed scripts against MySQL. The seed script creates the demo account:

- Email: `demo@healthbridge.com`
- Password: `HealthBridge123`

The backend supports registration, login, and session validation. It reads MySQL and JWT settings from the root `.env` file.

### 5. Start the frontend

Open a new terminal and run:

```bash
npm run dev:web
```

Frontend runs at:

```text
http://localhost:5173
```

### 6. Optional mobile app

There is still an Expo mobile starter in `apps/mobile`, but the main HealthBridge experience in this phase is the web app plus MySQL backend.

To run the Expo app on a real phone more reliably, the mobile workspace now uses `expo start --tunnel`.

### 7. Mobile setup note

Before opening the app in Expo Go, update `apps/mobile/App.js` so `API_BASE_URL` points to the computer running the backend, including port `4000`.

Example:

```js
const API_BASE_URL = "http://192.168.1.5:4000/api";
```

The mobile app now matches the current backend routes:

- `GET /api/doctors`
- `POST /api/ai/triage`

and uses the current doctor response fields such as:

- `name`
- `specialization`
- `clinicName`
- `consultationFee`
- `directionsUrl`

If `npx expo install --fix` fails on your machine, you can skip it and use this simpler flow after `npm install`:

```powershell
cd 'C:\Users\Amit Das\Desktop\HealthBridge'
npm run dev:server
```

In a second terminal:

```powershell
cd 'C:\Users\Amit Das\Desktop\HealthBridge'
npm run dev:mobile
```

If Expo reports that it cannot resolve the entry file, the mobile app now uses a local entry file:

```text
apps/mobile/index.js
```

and `apps/mobile/package.json` points `main` to:

```json
"main": "index.js"
```

## Main user flow

```text
User opens HealthBridge
   -> location detected
   -> nearby doctors shown on the map
   -> user searches by symptom, disease, city, or specialization
   -> AI suggests possible conditions and doctor type
   -> filtered doctors shown on list and map
   -> user logs in
   -> user books appointment
```

## Frontend pages

### Home page

Contains:

- search bar and filters
- doctor list
- map view
- AI chatbot
- doctors near me button

### Doctor details page

Contains:

- full doctor info

### Doc List page

Contains:

- full doctor directory
- search by doctor name
- search by profession or specialization
- quick profile and booking access
- disease tags
- clinic and city details
- booking button
- map link

### Booking page

Contains:

- appointment form
- login reminder if not signed in
- current user appointments

### Login page

Contains:

- register flow
- login flow
- JWT-based session handling

## Backend API list

### `GET /api/health`

Simple health check.

### `POST /api/auth/register`

Create a new user account.

Request body:

```json
{
  "name": "Amit Das",
  "email": "amit@example.com",
  "password": "secret123"
}
```

### `POST /api/auth/login`

Login user.

Request body:

```json
{
  "email": "amit@example.com",
  "password": "secret123"
}
```

### `GET /api/auth/me`

Get current logged-in user.

Requires `Authorization: Bearer <token>`.

### `GET /api/doctors`

List doctors with filters.

Supported query params:

- `disease`
- `specialization`
- `city`
- `ratingMin`
- `availableToday`
- `topRated`
- `lat`
- `lng`

Example:

```text
/api/doctors?disease=gastric&city=Kolkata&ratingMin=4.5
```

### `GET /api/doctors/:id`

Get full doctor details.

### `GET /api/doctors/nearby?lat=...&lng=...`

Get nearby doctors by current location.

Example:

```text
/api/doctors/nearby?lat=22.57&lng=88.36&radiusKm=15
```

### `POST /api/appointments`

Book an appointment.

Requires `Authorization: Bearer <token>`.

Request body:

```json
{
  "doctorId": 1,
  "appointmentDate": "2026-04-25T10:30",
  "notes": "Acidity for 3 days"
}
```

### `GET /api/appointments/mine`

Get current user bookings.

Requires `Authorization: Bearer <token>`.

### `POST /api/ai`

AI symptom checker.

Request body:

```json
{
  "symptoms": "I have gastric pain and acidity."
}
```

Returns:

- `possibleConditions`
- `recommendedDoctor`
- `medicinesToDiscuss`
- `advice`
- `followUpQuestion`
- `guidance`
- `disclaimer`
- `urgency`

### `POST /api/osm/import`

Imports hospitals and clinics from OpenStreetMap into the local MySQL `hospitals` table.

Optional request body:

```json
{
  "south": 20.20,
  "west": 85.75,
  "north": 20.35,
  "east": 85.90
}
```

If you send no body, HealthBridge uses a default Bhubaneswar bounding box.

### `GET /api/osm/hospitals`

Returns the imported hospitals and clinics saved in MySQL.

## AI chatbot safety rules

The AI checker is built to:

- suggest possible conditions only
- never give a final diagnosis
- only suggest safe medicine categories to discuss, not prescriptions or dosages
- recommend the type of doctor to consult
- urge emergency help for chest pain, bleeding, or breathing issues
- always include this disclaimer:

```text
Consult a qualified doctor for confirmation.
```

## Important files

### Backend

- `server/src/app.js`: Express app setup
- `server/src/db.js`: MySQL connection pool
- `server/src/routes/auth.js`: login and register APIs
- `server/src/routes/doctors.js`: doctor search and nearby APIs
- `server/src/routes/appointments.js`: appointment booking APIs
- `server/src/routes/ai.js`: AI symptom checker API
- `server/src/services/doctorService.js`: doctor search logic and distance logic
- `server/src/services/chatbotService.js`: AI logic and fallback rules
- `server/src/middleware/requireAuth.js`: auth middleware

### Frontend

- `apps/web/src/App.jsx`: app routing
- `apps/web/src/pages/HomePage.jsx`: home experience
- `apps/web/src/pages/DoctorDetailsPage.jsx`: doctor detail page
- `apps/web/src/pages/BookingPage.jsx`: booking form and appointment list
- `apps/web/src/pages/LoginPage.jsx`: auth screen
- `apps/web/src/components/DoctorMap.jsx`: Leaflet map integration
- `apps/web/src/components/ChatbotPanel.jsx`: AI symptom checker UI
- `apps/web/src/context/AuthContext.jsx`: login state handling
- `apps/web/src/services/api.js`: API integration layer

## Notes for future upgrades

Good next steps for HealthBridge:

- doctor-side dashboard
- appointment status updates and cancellation
- specialty icons and richer map clustering
- email or SMS booking notifications
- separate admin panel for doctor verification
- full mobile app parity with the web features
- show imported OSM hospitals on the map alongside doctor results

## Minimal OSM importer

HealthBridge now includes a simple OpenStreetMap importer for real hospitals and clinics.

Fastest setup:

1. Run [schema.sql](C:/Users/Amit%20Das/Desktop/HealthBridge/db/schema.sql:1) or [reset.sql](C:/Users/Amit%20Das/Desktop/HealthBridge/db/reset.sql:1)
2. Start the backend
3. Import Bhubaneswar hospitals and clinics:

```http
POST http://localhost:4000/api/osm/import
Content-Type: application/json

{}
```

4. Read the imported places:

```text
GET http://localhost:4000/api/osm/hospitals
```

This is the simplest practical architecture for now:

- OpenStreetMap / Overpass API for real place data
- MySQL for saved hospital and clinic data
- your own doctor table for ratings, specialization, timings, and app-specific doctor details

## README maintenance note

This README is the main HealthBridge project guide. When the code structure, environment variables, setup steps, APIs, or user flow changes, update this file in the same change so the project docs stay in sync.

## Troubleshooting on this laptop

During setup on this Windows laptop, some transitive packages were not being installed consistently for the workspace. To make the project more stable, the important runtime dependencies for Express, MySQL, React Router, and React Leaflet are now listed explicitly in the workspace package files instead of relying only on nested dependency resolution.

If you still need to rerun install, use:

```powershell
cd 'C:\Users\Amit Das\Desktop\HealthBridge'
npm install
```

## Startup behavior

HealthBridge now opens on a login screen first on both web and mobile.

- Web users must log in before protected routes such as home, doctor details, and booking are shown.
- Mobile users see a login/register screen first and enter the main app only after authentication succeeds.

## Environment file location

Keep the main `.env` file in the project root:

`C:\Users\Amit Das\Desktop\HealthBridge\.env`

The backend now loads that root `.env` file even if you start the server from inside the `server` folder.

## Demo login

You can log into both web and mobile with this demo account:

- Email: `demo@healthbridge.com`
- Password: `HealthBridge123`

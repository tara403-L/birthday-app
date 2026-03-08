# Birthday Collision App

Real-time classroom app for the Birthday Problem probability lecture — Free University of Georgia.

## Run locally

1. **Install dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

2. **Start server and client**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173  
   - Backend: http://localhost:3001  

3. **Admin**
   - Open http://localhost:5173/admin  
   - Password: `prof123` (set in `.env` as `ADMIN_PASSWORD`)

Students go to `/`, enter name and birthday, then wait. Teacher uses `/admin` to **Reveal results** (everyone sees matches and probability) or **Reset session** (everyone returns to the form).

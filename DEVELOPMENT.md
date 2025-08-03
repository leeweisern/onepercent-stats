# Development Guide

## Running the Application Locally

To run the application in development mode, you need to start both the server and the web application.

### 1. Start the Server

```bash
cd apps/server
bun run dev
```

This will start the server on `http://localhost:3000` with access to the remote D1 database.

### 2. Start the Web Application

In a new terminal:

```bash
cd apps/web
bun run dev
```

This will start the web application on `http://localhost:5173`.

### 3. Access the Application

1. Open your browser and go to `http://localhost:5173`
2. You should be redirected to the login page
3. Use the admin credentials:
   - **Email:** signatureonepercent2025@gmail.com
   - **Password:** 12345678

### Troubleshooting

#### Infinite Loading on Login Page

If you see an infinite loading spinner:

1. **Check if the server is running:** Make sure `bun run dev` is running in the `apps/server` directory
2. **Check the browser console:** Look for any error messages
3. **Verify environment variables:** Make sure `VITE_SERVER_URL=http://localhost:3000` is set in `apps/web/.env`

#### Authentication Issues

1. **Clear browser storage:** Clear localStorage and cookies for localhost
2. **Check server logs:** Look at the server terminal for any error messages
3. **Verify database:** Make sure the user exists in the database

#### CORS Issues

If you see CORS errors, make sure:
1. The server is running on port 3000
2. The web app is running on port 5173
3. The CORS configuration in the server allows requests from the web app

### Database Access

To check the database directly:

```bash
cd apps/server
wrangler d1 execute onepercent-stats-new --remote --command "SELECT * FROM user"
```

### Admin Features

Once logged in as an admin user, you can:
1. Access the admin panel at `/admin`
2. Create new employee accounts
3. Delete existing users (except yourself)
4. Manage user roles (admin vs employee)

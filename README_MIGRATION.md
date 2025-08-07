# Database Migration Guide

## Setup Instructions

### 1. Install PostgreSQL
Download and install PostgreSQL from https://www.postgresql.org/download/

### 2. Create Database
```sql
-- Connect to PostgreSQL as superuser and run:
CREATE DATABASE rocketleague;
CREATE USER rocketleague_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE rocketleague TO rocketleague_user;
```

### 3. Update Environment Variables
Edit `.env` file and update the DATABASE_URL:
```
DATABASE_URL=postgresql://rocketleague_user:your_password_here@localhost:5432/rocketleague
```

### 4. Run Migration
```bash
# Run the data migration
npm run migrate

# Start the full application (server + client)
npm run dev

# Or run them separately:
npm run server  # Starts Express server on port 5000
npm start       # Starts React app on port 3000
```

## What Gets Migrated

- ✅ Teams (with logos and colors)
- ✅ Players (with gamertags)
- ✅ Games/Schedule (with scores and dates)
- ✅ Standings (wins, losses, points)
- ✅ Power Rankings (by week)
- ✅ Player Game Stats (points, goals, assists, etc.)
- ✅ Season management

## API Endpoints

Once migrated, these endpoints will be available:

- `GET /api/teams` - All teams
- `GET /api/players` - All players
- `GET /api/schedule` - Game schedule
- `GET /api/standings` - Current standings
- `GET /api/stats` - Player statistics
- `GET /api/power-rankings` - Power rankings

## Next Steps

After migration, you'll need to:

1. Update React components to fetch data from API instead of importing JS files
2. Add admin functionality to create/edit teams, players, games
3. Implement real-time stat tracking during games
4. Add authentication for admin operations

## Rollback

If you need to rollback to the old system, simply:
1. Stop using the API endpoints
2. Keep importing from the original JS files in `/src/data/`

The original data files are preserved and unchanged.
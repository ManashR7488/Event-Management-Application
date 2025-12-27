# Team Deduplication & Index Migration Guide

## Overview
Before deploying the unique compound index `{ eventId: 1, leadUserId: 1 }`, you must ensure no duplicate teams exist in the database.

## Problem
If duplicate teams exist (same user registered multiple teams for the same event), MongoDB will fail to create the unique index on server startup.

## Solution: Run Migration Before Deployment

### Step 1: Backup Database (Recommended)
```bash
# Create a backup of your database before running migration
mongodump --uri="mongodb://your-connection-string" --out=./backup-$(date +%Y%m%d)
```

### Step 2: Run Deduplication Script
```bash
# Navigate to server directory
cd server

# Run the deduplication script
node scripts/deduplicateTeams.js
```

### Step 3: Review Output
The script will:
- ✅ Find all duplicate {eventId, leadUserId} pairs
- ✅ Keep the most recent team (by createdAt)
- ✅ Delete older duplicates
- ✅ Provide detailed summary
- ✅ Verify no duplicates remain

Example output:
```
🔍 Starting team deduplication process...

✅ Connected to MongoDB

⚠️  Found 2 duplicate user-event pairs:

📋 User-Event Pair:
   Event ID: 6758a1b2c3d4e5f6a7b8c9d0
   Lead User ID: 6758a1b2c3d4e5f6a7b8c9d1
   Total Teams: 3

   ✅ KEEPING: Team "Code Warriors" (ID: 6758a1b2c3d4e5f6a7b8c9d2)
      Created: 12/27/2025, 10:30:00 AM
      Members: 5

   ❌ DELETING: Team "Code Warriors v2" (ID: 6758a1b2c3d4e5f6a7b8c9d3)
      Created: 12/26/2025, 3:15:00 PM
      Members: 3

   ❌ DELETING: Team "Debug Masters" (ID: 6758a1b2c3d4e5f6a7b8c9d4)
      Created: 12/25/2025, 8:00:00 AM
      Members: 4

============================================================
📊 Deduplication Summary:
============================================================
Teams Kept:    2
Teams Deleted: 3
============================================================

✅ Verification passed: No duplicates remain.
✅ Database is now ready for the unique index on {eventId, leadUserId}.

🔌 Disconnected from MongoDB
```

### Step 4: Deploy Application
After successful deduplication:
```bash
# Start the server - the unique index will be created automatically
npm start
```

## What the Script Does

### Strategy
1. **Find Duplicates**: Aggregates teams by `{eventId, leadUserId}` to find groups with multiple teams
2. **Sort by Recency**: Orders teams within each group by `createdAt` (descending)
3. **Keep Latest**: Retains the most recently created team
4. **Delete Older**: Removes all older duplicate teams
5. **Verify**: Confirms no duplicates remain after cleanup

### Why Keep the Most Recent?
- Most recent team likely has the latest member roster
- Reflects the user's most current registration intent
- Has the most up-to-date information

## Manual Deduplication (Alternative)

If you prefer manual control:

```javascript
// Find duplicates manually in MongoDB shell
db.teams.aggregate([
  {
    $group: {
      _id: { eventId: "$eventId", leadUserId: "$leadUserId" },
      teams: { $push: { _id: "$_id", teamName: "$teamName", createdAt: "$createdAt" } },
      count: { $sum: 1 }
    }
  },
  { $match: { count: { $gt: 1 } } }
])

// Delete specific team by ID
db.teams.deleteOne({ _id: ObjectId("team_id_here") })
```

## Rollback Plan

If migration causes issues:

1. **Restore Backup**:
   ```bash
   mongorestore --uri="mongodb://your-connection-string" ./backup-YYYYMMDD
   ```

2. **Remove Index** (if already created):
   ```javascript
   db.teams.dropIndex({ eventId: 1, leadUserId: 1 })
   ```

3. **Revert Code**: Roll back to previous commit before index was added

## Production Deployment Checklist

- [ ] Database backup created
- [ ] Deduplication script executed
- [ ] Script verification passed (0 duplicates remain)
- [ ] Test environment validated
- [ ] Production deployment scheduled
- [ ] Rollback plan prepared

## Monitoring After Deployment

After deploying, monitor for:

1. **Index Creation Success**:
   ```javascript
   db.teams.getIndexes()
   // Should show: { eventId: 1, leadUserId: 1 }
   ```

2. **Duplicate Registration Errors**:
   - Error code: 11000 (MongoDB duplicate key error)
   - Should show user-friendly message: "You have already registered a team for this event"

3. **Application Logs**:
   ```bash
   # Check for index creation in server logs
   grep "Index build" server.log
   ```

## FAQ

**Q: What happens if users complain about lost teams?**
A: The script keeps the most recent team. If needed, check backups for older team data.

**Q: Can I customize which team to keep?**
A: Yes, modify the script's sorting logic. Current: `sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))`. Change to sort by memberCount, payment status, etc.

**Q: Will this affect events with only one team per user?**
A: No, those teams are unaffected. Only duplicates are processed.

**Q: Can I test without deleting?**
A: Yes, comment out the `await Team.findByIdAndDelete(team.teamId)` line to do a dry run.

## Contact

For issues during migration, contact the development team with:
- Migration script output
- Database backup timestamp
- Number of affected teams

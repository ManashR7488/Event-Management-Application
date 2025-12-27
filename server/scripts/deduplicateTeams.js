/**
 * Migration Script: Deduplicate Teams by {eventId, leadUserId}
 * 
 * Purpose: Before deploying the unique compound index on {eventId, leadUserId},
 * this script finds and removes duplicate teams to prevent index creation failures.
 * 
 * Strategy:
 * - Group teams by {eventId, leadUserId}
 * - If multiple teams exist for the same user-event pair, keep the most recent one
 * - Delete older duplicates
 * - Report results
 * 
 * Run: node server/scripts/deduplicateTeams.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Team } from '../models/index.js';

// Load environment variables
dotenv.config();

const deduplicateTeams = async () => {
  try {
    console.log('🔍 Starting team deduplication process...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Aggregate to find duplicate {eventId, leadUserId} pairs
    const duplicates = await Team.aggregate([
      {
        $group: {
          _id: {
            eventId: '$eventId',
            leadUserId: '$leadUserId',
          },
          teams: {
            $push: {
              teamId: '$_id',
              teamName: '$teamName',
              createdAt: '$createdAt',
              memberCount: { $size: '$members' },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate teams found. Database is ready for unique index.\n');
      await mongoose.connection.close();
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate user-event pairs:\n`);

    let totalDuplicatesRemoved = 0;
    let totalKept = 0;

    // Process each duplicate group
    for (const duplicate of duplicates) {
      const { eventId, leadUserId } = duplicate._id;
      const teams = duplicate.teams;

      console.log(`\n📋 User-Event Pair:`);
      console.log(`   Event ID: ${eventId}`);
      console.log(`   Lead User ID: ${leadUserId}`);
      console.log(`   Total Teams: ${teams.length}\n`);

      // Sort teams by createdAt descending (most recent first)
      teams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Keep the most recent team
      const teamToKeep = teams[0];
      const teamsToDelete = teams.slice(1);

      console.log(`   ✅ KEEPING: Team "${teamToKeep.teamName}" (ID: ${teamToKeep.teamId})`);
      console.log(`      Created: ${new Date(teamToKeep.createdAt).toLocaleString()}`);
      console.log(`      Members: ${teamToKeep.memberCount}\n`);

      // Delete duplicate teams
      for (const team of teamsToDelete) {
        console.log(`   ❌ DELETING: Team "${team.teamName}" (ID: ${team.teamId})`);
        console.log(`      Created: ${new Date(team.createdAt).toLocaleString()}`);
        console.log(`      Members: ${team.memberCount}`);

        // Actually delete the team
        await Team.findByIdAndDelete(team.teamId);
        totalDuplicatesRemoved++;
      }

      totalKept++;
      console.log('');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Deduplication Summary:');
    console.log('='.repeat(60));
    console.log(`Teams Kept:    ${totalKept}`);
    console.log(`Teams Deleted: ${totalDuplicatesRemoved}`);
    console.log('='.repeat(60) + '\n');

    // Verify no duplicates remain
    const remainingDuplicates = await Team.aggregate([
      {
        $group: {
          _id: {
            eventId: '$eventId',
            leadUserId: '$leadUserId',
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    if (remainingDuplicates.length === 0) {
      console.log('✅ Verification passed: No duplicates remain.');
      console.log('✅ Database is now ready for the unique index on {eventId, leadUserId}.\n');
    } else {
      console.error(`❌ Verification failed: ${remainingDuplicates.length} duplicates still exist.`);
      console.error('Please review and run the script again.\n');
    }

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('\n❌ Error during deduplication:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Run the migration
deduplicateTeams();

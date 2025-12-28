import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Team from '../models/Team.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Migration script to link existing User accounts to Team member records
 * 
 * This script:
 * 1. Finds all teams and their members
 * 2. For each member, checks if a User with matching email exists
 * 3. Links the User to the team member if not already linked
 * 4. Handles conflicts (multiple matches, already linked, etc.)
 */

const linkExistingMembers = async () => {
  try {
    console.log('🚀 Starting migration: Link existing members to User accounts\n');

    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/eventmanagement", {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Fetch all teams
    const teams = await Team.find({});
    console.log(`📊 Found ${teams.length} teams to process\n`);

    let stats = {
      totalMembers: 0,
      linkedMembers: 0,
      alreadyLinked: 0,
      noUserFound: 0,
      emailMismatch: 0,
      errors: 0,
    };

    // Process each team
    for (const team of teams) {
      console.log(`\n🔄 Processing team: ${team.teamName} (${team._id})`);
      console.log(`   Event: ${team.eventId}`);
      console.log(`   Members: ${team.members.length}`);

      // Process each member in the team
      for (let i = 0; i < team.members.length; i++) {
        const member = team.members[i];
        stats.totalMembers++;

        console.log(`\n   👤 Member ${i + 1}: ${member.name} (${member.email})`);

        try {
          // Find user by email
          const user = await User.findOne({ email: member.email });

          if (!user) {
            console.log(`      ⚠️  No User account found for this email`);
            stats.noUserFound++;
            continue;
          }

          // Check if user is already linked
          if (user.teamId) {
            // Check if linked to the same team member
            if (user.teamId.toString() === team._id.toString() && user.memberIndex === i) {
              console.log(`      ✓  Already linked to this member`);
              stats.alreadyLinked++;
              continue;
            } else {
              console.log(`      ⚠️  Already linked to different team/member`);
              console.log(`         Current: Team ${user.teamId}, Index ${user.memberIndex}`);
              console.log(`         Skipping to avoid overwrite...`);
              stats.alreadyLinked++;
              continue;
            }
          }

          // Link user to team member
          user.teamId = team._id;
          user.memberIndex = i;
          user.qrToken = member.qrToken;
          await user.save();

          console.log(`      ✅ Successfully linked!`);
          console.log(`         Team: ${team.teamName}`);
          console.log(`         Member Index: ${i}`);
          console.log(`         QR Token: ${member.qrToken}`);
          stats.linkedMembers++;

        } catch (error) {
          console.error(`      ❌ Error processing member: ${error.message}`);
          stats.errors++;
        }
      }
    }

    // Print summary
    console.log('\n\n📈 Migration Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`Total Members Processed:    ${stats.totalMembers}`);
    console.log(`✅ Successfully Linked:     ${stats.linkedMembers}`);
    console.log(`⚠️  Already Linked:         ${stats.alreadyLinked}`);
    console.log(`⚠️  No User Account Found:  ${stats.noUserFound}`);
    console.log(`❌ Errors:                  ${stats.errors}`);
    console.log('═══════════════════════════════════════\n');

    console.log('✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the migration
linkExistingMembers();

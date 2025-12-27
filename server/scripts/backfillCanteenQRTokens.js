import mongoose from 'mongoose';
import crypto from 'crypto';
import { config } from 'dotenv';
import Event from '../models/Event.js';

// Load environment variables
config();

/**
 * Backfill script to generate canteenQRToken for existing events
 * Run this script once in each environment after deployment
 * 
 * Usage: node server/scripts/backfillCanteenQRTokens.js
 */

const backfillCanteenQRTokens = async () => {
  try {
    console.log('🔄 Starting canteenQRToken backfill process...');
    
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/eventmanagement");
    console.log('✅ Connected to MongoDB');
    
    // Find all events without canteenQRToken
    const eventsWithoutToken = await Event.find({
      $or: [
        { canteenQRToken: { $exists: false } },
        { canteenQRToken: null },
        { canteenQRToken: '' }
      ]
    });
    
    console.log(`📊 Found ${eventsWithoutToken.length} event(s) without canteenQRToken`);
    
    if (eventsWithoutToken.length === 0) {
      console.log('✨ All events already have canteenQRToken. No action needed.');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    // Generate tokens for events
    let successCount = 0;
    let failCount = 0;
    
    for (const event of eventsWithoutToken) {
      try {
        if (!event.slug) {
          console.warn(`⚠️  Event ${event._id} (${event.name}) has no slug. Skipping...`);
          failCount++;
          continue;
        }
        
        // Generate token using same format as pre-save hook
        const uuid = crypto.randomUUID();
        event.canteenQRToken = `EVENT:${event.slug.toUpperCase()}:CANTEEN:${uuid}`;
        
        await event.save();
        successCount++;
        console.log(`✅ Generated token for event: ${event.name} (${event.slug})`);
      } catch (error) {
        failCount++;
        console.error(`❌ Failed to update event ${event._id} (${event.name}):`, error.message);
      }
    }
    
    // Summary
    console.log('\n📈 Backfill Summary:');
    console.log(`   Total events processed: ${eventsWithoutToken.length}`);
    console.log(`   Successfully updated: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    
    if (successCount > 0) {
      console.log('\n✨ Backfill completed successfully!');
    } else {
      console.log('\n⚠️  No events were updated.');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Backfill process failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the backfill
backfillCanteenQRTokens();

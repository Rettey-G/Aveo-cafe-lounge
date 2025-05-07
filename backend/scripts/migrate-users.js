require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// MongoDB URI from environment variables
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI environment variable is not set.');
  process.exit(1);
}

const migrateUsers = async () => {
  let client;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db(); // Get the default database
    
    console.log('Starting user migration from "test" to "users" collection...');
    
    // Check if "test" collection exists
    const collections = await db.listCollections({ name: 'test' }).toArray();
    if (collections.length === 0) {
      console.log('No "test" collection found. Nothing to migrate.');
      return;
    }
    
    // Get all documents from the "test" collection
    const testCollection = db.collection('test');
    const users = await testCollection.find({}).toArray();
    
    console.log(`Found ${users.length} users in the "test" collection.`);
    
    if (users.length === 0) {
      console.log('No users to migrate.');
      return;
    }
    
    // Check if "users" collection exists, create it if not
    const usersCollections = await db.listCollections({ name: 'users' }).toArray();
    if (usersCollections.length === 0) {
      console.log('Creating "users" collection...');
      await db.createCollection('users');
    }
    
    // Get the "users" collection
    const usersCollection = db.collection('users');
    
    // Insert all users into the "users" collection
    const result = await usersCollection.insertMany(users);
    console.log(`Successfully migrated ${result.insertedCount} users to the "users" collection.`);
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
};

migrateUsers();

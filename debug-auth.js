#!/usr/bin/env node

/**
 * Debug script to test Firebase Functions directly
 */

const { Client } = require('pg');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'corepadel',
  user: 'corepadel',
  password: 'corepadel123',
  ssl: false
};

async function testDatabaseConnection() {
  console.log('🔧 Testing database connection...');
  
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Database connection successful');
    
    // Test query
    const result = await client.query('SELECT COUNT(*) as count FROM core.user');
    console.log('📊 Current user count:', result.rows[0].count);
    
    // Test insert
    const testUser = {
      firebase_uid: 'test-uid-' + Date.now(),
      email: 'test@example.com',
      username: 'testuser',
      display_name: 'Test User'
    };
    
    console.log('🔄 Inserting test user:', testUser);
    
    const insertResult = await client.query(
      `INSERT INTO core.user (firebase_uid, email, username, display_name, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING user_id`,
      [testUser.firebase_uid, testUser.email, testUser.username, testUser.display_name]
    );
    
    console.log('✅ Test user created with ID:', insertResult.rows[0].user_id);
    
    // Clean up
    await client.query('DELETE FROM core.user WHERE firebase_uid = $1', [testUser.firebase_uid]);
    console.log('🧹 Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await client.end();
  }
}

async function testFirebaseFunctions() {
  console.log('\n🔧 Testing Firebase Functions...');
  
  try {
    // Test health check
    const healthResponse = await fetch('http://localhost:5001/corepadelapp/us-central1/healthCheck');
    const healthData = await healthResponse.json();
    console.log('✅ Health check response:', healthData);
    
    // Test syncUserToDatabase with mock data
    const mockUserData = {
      uid: 'test-uid-' + Date.now(),
      email: 'test@example.com',
      displayName: 'Test User'
    };
    
    console.log('🔄 Testing syncUserToDatabase with:', mockUserData);
    
    const syncResponse = await fetch('http://localhost:5001/corepadelapp/us-central1/syncUserToDatabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: mockUserData,
        context: {
          auth: {
            uid: mockUserData.uid,
            token: {
              email: mockUserData.email
            }
          }
        }
      })
    });
    
    if (syncResponse.ok) {
      const syncData = await syncResponse.json();
      console.log('✅ syncUserToDatabase response:', syncData);
    } else {
      console.error('❌ syncUserToDatabase failed:', syncResponse.status, syncResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Firebase Functions error:', error);
  }
}

async function main() {
  console.log('🚀 Starting debug tests...\n');
  
  await testDatabaseConnection();
  await testFirebaseFunctions();
  
  console.log('\n✅ Debug tests completed');
}

main().catch(console.error);

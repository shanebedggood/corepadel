#!/usr/bin/env node

/**
 * Migration script to update database from Keycloak to Firebase naming
 * 
 * This script helps you run the database migration to rename keycloak_uid to firebase_uid
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🔥 Firebase Migration Script\n');

console.log('📋 This script will help you migrate your database from Keycloak to Firebase naming.');
console.log('📋 It will rename the keycloak_uid column to firebase_uid in the core.user table.\n');

console.log('⚠️  IMPORTANT: Make sure your database is running and accessible.');
console.log('⚠️  This migration will modify your database schema.\n');

console.log('📝 To run the migration, execute the following command:');
console.log('   psql -h localhost -U corepadel -d corepadel -f ../database/ddl/migrate_keycloak_to_firebase.sql\n');

console.log('🔧 Alternative: If you have Docker running, you can use:');
console.log('   docker exec -i corepadel-postgres psql -U corepadel -d corepadel < ../database/ddl/migrate_keycloak_to_firebase.sql\n');

console.log('✅ After running the migration:');
console.log('   1. Restart your Quarkus service');
console.log('   2. Test the new Firebase endpoints');
console.log('   3. Update your frontend to use Firebase UIDs\n');

console.log('🧪 Test the migration with:');
console.log('   curl http://localhost:8081/api/users/firebase/YOUR_FIREBASE_UID\n');

console.log('📚 Migration file location:');
console.log(`   ${path.resolve(__dirname, '../../database/ddl/migrate_keycloak_to_firebase.sql')}\n`); 
#!/usr/bin/env node

/**
 * Debug script to test user sync functionality
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8081/api';

async function testUserService() {
    console.log('🔍 Testing User Service and Database Setup\n');
    
    try {
        // Test 1: Check if Quarkus service is running
        console.log('1️⃣ Testing Quarkus service connectivity...');
        const healthResponse = await axios.get(`${API_BASE_URL}/users/health`);
        console.log('✅ Quarkus service is running:', healthResponse.data);
        
        // Test 2: Check if user table exists by trying to get users
        console.log('\n2️⃣ Testing database connectivity...');
        const usersResponse = await axios.get(`${API_BASE_URL}/users`);
        console.log('✅ Database is accessible, found', usersResponse.data.length, 'users');
        
        // Test 3: Test user creation
        console.log('\n3️⃣ Testing user creation...');
        const testUser = {
            firebase_uid: 'debug-test-' + Date.now(),
            email: `debug-${Date.now()}@example.com`,
            username: `debuguser-${Date.now()}`,
            first_name: 'Debug',
            last_name: 'Test',
            display_name: 'Debug Test User',
            email_verified: true,
            is_active: true
        };
        
        const createResponse = await axios.post(`${API_BASE_URL}/users`, testUser);
        console.log('✅ User created successfully:', createResponse.data.user_id);
        
        // Test 4: Test user retrieval by Firebase UID
        console.log('\n4️⃣ Testing user retrieval...');
        const getUserResponse = await axios.get(`${API_BASE_URL}/users/firebase/${testUser.firebase_uid}`);
        console.log('✅ User retrieved successfully:', getUserResponse.data.email);
        
        // Test 5: Clean up
        console.log('\n5️⃣ Cleaning up test user...');
        await axios.delete(`${API_BASE_URL}/users/${createResponse.data.user_id}`);
        console.log('✅ Test user deleted successfully');
        
        console.log('\n🎉 All tests passed! User service and database are working correctly.');
        console.log('\n💡 The sync should now work when you log in via Firebase.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Quarkus service is not running');
            console.log('💡 Start it with: cd services && ./mvnw quarkus:dev');
        } else if (error.response?.status === 500) {
            console.log('\n💡 Database error - check if user table exists');
            console.log('💡 Run: psql -h localhost -U keycloak -d corepadel -f database/ddl/user.sql');
        } else if (error.response?.status === 404) {
            console.log('\n💡 API endpoint not found - check if UserResource is deployed');
        }
        
        process.exit(1);
    }
}

async function checkKeycloakProfile() {
    console.log('\n🔍 Checking Keycloak Profile Structure\n');
    
    // This is a mock Keycloak profile structure for reference
    const mockKeycloakProfile = {
        id: 'test-user-123',
        sub: 'test-user-123', // Alternative to id
        email: 'test@example.com',
        emailVerified: true,
        preferred_username: 'testuser',
        username: 'testuser', // Alternative to preferred_username
        given_name: 'Test',
        firstName: 'Test', // Alternative to given_name
        family_name: 'User',
        lastName: 'User', // Alternative to family_name
        name: 'Test User' // Full name
    };
    
    console.log('📋 Expected Keycloak profile structure:');
    console.log(JSON.stringify(mockKeycloakProfile, null, 2));
    
    console.log('\n💡 Make sure your Keycloak user has these fields configured');
    console.log('💡 Check Keycloak Admin Console > Users > [Your User] > Attributes');
}

async function main() {
    console.log('🚀 User Sync Debug Script\n');
    
    await testUserService();
    await checkKeycloakProfile();
    
    console.log('\n📋 Next steps:');
    console.log('   1. Make sure Quarkus service is running');
    console.log('   2. Make sure database is set up');
    console.log('   3. Log in via Keycloak');
    console.log('   4. Check browser console for sync messages');
    console.log('   5. Check database for new user records');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testUserService, checkKeycloakProfile }; 
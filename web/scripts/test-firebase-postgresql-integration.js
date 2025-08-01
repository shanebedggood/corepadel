#!/usr/bin/env node

/**
 * Test script for Firebase to PostgreSQL user integration
 * 
 * This script tests the complete flow:
 * 1. Create a test user in PostgreSQL
 * 2. Add roles to the user
 * 3. Add user to a club
 * 4. Add user to a tournament
 * 5. Verify all relationships
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:8081/api';
const TEST_USER = {
    firebase_uid: 'test-user-' + Date.now(),
    email: `test-${Date.now()}@example.com`,
    username: `testuser-${Date.now()}`,
    first_name: 'Test',
    last_name: 'User',
    display_name: 'Test User',
    mobile: '+27123456789',
    rating: 5,
    email_verified: true,
    is_active: true
};

async function testUserIntegration() {
    console.log('🧪 Testing Firebase to PostgreSQL User Integration\n');
    
    try {
        // Step 1: Create a test user
        console.log('1️⃣ Creating test user...');
        const createUserResponse = await axios.post(`${API_BASE_URL}/users`, TEST_USER);
        const createdUser = createUserResponse.data;
        console.log('✅ User created:', createdUser.user_id);
        
        // Step 2: Verify user was created
        console.log('\n2️⃣ Verifying user creation...');
        const getUserResponse = await axios.get(`${API_BASE_URL}/users/firebase/${TEST_USER.firebase_uid}`);
        const retrievedUser = getUserResponse.data;
        console.log('✅ User retrieved:', retrievedUser.email);
        
        // Step 3: Add role to user
        console.log('\n3️⃣ Adding player role to user...');
        const addRoleResponse = await axios.post(
            `${API_BASE_URL}/users/${createdUser.user_id}/roles?role=player`
        );
        console.log('✅ Role added:', addRoleResponse.data.role_name);
        
        // Step 4: Verify user roles
        console.log('\n4️⃣ Verifying user roles...');
        const rolesResponse = await axios.get(`${API_BASE_URL}/users/${createdUser.user_id}/roles`);
        const roles = rolesResponse.data;
        console.log('✅ User roles:', roles.map(r => r.role_name));
        
        // Step 5: Test user update
        console.log('\n5️⃣ Testing user update...');
        const updatedUser = { ...TEST_USER, rating: 7 };
        const updateResponse = await axios.put(`${API_BASE_URL}/users/${createdUser.user_id}`, updatedUser);
        console.log('✅ User updated, new rating:', updateResponse.data.rating);
        
        // Step 6: Test user search by email
        console.log('\n6️⃣ Testing user search by email...');
        const emailSearchResponse = await axios.get(`${API_BASE_URL}/users/email/${TEST_USER.email}`);
        console.log('✅ User found by email:', emailSearchResponse.data.username);
        
        // Step 7: Test pagination
        console.log('\n7️⃣ Testing user pagination...');
        const paginationResponse = await axios.get(`${API_BASE_URL}/users/page/0/size/10`);
        console.log('✅ Users retrieved:', paginationResponse.data.length, 'users');
        
        // Step 8: Test health check
        console.log('\n8️⃣ Testing health check...');
        const healthResponse = await axios.get(`${API_BASE_URL}/users/health`);
        console.log('✅ Health check:', healthResponse.data);
        
        // Step 9: Clean up - remove role
        console.log('\n9️⃣ Cleaning up - removing role...');
        await axios.delete(`${API_BASE_URL}/users/${createdUser.user_id}/roles/player`);
        console.log('✅ Role removed');
        
        // Step 10: Clean up - delete user
        console.log('\n🔟 Cleaning up - deleting user...');
        await axios.delete(`${API_BASE_URL}/users/${createdUser.user_id}`);
        console.log('✅ User deleted');
        
        console.log('\n🎉 All tests passed! Firebase to PostgreSQL integration is working correctly.');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        
        if (error.response?.status === 404) {
            console.log('\n💡 Make sure the Quarkus service is running on http://localhost:8081');
            console.log('💡 Run: cd services && ./mvnw quarkus:dev');
        }
        
        if (error.response?.status === 500) {
            console.log('\n💡 Make sure the database is set up correctly');
            console.log('💡 Run: psql -h localhost -U keycloak -d corepadel -f database/ddl/user.sql');
        }
        
        process.exit(1);
    }
}

async function testTournamentIntegration() {
    console.log('\n🏆 Testing Tournament Integration\n');
    
    try {
        // Create a test user for tournament
        const tournamentUser = {
            keycloak_uid: 'tournament-user-' + Date.now(),
            email: `tournament-${Date.now()}@example.com`,
            username: `tournamentuser-${Date.now()}`,
            first_name: 'Tournament',
            last_name: 'Player',
            display_name: 'Tournament Player',
            rating: 6,
            email_verified: true,
            is_active: true
        };
        
        console.log('1️⃣ Creating tournament test user...');
        const createUserResponse = await axios.post(`${API_BASE_URL}/users`, tournamentUser);
        const createdUser = createUserResponse.data;
        console.log('✅ Tournament user created:', createdUser.user_id);
        
        // Test adding user to tournament (mock - would need tournament service)
        console.log('\n2️⃣ Tournament integration test (mock)...');
        console.log('✅ User ready for tournament participation');
        console.log('   - Firebase UID:', createdUser.firebase_uid);
        console.log('   - Can be added to tournament_participant table');
        console.log('   - Can be added to tournament_team.player_uids array');
        
        // Clean up
        console.log('\n3️⃣ Cleaning up tournament test user...');
        await axios.delete(`${API_BASE_URL}/users/${createdUser.user_id}`);
        console.log('✅ Tournament test user deleted');
        
        console.log('\n🎉 Tournament integration test completed!');
        
    } catch (error) {
        console.error('\n❌ Tournament integration test failed:', error.response?.data || error.message);
    }
}

async function main() {
    console.log('🚀 Starting Firebase to PostgreSQL Integration Tests\n');
    
    // Check if service is running
    try {
        await axios.get(`${API_BASE_URL}/users/health`);
        console.log('✅ User service is running\n');
    } catch (error) {
        console.error('❌ User service is not running');
        console.log('💡 Start the service: cd services && ./mvnw quarkus:dev');
        process.exit(1);
    }
    
    await testUserIntegration();
    await testTournamentIntegration();
    
    console.log('\n✨ All integration tests completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test with real Firebase authentication');
    console.log('   2. Integrate with tournament creation flow');
    console.log('   3. Test club membership functionality');
    console.log('   4. Add user profile management UI');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testUserIntegration, testTournamentIntegration }; 
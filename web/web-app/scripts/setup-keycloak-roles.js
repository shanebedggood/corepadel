const axios = require('axios');

const KEYCLOAK_URL = 'http://localhost:8080';
const REALM = 'CorePadelRealm';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password';

async function getAccessToken() {
  try {
    const response = await axios.post(`${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`, 
      new URLSearchParams({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        grant_type: 'password',
        client_id: 'admin-cli'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error.response?.data || error.message);
    throw error;
  }
}

async function createRole(accessToken, roleName, description) {
  try {
    await axios.post(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles`, {
      name: roleName,
      description: description
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Created role: ${roleName}`);
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`⚠️  Role ${roleName} already exists`);
    } else {
      console.error(`❌ Failed to create role ${roleName}:`, error.response?.data || error.message);
    }
  }
}

async function createUser(accessToken, userData) {
  try {
    const response = await axios.post(`${KEYCLOAK_URL}/admin/realms/${REALM}/users`, {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      emailVerified: true,
      enabled: true,
      credentials: [{
        type: 'password',
        value: userData.password,
        temporary: false
      }]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Created user: ${userData.username}`);
    return response.headers.location.split('/').pop(); // Get user ID
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`⚠️  User ${userData.username} already exists`);
      return null;
    } else {
      console.error(`❌ Failed to create user ${userData.username}:`, error.response?.data || error.message);
      return null;
    }
  }
}

async function assignRoleToUser(accessToken, userId, roleName) {
  try {
    // Get role details
    const roleResponse = await axios.get(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${roleName}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Assign role to user
    await axios.post(`${KEYCLOAK_URL}/admin/realms/${REALM}/users/${userId}/role-mappings/realm`, [roleResponse.data], {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Assigned role ${roleName} to user`);
  } catch (error) {
    console.error(`❌ Failed to assign role ${roleName}:`, error.response?.data || error.message);
  }
}

async function setDefaultRole(accessToken, roleName) {
  try {
    // Get current default roles
    const response = await axios.get(`${KEYCLOAK_URL}/admin/realms/${REALM}/roles`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    // Find the player role
    const playerRole = response.data.find(role => role.name === roleName);
    if (!playerRole) {
      console.error(`❌ Role ${roleName} not found`);
      return;
    }
    
    // Set as default role
    await axios.post(`${KEYCLOAK_URL}/admin/realms/${REALM}/default-roles`, [playerRole], {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Set ${roleName} as default role`);
  } catch (error) {
    console.error(`❌ Failed to set default role ${roleName}:`, error.response?.data || error.message);
  }
}

async function setupKeycloak() {
  try {
    console.log('🔐 Getting access token...');
    const accessToken = await getAccessToken();
    
    console.log('📝 Creating roles...');
    await createRole(accessToken, 'player', 'Player role for Core Padel users');
    await createRole(accessToken, 'admin', 'Administrator role for Core Padel');
    
    console.log('🔧 Setting default role...');
    await setDefaultRole(accessToken, 'player');
    
    console.log('👥 Creating users...');
    const playerUserId = await createUser(accessToken, {
      username: 'testplayer',
      email: 'player@example.com',
      firstName: 'Test',
      lastName: 'Player',
      password: 'password123'
    });
    
    const adminUserId = await createUser(accessToken, {
      username: 'testadmin',
      email: 'admin@example.com',
      firstName: 'Test',
      lastName: 'Admin',
      password: 'password123'
    });
    
    console.log('🔗 Assigning roles...');
    if (playerUserId) {
      await assignRoleToUser(accessToken, playerUserId, 'player');
    }
    if (adminUserId) {
      await assignRoleToUser(accessToken, adminUserId, 'admin');
    }
    
    console.log('✅ Keycloak setup completed!');
    console.log('\n📋 Test Users:');
    console.log('- Player: testplayer / password123');
    console.log('- Admin: testadmin / password123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupKeycloak(); 
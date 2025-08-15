/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore} = require("firebase-admin/firestore");
const {Client} = require("pg");

// Initialize Firebase Admin
initializeApp();

// Set global options for cost control
setGlobalOptions({ maxInstances: 10 });

// PostgreSQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || process.env.FUNCTIONS_EMULATOR ? 'localhost' : 'your-production-db-host',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'corepadel',
  user: process.env.DB_USERNAME || 'corepadel',
  password: process.env.DB_PASSWORD || 'corepadel123',
  ssl: process.env.FUNCTIONS_EMULATOR ? false : { rejectUnauthorized: false }
};

console.log('🔧 Database config for environment:', {
  environment: process.env.FUNCTIONS_EMULATOR ? 'development' : 'production',
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: dbConfig.ssl
});

/**
 * Helper function to get user info from context
 */
function getUserInfo(context) {
  console.log('🔍 Debug - Context received:', JSON.stringify(context, null, 2));
  
  if (!context) {
    console.log('⚠️ No context provided - this might be a new user signup');
    throw new Error('Unauthorized - No context provided');
  }
  
  // When using real Firebase Auth with local emulator, context.auth might be undefined
  // We need to handle this case and get user info from the request headers or other means
  if (!context.auth) {
    console.log('⚠️ No auth context found - checking if this is a new user signup');
    
    // For new user signup, we might not have auth context yet
    // Let's check if we can get user info from the request data
    if (context.rawRequest && context.rawRequest.body) {
      console.log('📋 Request body available:', context.rawRequest.body);
    }
    
    throw new Error('Unauthorized - No authentication context');
  }
  
  const uid = context.auth.uid;
  const email = context.auth.token?.email;
  
  if (!uid || !email) {
    console.log('⚠️ Missing user information:', { uid, email });
    throw new Error('Unauthorized - Missing user information');
  }
  
  console.log('✅ User info extracted successfully:', { uid, email });
  
  return {
    uid,
    email,
    displayName: context.auth.token?.name || email.split('@')[0]
  };
}

/**
 * Sync user to PostgreSQL database with role assignment
 * This function is triggered when a user signs up via passwordless authentication
 */
exports.syncUserToDatabase = onCall({ 
  maxInstances: 5,
  timeoutSeconds: 30 
}, async (request) => {
  const { data, context } = request;
  
  try {
    console.log('🔄 syncUserToDatabase called with context:', JSON.stringify(context, null, 2));
    console.log('📋 Request data:', JSON.stringify(data, null, 2));
    
    let userInfo;
    
    // Try to get user info from auth context first
    try {
      userInfo = getUserInfo(context);
    } catch (authError) {
      console.log('⚠️ Auth context not available, trying request data...');
      
      // If auth context is not available, try to get user info from request data
      if (data && data.uid && data.email) {
        userInfo = {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName || data.email.split('@')[0]
        };
        console.log('✅ User info extracted from request data:', userInfo);
      } else {
        throw new Error('No user information available from auth context or request data');
      }
    }
    
    console.log(`Syncing user ${userInfo.uid} (${userInfo.email}) to database`);

    const client = new Client(dbConfig);
    
    try {
      console.log('🔧 Attempting to connect to database...');
      await client.connect();
      console.log('✅ Database connection successful');
      
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT user_id, firebase_uid FROM core.user WHERE firebase_uid = $1',
        [userInfo.uid]
      );

      if (existingUser.rows.length > 0) {
        console.log(`User ${userInfo.uid} already exists in database`);
        return { success: true, message: 'User already exists' };
      }

      // Create new user
      const userResult = await client.query(
        `INSERT INTO core.user (firebase_uid, email, username, display_name) 
         VALUES ($1, $2, $3, $4) 
         RETURNING user_id`,
        [userInfo.uid, userInfo.email, userInfo.email.split('@')[0], userInfo.displayName]
      );

      const userId = userResult.rows[0].user_id;
      console.log(`Created user with ID: ${userId}`);

      // Assign default 'player' role
      await client.query(
        `INSERT INTO core.user_role (user_id, role_name) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id, role_name) DO NOTHING`,
        [userId, 'player']
      );

      console.log(`Assigned 'player' role to user ${userId}`);

      return { 
        success: true, 
        message: 'User synced successfully',
        userId: userId,
        role: 'player'
      };

    } catch (error) {
      console.error('❌ Database error:', error);
      
      // Return a more specific error message
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Database connection failed. Please check if the database is accessible from the cloud functions.');
      }
      
      throw new Error(`Database operation failed: ${error.message}`);
    } finally {
      try {
        await client.end();
      } catch (endError) {
        console.error('Error closing database connection:', endError);
      }
    }
  } catch (error) {
    console.error('Error in syncUserToDatabase:', error);
    throw new Error(error.message);
  }
});

/**
 * Assign role to user (admin only)
 * This function allows admins to assign roles to users
 */
exports.assignUserRole = onCall({ 
  maxInstances: 5,
  timeoutSeconds: 30 
}, async (request) => {
  const { data, context } = request;
  
  try {
    // Get user info from context
    const userInfo = getUserInfo(context);
    
    const { targetUserId, role } = data;
    
    if (!targetUserId || !role) {
      throw new Error('Missing required parameters: targetUserId, role');
    }

    if (!['admin', 'player'].includes(role)) {
      throw new Error('Invalid role. Must be "admin" or "player"');
    }

    // Check if current user is admin
    const currentUserRoles = await getUserRoles(userInfo.uid);
    if (!currentUserRoles.includes('admin')) {
      throw new Error('Only admins can assign roles');
    }

    const client = new Client(dbConfig);
    
    try {
      await client.connect();
      
      // Assign role to target user
      await client.query(
        `INSERT INTO core.user_role (user_id, role_name) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id, role_name) DO UPDATE SET role_name = $2`,
        [targetUserId, role]
      );

      console.log(`Assigned role '${role}' to user ${targetUserId}`);

      return { 
        success: true, 
        message: `Role '${role}' assigned successfully` 
      };

    } catch (error) {
      console.error('Error assigning role:', error);
      throw new Error(`Failed to assign role: ${error.message}`);
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('Error in assignUserRole:', error);
    throw new Error(error.message);
  }
});

/**
 * Get user roles from database
 */
async function getUserRoles(firebaseUid) {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    const result = await client.query(
      `SELECT ur.role_name 
       FROM core.user_role ur 
       JOIN core.user u ON ur.user_id = u.user_id 
       WHERE u.firebase_uid = $1`,
      [firebaseUid]
    );

    return result.rows.map(row => row.role_name);
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  } finally {
    await client.end();
  }
}

/**
 * Get user profile with roles
 */
exports.getUserProfile = onCall({ 
  maxInstances: 5,
  timeoutSeconds: 30 
}, async (request) => {
  const { data, context } = request;
  
  try {
    console.log('🔄 getUserProfile called with context:', JSON.stringify(context, null, 2));
    console.log('📋 Request data:', JSON.stringify(data, null, 2));
    
    let userInfo;
    
    // Try to get user info from auth context first
    try {
      userInfo = getUserInfo(context);
    } catch (authError) {
      console.log('⚠️ Auth context not available, trying request data...');
      
      // If auth context is not available, try to get user info from request data
      if (data && data.uid) {
        userInfo = {
          uid: data.uid,
          email: data.email || 'unknown@example.com',
          displayName: data.displayName || 'User'
        };
        console.log('✅ User info extracted from request data:', userInfo);
      } else {
        throw new Error('No user information available from auth context or request data');
      }
    }
    
    const client = new Client(dbConfig);
    
    try {
      await client.connect();
      
      // Get user profile and roles
      const result = await client.query(
        `SELECT u.user_id, u.firebase_uid, u.email, u.username, u.display_name, 
                array_agg(ur.role_name) as roles
         FROM core.user u 
         LEFT JOIN core.user_role ur ON u.user_id = ur.user_id 
         WHERE u.firebase_uid = $1 
         GROUP BY u.user_id, u.firebase_uid, u.email, u.username, u.display_name`,
        [userInfo.uid]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found in database');
      }

      const user = result.rows[0];
      return {
        success: true,
        user: {
          userId: user.user_id,
          firebaseUid: user.firebase_uid,
          email: user.email,
          username: user.username,
          displayName: user.display_name,
          roles: user.roles.filter(role => role !== null) // Remove null values
        }
      };

    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw new Error(error.message);
  }
});

/**
 * Health check endpoint
 */
exports.healthCheck = onRequest((request, response) => {
  response.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Core Padel User Sync'
  });
});

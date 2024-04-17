const { Session } = require('../models/sessionModel.js'); 
const { Op, Sequelize } = require('sequelize');
const { trackAndBlockRequests } = require('../models/sessionConfig.js');

// Function to clear sessions based on different thresholds
async function clearInactiveSessions() {
    try {
        // Define the time thresholds for session durations
        const shortThreshold = new Date(Date.now() - (6 * 60 * 60 * 1000)); // 6 hours ago
        const mediumThreshold = new Date(Date.now() - (24 * 60 * 60 * 1000)); // 24 hours ago
        const longThreshold = new Date(Date.now() - (48 * 60 * 60 * 1000)); // 48 hours ago

        // Find sessions where createdAt is equal to updatedAt
        const equalTimestampSessions = await Session.findAll({
            where: {
                createdAt: {
                    [Op.eq]: Sequelize.col('updatedAt')
                }
            }
        });

        // Find short duration sessions (logged out automatically)
        const shortSessions = await Session.findAll({
            where: {
                createdAt: {
                    [Op.lt]: shortThreshold
                }
            }
        });

        // Find medium duration sessions (inactive for more than 24 hours)
        const mediumSessions = await Session.findAll({
            where: {
                createdAt: {
                    [Op.lt]: mediumThreshold
                }
            }
        });

        // Find long duration sessions (inactive for more than 48 hours)
        const longSessions = await Session.findAll({
            where: {
                createdAt: {
                    [Op.lt]: longThreshold
                }
            }
        });

        // Merge sessions to be cleared
        const sessionsToClear = [...equalTimestampSessions, ...shortSessions, ...mediumSessions, ...longSessions];

        // Delete sessions
        await Promise.all(sessionsToClear.map(session => session.destroy()));

        console.log(`Cleared sessions: Equal Timestamp (${equalTimestampSessions.length}), Short (${shortSessions.length}), Medium (${mediumSessions.length}), Long (${longSessions.length})`);
    } catch (error) {
        console.error('Error clearing inactive sessions:', error);
    }
}

// Function to perform panic clearance (commented out for now)

async function panicClearance() {
    try {
        // Implement panic clearance logic here
        console.log('Panic clearance triggered.');

        // Check if panic clearance should be triggered based on IP requests
        const shouldTrigger = await trackAndBlockRequests();

        if (shouldTrigger) {
            // For example, delete all sessions if shouldTrigger is true
            await Session.destroy({
                where: shouldTrigger // Use the return value of trackAndBlockRequests directly in the where clause
            });

            console.log('Panic clearance completed.');
        } else {
            console.log('Panic clearance not triggered.');
        }
    } catch (error) {
        console.error('Error during panic clearance:', error);
    }
}


// Schedule the function to run periodically (e.g., once a day)
// Runs every 24 hours
setInterval(clearInactiveSessions, 24 * 60 * 60 * 1000); 

// Schedule panic clearance every second for a maximum duration of 1 hour
// Runs every second (commented out for now)
/*
const panicInterval = setInterval(panicClearance, 1000);
// 1 hour in milliseconds 
const panicDuration = 3600000; 
setTimeout(() => {
    // Stop the interval after 1 hour
    clearInterval(panicInterval); 
    console.log('Panic clearance stopped after 1 hour.');
}, panicDuration);
*/

module.exports = async function sessionDeletions() {
    // Call the function to perform session deletions
    await clearInactiveSessions();
    // Uncomment the line below if you want to include panic clearance
    // await panicClearance();
}

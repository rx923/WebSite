// File for handling user duration and creating a trading model based on the user's timings
module.exports = {
    getSessionDuration: function(loginTime, logoutTime) {
        // Check if loginTime and logoutTime are valid dates
        if (!(loginTime instanceof Date && !isNaN(loginTime) &&
            logoutTime instanceof Date && !isNaN(logoutTime))) {
            throw new Error('Invalid login or logout time');
        }

        // Calculate session duration in seconds
        return Math.round((logoutTime - loginTime) / 1000);
    },

    formatSessionDuration: function(durationInSeconds) {
        // Convert seconds to minutes and seconds
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;

        // Format duration as "MM:SS" string
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
};
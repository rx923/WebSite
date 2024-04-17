// Function for calculating session duration in seconds
function getSessionDuration(loginTime, logoutTime) {
    // Check if loginTime and logoutTime are valid dates
    if (!(loginTime instanceof Date && !isNaN(loginTime) &&
        logoutTime instanceof Date && !isNaN(logoutTime))) {
        throw new Error('Invalid login or logout time');
    }

    // Calculate session duration in seconds
    return Math.round((logoutTime - loginTime) / 1000);
}
// Function for formatting session duration as "HH:MM:SS" string
function formatSessionDuration(duration) {
    // Format duration as "HH:MM:SS" string
    return `${duration.hours}:${duration.minutes < 10 ? '0' : ''}${duration.minutes}:${duration.seconds < 10 ? '0' : ''}${duration.seconds}`;
}

module.exports = {
    getSessionDuration: getSessionDuration,
    formatSessionDuration: formatSessionDuration
};

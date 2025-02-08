/**
 * Converts a time string into a future timestamp.
 * @param {string} [time] - A duration string (e.g., "1d", "1w", "1m", "1y", "24h").
 * @returns {number} - The future timestamp in milliseconds.
 */
function calculateExpiry(time) {
    let now = new Date();
  
    // If no time is provided, default to 10 years in the future
    if (!time) {
      now.setFullYear(now.getFullYear() + 10);
      return now.getTime();
    }
  
    // Regular expression to parse the duration string
    const regex = /^(\d+)([dhwmy])$/;
    const match = time.match(regex);
  
    // If the format doesn't match expected patterns, default to 10 years
    if (!match) {
      now.setFullYear(now.getFullYear() + 10);
      return now.getTime();
    }
  
    const amount = parseInt(match[1], 10);
    const unit = match[2];
  
    // Adjust the current date based on the unit provided
    switch(unit) {
      case 'd': // days
        now.setDate(now.getDate() + amount);
        break;
      case 'w': // weeks
        now.setDate(now.getDate() + amount * 7);
        break;
      case 'm': // months
        now.setMonth(now.getMonth() + amount);
        break;
      case 'y': // years
        now.setFullYear(now.getFullYear() + amount);
        break;
      case 'h': // hours
        now.setHours(now.getHours() + amount);
        break;
      default:
        // Fallback to 10 years if the unit is not recognized
        now.setFullYear(now.getFullYear() + 10);
        break;
    }
  
    return now.getTime();
  }
  
    module.exports = calculateExpiry;
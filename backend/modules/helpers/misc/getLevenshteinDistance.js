/**
 * Returns the Levenshtein distance between two strings (a and b).
 * The Levenshtein distance is the minimum number of single-character
 * edits (insertions, deletions, or substitutions) required to change
 * one string into the other.
 */
function getLevenshteinDistance(a, b) {
    // If either string is empty, distance is length of the other
    if (!a) return b.length;
    if (!b) return a.length;

    // Initialize a matrix of size (b.length+1) x (a.length+1)
    const dist = Array.from({ length: b.length + 1 }, () => []);

    // Fill the first row and first column
    for (let i = 0; i <= b.length; i++) {
        for (let j = 0; j <= a.length; j++) {
            if (i === 0) {
                dist[i][j] = j; 
            } else if (j === 0) {
                dist[i][j] = i; 
            } else {
                dist[i][j] = 0;
            }
        }
    }

    // Compute distances
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = a[j - 1] === b[i - 1] ? 0 : 1;
            dist[i][j] = Math.min(
                dist[i - 1][j] + 1,     // insertion
                dist[i][j - 1] + 1,     // deletion
                dist[i - 1][j - 1] + cost  // substitution
            );
        }
    }

    return dist[b.length][a.length];
}

module.exports = getLevenshteinDistance;

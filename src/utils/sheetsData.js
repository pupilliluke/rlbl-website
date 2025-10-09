// Google Sheets CSV URLs for each season
export const SHEETS_CONFIG = {
  'S3 Fall \'25': {
    gid: '1676209307',
    name: 'S3 Fall \'25'
  },
  'S2 PLAYOFFS': {
    gid: '1597519332',
    name: 'S2 PLAYOFFS'
  },
  'S2 Spring \'25': {
    gid: '0',
    name: 'S2 Spring \'25'
  },
  'S1 Fall \'24': {
    gid: '1406693375',
    name: 'S1 Fall \'24'
  },
  'Career Stats': {
    gid: '787873962',
    name: 'Career Stats'
  }
};

const BASE_SHEET_ID = 'e/2PACX-1vT7NwPjIVeVvEgCfH2nmv838205PDwVaaVY9E9_gwqUzh_lxfU4AIIy7z-4BxK9Ff4p2fR__l_q6sBC';

export const getSheetCSVUrl = (gid) => {
  return `https://docs.google.com/spreadsheets/d/${BASE_SHEET_ID}/pub?gid=${gid}&output=csv`;
};

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return { headers: [], data: [], teamHeaders: [], teamData: [] };

  // Find the header row - look for specific patterns
  let headerIndex = 0;
  let headers = [];

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const potentialHeaders = parseCSVLine(lines[i]).map(h => h.trim().replace(/"/g, ''));

    // Look for a row that has typical stat column names
    const hasPlayerColumn = potentialHeaders.some(h => h === 'Player');
    const hasStatsColumns = potentialHeaders.some(h =>
      h === 'Points' || h === 'Goals' || h === 'Assists' || h === 'Games Played'
    );

    if (hasPlayerColumn && hasStatsColumns) {
      headers = potentialHeaders;
      headerIndex = i;
      break;
    }
  }

  if (headers.length === 0) {
    // Fallback to first line if no Player column found
    headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
    headerIndex = 0;
  }

  // Separate player columns from team columns
  // Find where the second set of stats begins (after the empty columns)
  let playerEndIndex = -1;
  let teamStartIndex = -1;

  for (let i = 0; i < headers.length; i++) {
    if (headers[i] === '' && i > 10) {
      playerEndIndex = i;
      // Find the next non-empty header
      for (let j = i + 1; j < headers.length; j++) {
        if (headers[j] !== '') {
          teamStartIndex = j;
          break;
        }
      }
      break;
    }
  }

  let playerHeaders = playerEndIndex > 0 ? headers.slice(0, playerEndIndex) : headers;
  let teamHeaders = teamStartIndex > 0 ? headers.slice(teamStartIndex) : [];

  // Rename 'WEST', 'West', or 'East' in the first column to 'Team'
  if (playerHeaders.length > 0) {
    const firstHeader = playerHeaders[0];
    if (firstHeader === 'WEST' || firstHeader === 'West' || firstHeader === 'East') {
      playerHeaders = ['Team', ...playerHeaders.slice(1)];
    }
  }

  if (teamHeaders.length > 0) {
    const firstHeader = teamHeaders[0];
    if (firstHeader === 'WEST' || firstHeader === 'West' || firstHeader === 'East') {
      teamHeaders = ['Team', ...teamHeaders.slice(1)];
    }
  }

  const data = [];
  const teamData = [];

  // Get the index of the Player column
  const playerColumnIndex = playerHeaders.findIndex(h => h === 'Player');

  // Track the current team name for filling in '-' entries
  let currentTeamName = '';

  // Track the current conference for both player and team data
  // Default to 'West' - teams are West unless they appear after an "East" header
  let currentConference = 'West';

  // Filter out rows that are summaries or section headers
  const skipPlayerPatterns = [
    'Average:', 'Conference Average:', 'CATEGORY LEADER:', 'WHO\'S LEADING',
    'OFFENSIVE STATS', 'DEFENSIVE STATS', 'Conference', 'Eastern Conference',
    'Western Conference', '🛡️', '🟢', '💥', '🔴', '🥅',
    '* Rookie', 'Enter', 'Don\'t Enter'
  ];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    // Skip completely empty rows
    if (!values.length) continue;

    // Get the player name value
    const playerValue = values[playerColumnIndex]?.trim() || '';

    // Check first column for conference indicators (for player data)
    const firstColumnValue = values[0]?.trim() || '';
    if (firstColumnValue.toLowerCase().includes('western') || firstColumnValue === 'WEST' || firstColumnValue === 'West') {
      currentConference = 'West';
      continue; // Skip this header row
    } else if (firstColumnValue.toLowerCase().includes('eastern') || firstColumnValue === 'East') {
      currentConference = 'East';
      continue; // Skip this header row
    }

    // Process player data
    if (playerValue && playerValue !== '') {
      // Skip summary/header rows
      if (!skipPlayerPatterns.some(pattern => playerValue.includes(pattern))) {
        // Update current team name if this row has a real team name
        if (firstColumnValue !== '-' && firstColumnValue !== '') {
          currentTeamName = firstColumnValue;
        }

        const row = {};
        playerHeaders.forEach((header, index) => {
          let value = values[index] ? values[index].trim().replace(/"/g, '') : '';

          // Replace '-' in the first column (team/conference) with the current team name
          if (index === 0 && value === '-' && currentTeamName) {
            value = currentTeamName;
          }

          row[header] = value;
        });

        // Add conference field to player data
        row['Conference'] = currentConference;

        data.push(row);
      }
    }

    // Process team data if it exists
    if (teamStartIndex > 0 && values.length > teamStartIndex) {
      const teamNameValue = values[teamStartIndex]?.trim() || '';

      // Check if this is a conference header row
      if (teamNameValue === 'East' || teamNameValue === 'West') {
        currentConference = teamNameValue;
      } else if (teamNameValue && teamNameValue !== '' &&
          !skipPlayerPatterns.some(pattern => teamNameValue.includes(pattern))) {
        const teamRow = {};
        teamHeaders.forEach((header, index) => {
          const valueIndex = teamStartIndex + index;
          teamRow[header] = values[valueIndex] ? values[valueIndex].trim().replace(/"/g, '') : '';
        });

        // Add conference field to the team data
        teamRow['Conference'] = currentConference;

        teamData.push(teamRow);
      }
    }
  }

  return {
    headers: playerHeaders,
    data,
    teamHeaders: teamHeaders.length > 0 ? teamHeaders : null,
    teamData: teamData.length > 0 ? teamData : null
  };
};

// Helper to properly parse CSV lines with commas in quoted fields
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

export const fetchSheetData = async (gid) => {
  try {
    const url = getSheetCSVUrl(gid);
    const response = await fetch(url);
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    return { headers: [], data: [] };
  }
};

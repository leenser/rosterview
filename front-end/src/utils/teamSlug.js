const TEAM_NAME_TO_SLUG = {
  "Atlanta United": "atlanta-united",
  "Austin FC": "austin-fc",
  "CF Montreal": "cf-montreal",
  "Charlotte FC": "charlotte-fc",
  "Chicago Fire FC": "chicago-fire-fc",
  "Colorado Rapids": "colorado-rapids",
  "Columbus Crew": "columbus-crew",
  "D.C. United": "d-c-united",
  "FC Cincinnati": "fc-cincinnati",
  "FC Dallas": "fc-dallas",
  "Houston Dynamo FC": "houston-dynamo-fc",
  "Inter Miami CF": "inter-miami-cf",
  "LA Galaxy": "la-galaxy",
  "Los Angeles FC": "los-angeles-fc",
  "Minnesota United FC": "minnesota-united-fc",
  "Nashville SC": "nashville-sc",
  "New England Revolution": "new-england-revolution",
  "New York City FC": "new-york-city-fc",
  "New York Red Bulls": "new-york-red-bulls",
  "Orlando City SC": "orlando-city-sc",
  "Philadelphia Union": "philadelphia-union",
  "Portland Timbers": "portland-timbers",
  "Real Salt Lake": "real-salt-lake",
  "San Diego FC": "san-diego-fc",
  "San Jose Earthquakes": "san-jose-earthquakes",
  "Seattle Sounders FC": "seattle-sounders-fc",
  "Sporting Kansas City": "sporting-kansas-city",
  "St. Louis CITY SC": "st-louis-city-sc",
  "Toronto FC": "toronto-fc",
  "Vancouver Whitecaps FC": "vancouver-whitecaps-fc",
}

export function getTeamSlug(teamName = "") {
  if (TEAM_NAME_TO_SLUG[teamName]) return TEAM_NAME_TO_SLUG[teamName]

  return teamName
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}


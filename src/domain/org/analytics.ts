/**
 * Org-level analytics from opted-in athlete training signals only.
 * Never includes recovery values, body metrics, media, or notes.
 */

export type OrgAthleteAggregateSignal = {
  athleteProfileId: string;
  displayName: string;
  teamIds: string[];
  teamNames: string[];
  sessionsLast7d: number;
  sessionsLast28d: number;
  /** Heuristic adherence 0–100; null when no training window. */
  adherencePct: number | null;
  /** Technique mean delta recent vs earlier; null if thin. */
  techniqueDelta: number | null;
};

export type OrgTeamAggregate = {
  teamId: string;
  teamName: string;
  optedInAthletes: number;
  sessionsLast7d: number;
  meanAdherencePct: number | null;
  meanTechniqueDelta: number | null;
  participationRate7d: number | null;
};

export type OrgAnalyticsSummary = {
  optedInAthletes: number;
  /** Athletes with ≥1 completed session in 7d / opted-in. */
  participationRate7d: number | null;
  sessionCount7d: number;
  sessionCount28d: number;
  meanAdherencePct: number | null;
  athletesMissedTraining7d: number;
  /** Share of opted-in with techniqueDelta ≤ -5. */
  techniqueRegressionShare: number | null;
  /** Share with techniqueDelta ≥ 3. */
  techniqueImprovingShare: number | null;
  meanTechniqueDelta: number | null;
  teams: OrgTeamAggregate[];
};

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Build org analytics from opted-in signals only.
 * Callers must already filter by aggregateOptIn.
 */
export function buildOrgAnalytics(
  signals: OrgAthleteAggregateSignal[],
  teams: Array<{ id: string; name: string }>,
): OrgAnalyticsSummary {
  const optedInAthletes = signals.length;
  const sessionCount7d = signals.reduce((a, s) => a + s.sessionsLast7d, 0);
  const sessionCount28d = signals.reduce((a, s) => a + s.sessionsLast28d, 0);
  const active7d = signals.filter((s) => s.sessionsLast7d > 0).length;
  const participationRate7d =
    optedInAthletes > 0
      ? round1((active7d / optedInAthletes) * 100)
      : null;

  const adherenceValues = signals
    .map((s) => s.adherencePct)
    .filter((v): v is number => v != null);
  const techniqueDeltas = signals
    .map((s) => s.techniqueDelta)
    .filter((v): v is number => v != null);

  const athletesMissedTraining7d = signals.filter(
    (s) => s.sessionsLast7d === 0 && s.sessionsLast28d > 0,
  ).length;

  const regressing = techniqueDeltas.filter((d) => d <= -5).length;
  const improving = techniqueDeltas.filter((d) => d >= 3).length;
  const techN = techniqueDeltas.length;

  const teamAggregates: OrgTeamAggregate[] = teams.map((team) => {
    const members = signals.filter((s) => s.teamIds.includes(team.id));
    const tSessions = members.reduce((a, s) => a + s.sessionsLast7d, 0);
    const tActive = members.filter((s) => s.sessionsLast7d > 0).length;
    const tAdherence = mean(
      members
        .map((s) => s.adherencePct)
        .filter((v): v is number => v != null),
    );
    const tTech = mean(
      members
        .map((s) => s.techniqueDelta)
        .filter((v): v is number => v != null),
    );
    return {
      teamId: team.id,
      teamName: team.name,
      optedInAthletes: members.length,
      sessionsLast7d: tSessions,
      meanAdherencePct: tAdherence != null ? Math.round(tAdherence) : null,
      meanTechniqueDelta: tTech != null ? round1(tTech) : null,
      participationRate7d:
        members.length > 0
          ? round1((tActive / members.length) * 100)
          : null,
    };
  });

  return {
    optedInAthletes,
    participationRate7d,
    sessionCount7d,
    sessionCount28d,
    meanAdherencePct:
      adherenceValues.length > 0
        ? Math.round(mean(adherenceValues)!)
        : null,
    athletesMissedTraining7d,
    techniqueRegressionShare:
      techN > 0 ? round1((regressing / techN) * 100) : null,
    techniqueImprovingShare:
      techN > 0 ? round1((improving / techN) * 100) : null,
    meanTechniqueDelta:
      techniqueDeltas.length > 0 ? round1(mean(techniqueDeltas)!) : null,
    teams: teamAggregates,
  };
}

/**
 * Roster row safe for org admins — training participation only.
 * Never includes recovery, body, media, notes.
 */
export type OrgRosterRow = {
  athleteProfileId: string;
  displayName: string;
  teamNames: string[];
  trainedLast7d: boolean;
  sessionsLast7d: number;
  adherencePct: number | null;
};

export function buildOrgRosterRows(
  signals: OrgAthleteAggregateSignal[],
): OrgRosterRow[] {
  return signals
    .map((s) => ({
      athleteProfileId: s.athleteProfileId,
      displayName: s.displayName,
      teamNames: s.teamNames,
      trainedLast7d: s.sessionsLast7d > 0,
      sessionsLast7d: s.sessionsLast7d,
      adherencePct: s.adherencePct,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

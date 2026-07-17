# Project Recon

# Events Application

# Database Design — Part 2 (Tournament Models)

**Status:** LOCKED

**Application:** `events`

---

# 1. Entity Overview

```text
Event
   │
   ▼
Tournament
   │
   ├──────────────────────────────┐
   ▼                              ▼
TournamentTeam                  Match
                                  │
                                  ▼
                              MatchSide
                                  │
                                  ▼
                           MatchParticipant

TournamentCategory
   │
   ▼
Tournament
```

Tournament is responsible for managing:

- Teams
- Matches
- Tournament Progress
- Rankings

---

# 2. Tournament

## Purpose

Represents a competitive event. Every Tournament extends exactly one Event with event_type TOURNAMENT.

---

## Database Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary Key |
| event | OneToOne → Event | Yes | Parent Event |
| category | FK → TournamentCategory | Yes | Tournament category |
| max_teams | Integer | No | NULL means unlimited |
| prize_pool | Decimal(10,2) | No | Prize amount |
| is_closed | Boolean | Yes | Prevents modifications when True |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

---

# 3. TournamentCategory

## Purpose

Manages tournament competition categories as database records rather than hardcoded enum values. Staff can add new categories without code changes.

## Database Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary Key |
| name | String(100) | Yes | Unique, display name |
| code | String(20) | Yes | Unique, machine-readable |
| description | Text | No | Optional |
| is_active | Boolean | Yes | Visibility |
| created_at | DateTime | Yes | Audit |
| updated_at | DateTime | Yes | Audit |

---

# 4. Tournament Constraints

Every Tournament:

- Must belong to one Event.
- Cannot exist without an Event.
- Must have a TournamentCategory.
- Cannot exceed the configured maximum number of teams (when max_teams is set).
- Uses the Event's registration configuration.

---

# 5. TournamentTeam

## Purpose

Represents one participating team within a Tournament.

---

## Database Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary Key |
| tournament | FK → Tournament | Yes | Parent Tournament |
| registration | FK → EventRegistration | No | NULL if created manually |
| team_name | String(255) | Yes | Display name |
| organization | String(255) | No | School, Company, Club, etc. |
| coach_name | String(255) | No | Team coach or mentor |
| contact_email | Email | No | Team contact |
| contact_phone | String(50) | No | Team contact |
| wins | Integer | Yes | Default 0 |
| losses | Integer | Yes | Default 0 |
| draws | Integer | Yes | Default 0 |
| points | Integer | Yes | Default 0 |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

---

# 6. Business Rules

Tournament Teams may be created:

### Manually

By Super Admin, Branch Manager, or Authorized Staff. No registration required.

### From Registration

Approved Event Registrations may be converted into Tournament Teams.

---

# 7. Constraints

Unique: (tournament, team_name) — prevents duplicate team names within the same tournament.

---

# 8. Match

## Purpose

Represents one game played inside a Tournament.

---

## Database Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary Key |
| tournament | FK → Tournament | Yes | Parent Tournament (CASCADE) |
| round | String(100) | Yes | Qualification, Quarter Final, etc. |
| scheduled_at | DateTime | Yes | Match schedule |
| started_at | DateTime | No | Actual start time |
| completed_at | DateTime | No | Completion time |
| winning_side | FK → MatchSide | No | Winning side after completion (SET_NULL) |
| status | Choice | Yes | Match status |
| created_at | DateTime | Yes | Creation timestamp |
| updated_at | DateTime | Yes | Last update timestamp |

---

# 9. Match Status

```
SCHEDULED
LIVE
COMPLETED
CANCELLED
```

---

# 10. Match Constraints

- Belong to one Tournament.
- Contain exactly two Match Sides.
- Reference only Tournament Teams belonging to the same Tournament.
- A team cannot play against itself.
- A team cannot participate in the same match twice.

---

# 11. MatchSide

## Purpose

Represents one competing side (alliance) in a Match. Each Match normally contains Side A and Side B.

---

## Database Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary Key |
| match | FK → Match | Yes | Parent Match (CASCADE) |
| side | Choice | Yes | Side A / Side B |
| score | Integer | Yes | Alliance score |
| created_at | DateTime | Yes | Audit |
| updated_at | DateTime | Yes | Audit |

## Constraints

Unique: (match, side). Every Match must contain exactly two Match Sides.

---

# 12. MatchParticipant

## Purpose

Represents one Tournament Team participating in a Match Side. Supports 1v1, 2v2, and future alliance formats.

---

## Database Fields

| Field | Type | Required | Description |
|--------|------|----------|-------------|
| id | UUID | Yes | Primary Key |
| match_side | FK → MatchSide | Yes | Parent Match Side (CASCADE) |
| tournament_team | FK → TournamentTeam | Yes | Participating Team (PROTECT) |
| created_at | DateTime | Yes | Audit |

## Constraints

Unique: (match_side, tournament_team). A Tournament Team may participate only once in the same Match.

---

# 13. Match Relationships

```
Tournament (1) → (∞) Match (CASCADE)
Match (1) → (2) MatchSide (CASCADE)
MatchSide (1) → (∞) MatchParticipant (CASCADE)
TournamentTeam (1) → (∞) MatchParticipant (PROTECT)
```

---

# 14. Ranking

Tournament rankings are **never stored**. They are calculated dynamically.

Ranking uses: Wins, Losses, Draws, Points.

The service layer generates standings whenever requested.

---

# 15. Business Workflow

```text
Tournament
      │
      ▼
Create Teams
      │
      ▼
Create Match
      │
      ▼
Assign Teams to Match Sides
      │
      ▼
Record Alliance Scores
      │
      ▼
Complete Match → Calculate Winner
      │
      ▼
Update Tournament Statistics
      │
      ▼
Generate Standings
```

---

# 16. Delete Rules

- Deleting a Tournament (CASCADE) deletes Matches, MatchSides, MatchParticipants.
- Tournament Teams are PROTECT — must be removed before Tournament deletion.
- Deleting a Tournament Team: Not allowed if referenced by completed Matches (PROTECT).
- Deleting a Match (CASCADE) deletes its Match Sides and Match Participants.
- Deleting a Match Side (CASCADE) deletes its Match Participants.

---

# 17. Index Recommendations

## Tournament

- category, is_closed

## TournamentTeam

- tournament, registration
- (tournament, team_name) — unique
- (tournament, points, wins) — for standings

## Match

- tournament, scheduled_at, status
- (tournament, round), (tournament, status)

## MatchSide

- match, (match, side) — unique

## MatchParticipant

- tournament_team, match_side
- (match_side, tournament_team) — unique

---

# 18. Locked Decisions

- Tournament extends Event.
- TournamentCategory is a managed model (not a hardcoded enum).
- Tournament Teams are the only entities that participate in Matches.
- Tournament Teams may be created manually or from approved registrations.
- Rankings are generated dynamically and never stored.
- Matches always belong to a Tournament.
- Every Match contains exactly two Match Sides.
- Match Sides own alliance scores.
- The Match architecture supports both 1v1 and alliance-based competitions.
- Tournament statistics are maintained by the service layer.
- Matches use CASCADE delete for sides and participants.
- Tournament Teams use PROTECT to prevent accidental deletion.
- Match history is preserved for reporting and auditing.

---

**Status:** LOCKED

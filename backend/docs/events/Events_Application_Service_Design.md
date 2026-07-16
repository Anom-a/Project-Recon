# Project Recon

# Events Application

# 🔒 Services Design

**Status:** 🔒 LOCKED

**Application:** `events`

> This document defines the complete business service layer for the Events application. It specifies the responsibilities of each service, service boundaries, service interactions, and the business rules enforced by the service layer. Database schema, APIs, and implementation details are intentionally excluded.

---

# 1. Service Layer Principles

The Events application follows the Project Recon service architecture.

```text
API Layer
      │
      ▼
Business Service
      │
      ▼
Validators
      │
      ▼
ORM / Repository
      │
      ▼
Database
```

Business rules are implemented inside Services.

Views remain thin.

Models remain data containers.

Validators perform business validation only.

---

# 2. Service Structure

```text
services/

    event_service.py

    tournament_service.py

    tournament_category_service.py

    tournament_team_service.py

    match_service.py

    ranking_service.py

    workshop_service.py

    registration_service.py

    event_payment_service.py

    validators/

        event_validator.py

        tournament_validator.py

        registration_validator.py

        workshop_validator.py

        match_validator.py

    queries/

        public_events.py

        live_events.py

        upcoming_events.py

        past_events.py

        rankings.py
```

---

# 3. Event Service

## Responsibilities

- get_event_or_404(pk)
- list_events(branch_ids)
- create_event(data, actor)
- update_event(event, data, actor)
- delete_event(event, actor)
- publish_event(event, actor) — DRAFT → PUBLISHED
- unpublish_event(event, actor) — PUBLISHED → DRAFT
- activate_event(event, actor)
- deactivate_event(event, actor)

---

## Does NOT

- Register Participants
- Create Tournament Teams
- Record Matches
- Process Payments
- Calculate Rankings

---

# 4. Tournament Service

## Responsibilities

- get_tournament_or_404(pk)
- list_tournaments(branch_ids)
- create_tournament(data, actor)
- update_tournament(tournament, data, actor)
- delete_tournament(tournament, actor)
- close_tournament(tournament, actor)
- reopen_tournament(tournament, actor)

---

## Does NOT

- Create Matches Automatically
- Generate Brackets
- Schedule Matches
- Assign Teams Automatically
- Calculate Rankings

---

# 5. TournamentCategory Service

## Purpose

Manages tournament competition categories.

## Responsibilities

- get_category_or_404(pk)
- list_categories()
- create_category(data, actor)
- update_category(category, data, actor)
- delete_category(category, actor) — fails if category is in use by tournaments

---

# 6. Tournament Team Service

## Purpose

Manages Tournament participants.

---

## Responsibilities

- get_team_or_404(pk)
- list_teams(tournament_id, branch_ids)
- create_team(data, actor)
- update_team(team, data, actor)
- delete_team(team, actor) — validates not in completed match
- convert_registration_to_team(registration, team_name, actor)

---

## Supports

### Manual Team Creation

Authorized staff may create Tournament Teams directly.

---

### Registration-Based Team Creation

Approved registrations may be converted into Tournament Teams.

---

## Does NOT

- Schedule Matches
- Calculate Rankings
- Assign Teams to Matches

---

# 7. Match Service

## Purpose

Manages Tournament Matches.

---

## Responsibilities

- get_match_or_404(pk)
- list_matches(tournament_id, branch_ids)
- create_match(data, actor) — creates Match with two empty sides
- update_match(match, data, actor)
- delete_match(match, actor)
- assign_team_to_side(match, side_type, team, actor)
- remove_team_from_side(match, side_type, team, actor)
- record_scores(match, side_a_score, side_b_score, actor)
- complete_match(match, actor) — finalizes, calculates winner, updates stats

---

## Match Completion Workflow

```text
Record Scores
      │
      ▼
Validate Scores
      │
      ▼
Calculate Winning Side
      │
      ▼
Complete Match
      │
      ▼
Ranking Service
```

---

## Does NOT

- Generate Brackets
- Create Future Matches
- Advance Teams
- Schedule Future Rounds

---

# 8. Ranking Service

## Purpose

Calculates Tournament statistics.

Ranking data is **never stored manually**.

It is always calculated from Match results.

---

## Responsibilities

- update_tournament_statistics(tournament) — recalculates all team stats from completed matches
- get_standings(tournament_id, top_n) — returns teams ordered by -points, -wins, team_name
- get_tournament_winner(tournament_id) — returns top-ranked team or None

---

## Triggered By

- Match Completion
- Match Score Update
- Match Cancellation (if applicable)

---

## Does NOT

- Modify Match Data
- Schedule Matches
- Manage Tournament Structure

---

# 9. Workshop Service

## Purpose

Manages Workshops.

---

## Responsibilities

- get_workshop_or_404(pk)
- list_workshops(user, branch_ids)
- create_workshop(data, actor)
- update_workshop(workshop, data, actor)
- delete_workshop(workshop, actor)

---

## Does NOT

- Register Participants
- Process Payments

---

# 10. Registration Service

## Purpose

Manages Event registrations.

---

## Responsibilities

- get_registration_or_404(pk)
- list_registrations(event_id, status, student_id, branch_ids)
- register_for_event(event_id, data, actor) — student or public registration
- approve_registration(registration, actor)
- reject_registration(registration, actor)
- cancel_registration(registration, actor)
- convert_registration_to_team(registration, team_name, actor) — creates TournamentTeam
- get_my_registrations(student_id)

---

## Registration Workflow

```text
Registration Request
        │
        ▼
Business Validation
        │
        ▼
Capacity Validation
        │
        ▼
Registration Rule Validation
        │
        ▼
Payment (if required)
        │
        ▼
Registration Confirmation
```

---

## Does NOT

- Call Payment Providers Directly
- Create Payment Transactions

---

# 11. Event Payment Service

## Purpose

Manages the complete payment workflow for Event registrations.

---

## Responsibilities

- get_payment_or_404(pk)
- list_payments(registration_id, status, event_id)
- submit_payment_evidence(registration, amount, payment_method, transaction_reference, bank_name, attachment, actor) — creates PENDING_VERIFICATION payment
- record_cash_payment(registration, amount, actor, payment_date) — creates VERIFIED payment, auto-approves registration
- verify_payment(registration, actor, verification_notes) — sets VERIFIED, auto-approves registration
- reject_payment(registration, actor, verification_notes) — sets REJECTED, auto-rejects registration

---

## Does NOT

- Communicate directly with payment gateways.

---

# 12. Validators

Validators contain reusable business validation.

They never save data.

---

## Event Validator

Responsibilities

- Date validation
- Registration configuration validation
- Capacity validation
- event_type = GENERAL => no specialized event
---

## Tournament Validator

Responsibilities

- Tournament configuration validation
- Maximum teams validation
- Tournament status validation

---

## Registration Validator

Responsibilities

- Registration eligibility
- Duplicate registration detection
- Deadline validation
- Capacity validation
- Registration mode validation

---

## Workshop Validator

Responsibilities

- Instructor validation
- Duration validation
- Workshop configuration validation

---

## Match Validator

Responsibilities

- Match side validation
- Team assignment validation
- Tournament consistency validation
- Score validation
- Winning side validation

---

# 13. Query Services

Query services provide optimized read operations.

They contain no business logic.

---

## Public Events Query

Returns published public events.

---

## Live Events Query

Returns currently active events.

---

## Upcoming Events Query

Returns future events.

---

## Past Events Query

Returns completed events.

---

## Rankings Query

Returns calculated Tournament standings.

---

# 14. Service Communication

```text
Event Service
        │
        ▼
Tournament Service
        │
        ▼
Tournament Team Service
        │
        ▼
Match Service
        │
        ▼
Ranking Service
```

---

Registration Flow

```text
Registration Service
        │
        ▼
Event Payment Service
        │
        ├── record_cash_payment() → VERIFIED, auto-approve
        │
        └── submit_payment_evidence() → PENDING_VERIFICATION
                │
                ├── verify_payment() → VERIFIED, auto-approve
                │
                └── reject_payment() → REJECTED, auto-reject
```

---

# 15. Calculation Rules

The system automatically calculates:

- Match Winner
- Winning Side
- Team Wins
- Team Losses
- Team Draws
- Team Points
- Tournament Standings
- Tournament Rankings
- Tournament Leader
- Tournament Winner

These values are derived from recorded Match results.

---

# 16. Non-Responsibilities

The Events application never:

- Generates Tournament Brackets.
- Generates Match Schedules.
- Automatically creates Matches.
- Automatically assigns Teams.
- Automatically advances Teams.
- Automatically creates Tournament Rounds.
- Makes organizational decisions for Tournament staff.

These decisions remain the responsibility of authorized staff.

---

# 17. Service Boundaries

Services may call other Services only when required by a legitimate business workflow.

Examples:

- Registration Service → Event Payment Service (submit_payment_evidence, record_cash_payment)
- Event Payment Service → Registration Service (auto-approve/reject on verify/reject)
- Match Service → Ranking Service
- Registration Service → Tournament Team Service

Services must never bypass business rules by directly modifying another domain's models.

---

# 18. Locked Business Rules

- Business logic resides exclusively in Services.
- Views remain thin.
- Models remain persistence objects.
- Validators perform validation only.
- Query services perform read operations only.
- Rankings are calculated dynamically.
- Match winners are calculated from recorded scores.
- Tournament winners are calculated from completed Match results.
- Tournament Teams may be created manually or from approved registrations.
- Payment processing is handled by EventPayment Service (PENDING_VERIFICATION → VERIFIED/REJECTED).
- The Events application records and validates Tournament data but does not organize Tournament structures.

---

# Status

**🔒 LOCKED**


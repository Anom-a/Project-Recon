# Project Recon

# Events Application Workflows v1.0

**Status:** LOCKED

**Application:** `events`

---

This document describes each business workflow scenario end-to-end, showing which services are called, what validation occurs, and what side effects happen.

---

# 1. Create General Event

**Purpose:** Staff creates a standalone event (not a Tournament or Workshop).

```text
[Staff] → EventService.create_event()
  │
  ├── Validates:
  │     - start_datetime < end_datetime
  │     - Registration config consistency
  │     - Event type = GENERAL
  │
  ├── Event.objects.create()
  │     event_type = GENERAL
  │
  ├── log_action(CREATE_EVENT)           → Audit trail
  │
  └── Returns Event
```

**Entry point:** POST /api/v1/events/admin/events/

**Roles allowed:** Super Admin, Branch Manager

---

# 2. Create Tournament

**Purpose:** Staff creates a tournament linked to an Event.

```text
[Staff] → TournamentService.create_tournament()
  │
  ├── Validates:
  │     - Event type is TOURNAMENT
  │     - Category exists and is active
  │     - max_teams >= 1 (if set)
  │     - prize_pool >= 0 (if set)
  │
  ├── Tournament.objects.create()
  │     event, category, max_teams, prize_pool
  │     is_closed = False
  │
  ├── log_action(CREATE_TOURNAMENT)      → Audit trail
  │
  └── Returns Tournament
```

**Two-step flow:** Create Event first, then create Tournament referencing that Event.

**Entry point:** POST /api/v1/events/admin/tournaments/

**Roles allowed:** Super Admin, Branch Manager

---

# 3. Create Workshop

**Purpose:** Staff creates a workshop linked to an Event.

```text
[Staff] → WorkshopService.create_workshop()
  │
  ├── Validates:
  │     - Event type is WORKSHOP
  │     - Instructor exists
  │     - duration_minutes > 0
  │
  ├── Workshop.objects.create()
  │     event, instructor, duration_minutes, level, price
  │
  ├── log_action(CREATE_WORKSHOP)        → Audit trail
  │
  └── Returns Workshop
```

**Two-step flow:** Create Event first, then create Workshop referencing that Event.

**Entry point:** POST /api/v1/events/admin/workshops/

**Roles allowed:** Super Admin, Branch Manager, Instructor (own workshops only)

---

# 4. Publish Event

**Purpose:** Staff publishes a draft event to make it visible.

```text
[Staff] → EventService.publish_event()
  │
  ├── Validates: Event is DRAFT
  │
  ├── Event.objects.update()
  │     status = PUBLISHED
  │
  ├── log_action(PUBLISH_EVENT)          → Audit trail
  │
  └── Returns Event
```

**Entry point:** POST /api/v1/events/admin/events/{id}/publish/

---

# 5. Student Registration

**Purpose:** An authenticated student registers for a PUBLISHED event.

```text
[Student] → RegistrationService.register_for_event()
  │
  ├── Validates:
  │     - Event is PUBLISHED and is_active
  │     - Registration is enabled
  │     - Registration mode is STUDENT or SUBPROGRAM_STUDENT
  │     - Deadline not passed
  │     - Capacity available
  │     - No duplicate registration (event + student)
  │
  ├── EventRegistration.objects.create()
  │     event, student, registration_status = PENDING
  │     payment_status = PENDING_VERIFICATION
  │
  ├── If payment is not required:
  │     registration_status = APPROVED
  │     Event.enrolled_count += 1
  │
  ├── log_action(REGISTER_FOR_EVENT)     → Audit trail
  │
  └── Returns EventRegistration
```

**Entry point:** POST /api/v1/events/{event_id}/register/

**Authentication:** Required (student)

---

# 6. Public Registration

**Purpose:** An unauthenticated user registers for a PUBLIC event.

```text
[Public User] → RegistrationService.register_for_event()
  │
  ├── Validates:
  │     - Event is PUBLISHED and is_active
  │     - Registration mode is PUBLIC
  │     - Same checks as student (deadline, capacity, duplicate by email)
  │
  ├── EventRegistration.objects.create()
  │     event, public_full_name, public_email, public_phone
  │     public_organization (optional)
  │     registration_status = PENDING
  │     payment_status = PENDING_VERIFICATION
  │
  ├── If payment is not required:
  │     registration_status = APPROVED
  │     Event.enrolled_count += 1
  │
  ├── log_action(REGISTER_FOR_EVENT)     → Audit trail
  │
  └── Returns EventRegistration
```

**Entry point:** POST /api/v1/events/{event_id}/register/

**Authentication:** None (public)

---

# 7. Cash Payment (Staff)

**Purpose:** Staff records a cash payment — immediately verifies and approves registration.

```text
[Staff] → EventPaymentService.record_cash_payment()
  │
  ├── Validates:
  │     - Registration exists and is not already approved/cancelled
  │     - Amount > 0
  │
  ├── EventPayment.objects.create()
  │     registration, amount, payment_method = CASH
  │     status = VERIFIED
  │     verified_by = actor, verified_at = now
  │
  ├── Registration auto-approved:
  │     registration_status = APPROVED
  │     approved_at = now
  │     payment_status = VERIFIED
  │     Event.enrolled_count += 1
  │
  ├── log_action(VERIFY_PAYMENT)         → Audit trail
  │
  └── Returns EventPayment
```

**Entry point:** POST /api/v1/events/admin/registrations/{id}/pay/cash/

**Roles allowed:** Super Admin, Branch Manager, Secretary

---

# 8. Submit Payment Evidence (User)

**Purpose:** A registrant submits bank transfer or mobile money evidence.

```text
[User] → EventPaymentService.submit_payment_evidence()
  │
  ├── Validates:
  │     - Registration exists
  │     - Amount matches fee
  │     - payment_method is valid
  │     - transaction_reference or attachment provided
  │
  ├── EventPayment.objects.create()
  │     registration, amount, payment_method
  │     transaction_reference, bank_name, attachment
  │     status = PENDING_VERIFICATION
  │
  ├── Registration.payment_status = PENDING_VERIFICATION
  │
  └── Returns EventPayment
```

**Entry point:** POST /api/v1/events/{event_id}/register/ (included in registration payload)

---

# 9. Verify Payment (Staff)

**Purpose:** Staff verifies a pending payment and approves the registration.

```text
[Staff] → EventPaymentService.verify_payment()
  │
  ├── Validates: Payment is PENDING_VERIFICATION
  │
  ├── EventPayment.objects.update()
  │     status = VERIFIED
  │     verified_by = actor, verified_at = now
  │     verification_notes (optional)
  │
  ├── Registration auto-approved:
  │     registration_status = APPROVED
  │     approved_at = now
  │     payment_status = VERIFIED
  │     Event.enrolled_count += 1
  │
  ├── log_action(VERIFY_PAYMENT)         → Audit trail
  │
  └── Returns EventPayment
```

**Entry point:** POST /api/v1/events/admin/registrations/{id}/verify-payment/

**Roles allowed:** Super Admin, Branch Manager, Secretary

---

# 10. Reject Payment (Staff)

**Purpose:** Staff rejects a pending payment and rejects the registration.

```text
[Staff] → EventPaymentService.reject_payment()
  │
  ├── Validates: Payment is PENDING_VERIFICATION
  │
  ├── EventPayment.objects.update()
  │     status = REJECTED
  │     verified_by = actor
  │     verification_notes = required
  │
  ├── Registration auto-rejected:
  │     registration_status = REJECTED
  │     payment_status = REJECTED
  │
  ├── log_action(REJECT_PAYMENT)         → Audit trail
  │
  └── Returns EventPayment
```

**Entry point:** POST /api/v1/events/admin/registrations/{id}/reject-payment/

---

# 11. Approve Registration (Staff — Free Events)

**Purpose:** Staff manually approves a PENDING registration for free events or waiving payment.

```text
[Staff] → RegistrationService.approve_registration()
  │
  ├── Validates: Registration is PENDING
  │
  ├── EventRegistration.objects.update()
  │     registration_status = APPROVED
  │     approved_at = now
  │     Event.enrolled_count += 1
  │
  ├── log_action(APPROVE_REGISTRATION)   → Audit trail
  │
  └── Returns EventRegistration
```

**Entry point:** POST /api/v1/events/admin/registrations/{id}/approve/

---

# 12. Reject Registration (Staff)

**Purpose:** Staff rejects a pending registration.

```text
[Staff] → RegistrationService.reject_registration()
  │
  ├── Validates: Registration is PENDING
  │
  ├── EventRegistration.objects.update()
  │     registration_status = REJECTED
  │
  ├── log_action(REJECT_REGISTRATION)    → Audit trail
  │
  └── Returns EventRegistration
```

**Entry point:** POST /api/v1/events/admin/registrations/{id}/reject/

---

# 13. Cancel Registration (Staff or User)

**Purpose:** Staff cancels an approved or pending registration.

```text
[Staff/User] → RegistrationService.cancel_registration()
  │
  ├── Validates: Registration is PENDING or APPROVED
  │
  ├── EventRegistration.objects.update()
  │     registration_status = CANCELLED
  │     cancelled_at = now
  │     If was APPROVED: Event.enrolled_count -= 1
  │
  ├── log_action(CANCEL_REGISTRATION)    → Audit trail
  │
  └── Returns EventRegistration
```

**Entry point (staff):** POST /api/v1/events/admin/registrations/{id}/cancel/
**Entry point (user):** POST /api/v1/events/my-registrations/{id}/cancel/

---

# 14. Convert Registration to Tournament Team

**Purpose:** Staff converts an approved registration into a Tournament Team.

```text
[Staff] → RegistrationService.convert_registration_to_team()
  │
  ├── Validates:
  │     - Registration is APPROVED
  │     - Event type is TOURNAMENT
  │     - Team name is unique within tournament
  │     - Tournament is not closed
  │     - max_teams not exceeded
  │
  ├── TournamentTeam.objects.create()
  │     tournament, team_name, registration
  │     organization from registration data
  │
  ├── log_action(CREATE_TEAM)            → Audit trail
  │
  └── Returns TournamentTeam
```

**Entry point:** POST /api/v1/events/admin/registrations/{id}/convert-to-team/

---

# 15. Create Team Manually (Staff)

**Purpose:** Staff creates a Tournament Team without a registration.

```text
[Staff] → TournamentTeamService.create_team()
  │
  ├── Validates:
  │     - Team name unique within tournament
  │     - Tournament not closed
  │     - max_teams not exceeded
  │
  ├── TournamentTeam.objects.create()
  │     tournament, team_name, organization, coach_name
  │     contact_email, contact_phone
  │     wins=0, losses=0, draws=0, points=0
  │
  ├── log_action(CREATE_TEAM)            → Audit trail
  │
  └── Returns TournamentTeam
```

**Entry point:** POST /api/v1/events/admin/tournament-teams/

---

# 16. Schedule Match (Staff)

**Purpose:** Staff creates a match in a tournament.

```text
[Staff] → MatchService.create_match()
  │
  ├── Validates:
  │     - Tournament not closed
  │
  ├── Match.objects.create()
  │     tournament, round, scheduled_at, status = SCHEDULED
  │
  ├── Two empty MatchSides created:
  │     Side A (score=0)
  │     Side B (score=0)
  │
  ├── log_action(CREATE_MATCH)           → Audit trail
  │
  └── Returns Match (with two empty sides)
```

**Entry point:** POST /api/v1/events/admin/matches/

---

# 17. Assign Team to Match Side

**Purpose:** Staff assigns a team to a side of a match.

```text
[Staff] → MatchService.assign_team_to_side()
  │
  ├── Validates:
  │     - Match not COMPLETED or CANCELLED
  │     - Tournament not closed
  │     - Team belongs to the same tournament
  │     - Team not already in this match
  │     - Side (A/B) is valid
  │
  ├── MatchParticipant.objects.create()
  │     match_side, tournament_team
  │
  └── Returns MatchParticipant
```

**Entry point:** POST /api/v1/events/admin/matches/{id}/assign-team/

---

# 18. Record Scores

**Purpose:** Staff records scores for both sides of a match.

```text
[Staff] → MatchService.record_scores()
  │
  ├── Validates:
  │     - Match not COMPLETED or CANCELLED
  │     - Scores >= 0
  │     - Both sides have at least one team assigned
  │
  ├── MatchSide A: score = side_a_score
  ├── MatchSide B: score = side_b_score
  │
  └── Returns Match (with updated scores)
```

**Entry point:** POST /api/v1/events/admin/matches/{id}/record-scores/

---

# 19. Complete Match

**Purpose:** Staff finalizes a match — determines winner and updates tournament statistics.

```text
[Staff] → MatchService.complete_match()
  │
  ├── Validates:
  │     - Match is SCHEDULED or LIVE (not already completed)
  │     - Both sides have teams
  │     - Scores are recorded
  │
  ├── Calculate winning side:
  │     Side A score > Side B score → winner = Side A
  │     Side B score > Side A score → winner = Side B
  │     Equal → no winner (draw)
  │
  ├── Match.objects.update()
  │     status = COMPLETED
  │     completed_at = now
  │     winning_side = winning side (or null for draw)
  │
  ├── RankingService.update_tournament_statistics()
  │     For each team in match:
  │       Side A team(s): wins++ (if won), losses++ (if lost), draws++ (if draw)
  │       Side B team(s): same logic
  │       points: win=3, draw=1, loss=0
  │
  ├── log_action(COMPLETE_MATCH)         → Audit trail
  │
  └── Returns Match
```

**Entry point:** POST /api/v1/events/admin/matches/{id}/complete/

---

# 20. View Standings

**Purpose:** Anyone can view tournament standings (calculated live).

```text
[User] → RankingService.get_standings()
  │
  ├── Queries all teams in tournament
  ├── Orders by: -points, -wins, team_name
  ├── Calculates rank position dynamically
  │
  └── Returns ordered list of TournamentTeams with rank
```

**Public:** GET /api/v1/events/tournaments/{id}/standings/
**Admin:** GET /api/v1/events/admin/tournaments/{id}/standings/

---

# 21. Close/Reopen Tournament

**Purpose:** Staff closes a tournament to prevent modifications, or reopens it.

```text
[Staff] → TournamentService.close_tournament()
  ├── Tournament.objects.update(is_closed = True)
  └── log_action(CLOSE_TOURNAMENT)

[Staff] → TournamentService.reopen_tournament()
  ├── Tournament.objects.update(is_closed = False)
  └── log_action(REOPEN_TOURNAMENT)
```

**Entry points:** POST .../admin/tournaments/{id}/close/ and .../reopen/

---

**Status:** LOCKED

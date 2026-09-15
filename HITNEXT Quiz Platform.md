# HITNEXT Quiz Platform
## Development Workflow & Technical Specification

> **Purpose:** This document is the single source of truth for the coding agent working on the HITNEXT quiz platform.
>
> **Important:** Do not attempt to build the entire application in one step. Follow the development phases sequentially. Complete, test, and verify each phase before moving to the next one.

---

# 1. Project Overview

HITNEXT is a quiz competition platform developed for a college club.

The competition consists of **11 questions**.

A participating team must answer **all 11 questions correctly** to be added to the winners list.

### Core competition rule

> A team can access the next question **only after correctly answering the current question**.

For example:

```text
Question 1
   ↓
Correct
   ↓
Question 2
   ↓
Correct
   ↓
Question 3
   ↓
...
   ↓
Question 11
   ↓
Correct
   ↓
Competition Completed
   ↓
Winners List
```

If a team answers incorrectly:

```text
Question 5
   ↓
Wrong Answer
   ↓
Remain on Question 5
   ↓
Try Again
```

The frontend must never be trusted to enforce this rule.

The **Supabase backend/Edge Functions must be the source of truth**.

---

# 2. Technology Stack

The application should use:

### Frontend

- React
- Vite
- JavaScript/JSX
- Existing landing page should be migrated into React rather than rebuilt unnecessarily.
- CSS/Tailwind may be used depending on the existing project setup.

### Backend / Infrastructure

Use Supabase for:

- PostgreSQL database
- Edge Functions
- Authentication/session management where appropriate
- Row Level Security (RLS)
- Optional Realtime functionality for leaderboard/winners

### No traditional backend

Do not create an Express, Node.js, Django, PHP, or other separately hosted backend unless explicitly requested.

The Supabase Edge Functions act as the server-side backend.

---

# 3. High-Level Architecture

```text
                         HITNEXT
                            │
                            ▼
                    ┌───────────────┐
                    │  React + Vite │
                    │    Frontend   │
                    └───────┬───────┘
                            │
                    Supabase Client
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      Supabase Edge                  Supabase Database
        Functions                     PostgreSQL
             │                             │
             ├── register-team             ├── teams
             ├── get-question              ├── questions
             └── submit-answer             └── submissions
```

The frontend handles:

- UI
- Navigation
- Form inputs
- Displaying questions
- Displaying feedback
- Loading states
- Error states
- Progress display

The backend handles:

- Team registration
- Team identity/session
- Question retrieval
- Answer validation
- Question progression
- Completion status
- Winner timestamp
- Security and authorization

---

# 4. Application Flow

The complete user journey should be:

```text
Landing Page
     │
     ▼
Start Quiz
     │
     ▼
Team Registration
     │
     ▼
Validate Team Name
     │
     ├── Already Exists → Show Error
     │
     └── Available
             │
             ▼
        Create Team
             │
             ▼
      Create Team Session
             │
             ▼
        Question 1
             │
             ▼
        Submit Answer
             │
       ┌─────┴─────┐
       │           │
     Wrong       Correct
       │           │
       ▼           ▼
    Retry       Question 2
                   │
                   ▼
                  ...
                   │
                   ▼
              Question 11
                   │
                   ▼
              Correct Answer
                   │
                   ▼
          Mark Competition Complete
                   │
                   ▼
            Completion Screen
                   │
                   ▼
              Winners List
```

---

# 5. Important Security Principle

The most important architectural rule is:

> **Never trust the React frontend for competition logic.**

The frontend must NOT determine:

- Whether an answer is correct
- Which question the team should receive
- Whether a team has completed the quiz
- Whether a team can skip a question
- Whether a team can access another team's state
- The official completion timestamp

All of these must be controlled server-side.

---

# 6. Question Security

The browser must never receive the correct answers.

Do NOT implement:

```javascript
const questions = [
    {
        question: "What is HTTP?",
        answer: "HyperText Transfer Protocol"
    }
];
```

Do NOT store correct answers in:

- React source code
- Frontend JSON files
- Public environment variables
- Local storage
- Session storage
- Client-side constants

The correct answer must remain server-side.

The Edge Function should retrieve the correct answer and compare it internally.

The client should receive only the information required to display the question.

Example response:

```json
{
    "questionNumber": 4,
    "question": "Which protocol is used for..."
}
```

Never return:

```json
{
    "question": "...",
    "answer": "..."
}
```

---

# 7. Database Design

The initial database should contain three primary tables.

---

## 7.1 `teams`

Purpose: Store participating teams and their current competition state.

Suggested fields:

```text
id
team_name
current_question
completed
started_at
completed_at
created_at
```

Suggested types:

```text
id                  UUID / primary key
team_name           TEXT / UNIQUE / NOT NULL
current_question    INTEGER / NOT NULL
completed           BOOLEAN / NOT NULL
started_at          TIMESTAMP
completed_at        TIMESTAMP
created_at          TIMESTAMP
```

Default values:

```text
current_question = 1
completed = false
```

The database must enforce uniqueness of `team_name`.

Do not rely only on frontend validation.

---

## 7.2 `questions`

Purpose: Store the 11 competition questions.

Suggested fields:

```text
id
question_number
question_text
question_type
options
answer_hash
created_at
```

Suggested types:

```text
id                UUID / primary key
question_number   INTEGER / UNIQUE / NOT NULL
question_text     TEXT / NOT NULL
question_type     TEXT
options           JSONB / nullable
answer_hash       TEXT / NOT NULL
created_at        TIMESTAMP
```

There must be exactly 11 active competition questions.

The system must enforce:

```text
question_number = 1 ... 11
```

Correct answers should preferably be stored as hashes.

If the competition requires case-insensitive or whitespace-insensitive answers, normalize the submitted answer before comparison.

Example normalization:

```text
trim whitespace
convert to lowercase
normalize repeated spaces
```

The exact normalization logic must be consistent with how the answer hash is generated.

---

## 7.3 `submissions`

Purpose: Maintain an audit trail of every answer attempt.

Suggested fields:

```text
id
team_id
question_id
submitted_answer
is_correct
attempt_number
submitted_at
```

Suggested types:

```text
id                UUID / primary key
team_id           UUID / foreign key
question_id       UUID / foreign key
submitted_answer  TEXT
is_correct        BOOLEAN
attempt_number    INTEGER
submitted_at      TIMESTAMP
```

This table is recommended even if the current UI does not display attempt history.

It allows organizers to inspect:

- Number of attempts
- Incorrect answers
- Correct answers
- Completion activity
- Suspicious activity

---

# 8. Team Session / Identity

A team must have a secure way of being identified after registration.

Do not identify a team using only:

```text
team_name
```

For example, do not build:

```text
/api/question?team=ByteBusters
```

because users could modify the team name.

Instead, registration should create a secure team session/token.

Conceptually:

```text
Team Registration
       ↓
Create Team
       ↓
Generate secure session/token
       ↓
Associate session with Team ID
       ↓
Frontend stores session appropriately
       ↓
Subsequent requests identify the team
```

The implementation may use Supabase Auth or a custom secure session mechanism depending on the final architecture.

The coding agent must choose the most secure practical implementation compatible with Supabase.

Do not expose service-role credentials to the frontend.

---

# 9. Edge Functions

The initial backend should contain at least three Edge Functions.

```text
supabase/
└── functions/
    ├── register-team/
    │   └── index.ts
    │
    ├── get-question/
    │   └── index.ts
    │
    └── submit-answer/
        └── index.ts
```

---

# 10. `register-team`

Purpose:

Create a new team and initialize its competition state.

### Input

```json
{
    "teamName": "Byte Busters"
}
```

### Processing

The Edge Function must:

1. Validate request.
2. Validate team name.
3. Normalize team name where appropriate.
4. Check whether the team name already exists.
5. Reject duplicate names.
6. Create a team.
7. Set:
   ```text
   current_question = 1
   completed = false
   ```
8. Set the competition start timestamp.
9. Create/issue the secure team session.
10. Return only the information required by the frontend.

### Duplicate team

If the team already exists:

```json
{
    "success": false,
    "error": "TEAM_NAME_ALREADY_EXISTS"
}
```

Do not create another team.

Database-level uniqueness must still exist as a final protection against race conditions.

---

# 11. `get-question`

Purpose:

Return the question that the authenticated/current team is currently allowed to solve.

### Important rule

The client must NOT specify an arbitrary question number.

Bad:

```json
{
    "questionNumber": 8
}
```

Instead, the Edge Function determines:

```text
team → current_question → question
```

### Processing

```text
Identify team
      ↓
Read current_question
      ↓
Fetch corresponding question
      ↓
Return question only
```

Example response:

```json
{
    "success": true,
    "questionNumber": 5,
    "question": "Which..."
}
```

Do not return:

- `answer_hash`
- Correct answer
- Another team's data
- Future questions

---

# 12. `submit-answer`

This is the most important Edge Function.

Purpose:

Validate the submitted answer and advance the team only when the answer is correct.

### Input

```json
{
    "answer": "HTTP"
}
```

The team identity should come from the secure session/authentication mechanism, not from arbitrary client-supplied team IDs.

---

## Processing

```text
Receive answer
      ↓
Identify team
      ↓
Check team status
      ↓
Read current_question
      ↓
Fetch current question
      ↓
Normalize submitted answer
      ↓
Compare against server-side answer
      ↓
      ┌───────────────┐
      │               │
    WRONG           CORRECT
      │               │
      ▼               ▼
Record attempt    Record attempt
      │               │
      ▼               ▼
Remain on Q       Advance Q
                      │
                      ▼
                Is this Q11?
                 /        \
               NO          YES
                │            │
                ▼            ▼
            Next Q       Mark complete
                              │
                              ▼
                         Record timestamp
```

---

# 13. Wrong Answer Behaviour

If the answer is incorrect:

- Record the submission.
- Increment attempt number if applicable.
- Do NOT change `current_question`.
- Return an appropriate response.

Example:

```json
{
    "success": true,
    "correct": false,
    "message": "Incorrect answer. Try again."
}
```

The frontend should remain on the same question.

---

# 14. Correct Answer Behaviour

If the answer is correct:

For questions 1-10:

```text
current_question += 1
```

Return:

```json
{
    "success": true,
    "correct": true,
    "completed": false,
    "nextQuestion": 6
}
```

For Question 11:

```text
completed = true
completed_at = server timestamp
```

Return:

```json
{
    "success": true,
    "correct": true,
    "completed": true
}
```

The database update must happen server-side.

---

# 15. Atomicity / Race Conditions

The progression logic must be protected against multiple simultaneous submissions.

For example, a malicious or buggy client might submit the same correct answer twice simultaneously.

The system must not allow:

```text
Q5 → Q7
```

because of duplicate requests.

It must only allow:

```text
Q5 → Q6
```

once.

Use appropriate PostgreSQL transaction/update logic or another concurrency-safe mechanism.

The database state must remain authoritative.

---

# 16. Refresh Behaviour

Refreshing the browser must NOT reset quiz progress.

Example:

```text
Team is on Q7
       ↓
Browser refresh
       ↓
React reloads
       ↓
Session remains valid
       ↓
get-question
       ↓
Database says Q7
       ↓
Display Q7
```

Do not rely solely on React state for quiz progress.

The database is the source of truth.

---

# 17. Question Skipping Protection

A participant must never be able to directly access:

```text
Question 5
Question 6
Question 7
...
```

unless their database state permits it.

If the team is currently on Question 3:

```text
current_question = 3
```

then:

```text
Question 3 → allowed
Question 4 → not directly accessible
Question 5 → not directly accessible
Question 11 → not accessible
```

The `get-question` function should always return the team's current question.

---

# 18. Completion Logic

When Question 11 is answered correctly:

```text
teams.completed = true
teams.completed_at = server_timestamp
```

The completion timestamp should come from the database/server, not the user's browser.

This timestamp can later be used to rank winners.

---

# 19. Winners List

The winners list should contain only teams where:

```text
completed = true
```

Recommended ordering:

```sql
ORDER BY completed_at ASC
```

This means the first team to successfully complete all 11 questions appears first.

Example:

```text
HITNEXT WINNERS

1. Byte Busters       11:42:17
2. Code Blooded       11:44:03
3. 404 Not Found      11:46:51
```

The exact ranking rules should remain configurable.

---

# 20. React Application Structure

Suggested structure:

```text
src/
│
├── pages/
│   ├── Landing.jsx
│   ├── Register.jsx
│   ├── Quiz.jsx
│   ├── Completed.jsx
│   └── Winners.jsx
│
├── components/
│   ├── QuestionCard.jsx
│   ├── AnswerInput.jsx
│   ├── ProgressBar.jsx
│   ├── LoadingState.jsx
│   └── ErrorMessage.jsx
│
├── lib/
│   └── supabase.js
│
├── hooks/
│   └── useQuiz.js
│
├── App.jsx
└── main.jsx
```

This structure can be adjusted based on the existing project.

Do not unnecessarily rewrite existing working UI.

---

# 21. Frontend Routes

Recommended routes:

```text
/                  → Landing Page

/register          → Team Registration

/quiz              → Current Quiz Question

/completed         → Completion Screen

/winners            → Winners List
```

If a participant has no valid session:

```text
/quiz
   ↓
No valid team session
   ↓
Redirect to /register
```

If a team is already completed:

```text
/quiz
   ↓
completed = true
   ↓
Redirect to /completed
```

---

# 22. Quiz UI

The quiz page should show:

```text
HITNEXT

Question 5 / 11

[ Question text ]

[ Answer input ]

[ SUBMIT ]

Incorrect answer. Try again.
```

The UI should include:

- Current question number
- Total questions
- Question
- Answer input
- Submit button
- Loading state
- Correct/incorrect feedback
- Error handling
- Progress indicator

Do not show future questions.

---

# 23. Registration UI

The registration page should contain:

```text
HITNEXT

TEAM REGISTRATION

Team Name

[_____________________]

[ CONTINUE ]
```

Requirements:

- Validate empty input.
- Validate reasonable team-name length.
- Handle duplicate names.
- Prevent repeated submissions while request is processing.
- Show loading state.
- Handle backend errors.
- On success, initialize the team session and move to the quiz.

---

# 24. Error Handling

The frontend must gracefully handle:

### Registration errors

```text
Team name already exists
Invalid team name
Network error
Server error
```

### Quiz errors

```text
Session expired
Unable to load question
Unable to submit answer
Competition already completed
Server unavailable
```

Do not expose raw backend errors or sensitive database information to users.

---

# 25. Loading States

Every network operation must have an appropriate loading state.

Examples:

```text
Registering team...
Loading question...
Checking answer...
```

Prevent duplicate button submissions while a request is active.

---

# 26. Environment Variables

Frontend environment variables may contain only public Supabase information.

Example:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
```

or any other privileged secret to React.

Edge Functions may use server-side secrets where necessary.

---

# 27. Row Level Security

Supabase RLS must be configured carefully.

The default assumption should be:

> Participants should not have unrestricted direct access to the database.

Do not expose the `questions` table in a way that allows the browser to retrieve:

```text
answer_hash
```

or other sensitive fields.

The coding agent should review every table policy and verify what an anonymous/client user can read or modify.

Prefer controlled Edge Function access for sensitive operations.

---

# 28. Competition Timer

A timer may be added later.

If a timer is implemented, do NOT rely on client-side JavaScript as the authoritative timer.

Bad:

```javascript
setInterval(() => {
    time--;
}, 1000);
```

The server/database should store:

```text
started_at
```

and calculate elapsed time using server-side time.

The frontend timer should only be a visual representation.

---

# 29. Anti-Cheat Requirements

The initial version should protect against the following:

### Must prevent

- Accessing future questions
- Skipping questions
- Reading correct answers through frontend source
- Changing team ID manually
- Changing question number manually
- Advancing question through client-side code
- Marking oneself as completed
- Modifying completion timestamp
- Resetting progress by refreshing
- Creating duplicate team names
- Submitting answers for another team

### Recommended later

- Rate limiting
- Submission cooldown
- Suspicious activity logging
- Admin monitoring
- Team/session invalidation
- Competition start/end controls

---

# 30. Development Phases

The coding agent MUST work in phases.

Do not implement all phases simultaneously.

Each phase must be completed and tested before proceeding.

---

## PHASE 0: Existing Project Audit

### Objective

Understand the current project before making changes.

### Tasks

- Inspect existing repository.
- Identify current HTML/CSS/JS structure.
- Identify existing landing page.
- Identify assets.
- Identify existing dependencies.
- Identify current deployment configuration.
- Identify whether anything should be preserved exactly.
- Document findings.

### Deliverable

A short implementation plan based on the existing codebase.

### Rule

Do not rewrite the existing landing page blindly.

---

# PHASE 1: React Migration

### Objective

Move the existing frontend into React/Vite.

### Tasks

- Initialize/configure React + Vite if required.
- Migrate existing landing page.
- Preserve visual design and existing functionality.
- Establish component structure.
- Establish routing.
- Create Supabase client configuration.
- Configure environment variables.

### Acceptance criteria

- Landing page looks and behaves correctly.
- React application runs successfully.
- Routes work.
- Supabase client can connect.
- No secrets are exposed.

Do not begin backend quiz functionality until this phase works.

---

# PHASE 2: Supabase Database

### Objective

Create the secure database foundation.

### Tasks

Create:

```text
teams
questions
submissions
```

Implement:

- Primary keys
- Foreign keys
- Unique constraints
- Required fields
- Timestamps
- Appropriate indexes
- RLS policies

Insert/test the 11 questions.

### Acceptance criteria

- Database schema works.
- Duplicate team names are rejected.
- Questions can be retrieved server-side.
- Correct answers are not publicly accessible.
- Submission relationships work.
- RLS has been reviewed and tested.

---

# PHASE 3: Team Registration

### Objective

Build secure team registration.

### Tasks

- Build `/register`.
- Implement `register-team` Edge Function.
- Validate team name.
- Check duplicate team.
- Create team.
- Initialize question state.
- Create team session.
- Persist session.
- Redirect to quiz.

### Acceptance criteria

Test:

```text
New team → succeeds

Duplicate team → rejected

Empty team name → rejected

Refresh → session remains valid

Invalid session → cannot access quiz
```

---

# PHASE 4: Quiz Question Retrieval

### Objective

Allow teams to retrieve only the question they are currently allowed to solve.

### Tasks

- Build `get-question`.
- Identify current team.
- Read `current_question`.
- Fetch corresponding question.
- Return only safe question data.
- Build Quiz page.
- Display progress.

### Acceptance criteria

For a team on Q3:

```text
get-question → Q3
```

It must NOT return:

```text
Q4
Q5
Q6
...
Q11
```

Correct answer must not reach the browser.

---

# PHASE 5: Answer Submission

### Objective

Implement the central competition logic.

### Tasks

- Build `submit-answer`.
- Identify team.
- Determine current question.
- Normalize answer.
- Validate answer server-side.
- Record submission.
- Keep team on same question after incorrect answer.
- Advance only after correct answer.
- Handle Q11 completion.
- Protect against duplicate/concurrent submissions.

### Acceptance criteria

Test:

```text
Q1 wrong → remain Q1

Q1 correct → move Q2

Q5 wrong → remain Q5

Q5 correct → move Q6

Q11 wrong → remain Q11

Q11 correct → completed = true
```

Also test repeated/parallel requests.

---

# PHASE 6: Completion & Winners

### Objective

Create the post-competition experience.

### Tasks

- Build `/completed`.
- Store completion timestamp.
- Build `/winners`.
- Retrieve completed teams.
- Sort by completion timestamp.
- Display ranking.

### Acceptance criteria

Only:

```text
completed = true
```

teams appear on the winners list.

Completion ordering must be server/database based.

---

# PHASE 7: Security Testing

This phase is mandatory.

Attempt to break the system intentionally.

Test:

### Frontend manipulation

Try changing:

```text
question number
team ID
completion status
```

### API manipulation

Try calling Edge Functions with:

- Missing session
- Invalid session
- Another team's ID
- Arbitrary question numbers
- Empty answers
- Malformed payloads

### Database access

Verify that a normal client cannot retrieve:

```text
correct answers
answer hashes
other teams' private state
```

### Quiz bypass

Attempt:

```text
Q1 → Q11
```

without correctly solving Q2-Q10.

This must fail.

### Duplicate submission

Send the same correct answer multiple times simultaneously.

The team must advance only once.

---

# PHASE 8: UI/UX Polish

Only after functionality and security are stable.

Improve:

- Animations
- Transitions
- Loading states
- Error messages
- Mobile responsiveness
- Accessibility
- Button states
- Question transitions
- Completion experience
- Winners page

Do not sacrifice security or functionality for visual effects.

---

# PHASE 9: Deployment & Final Testing

### Tasks

- Build production React application.
- Deploy frontend.
- Deploy Supabase Edge Functions.
- Configure production environment variables.
- Verify database policies.
- Test production endpoints.
- Test registration.
- Test complete 11-question flow.
- Test winners list.
- Test mobile devices.
- Test multiple simultaneous teams.

### Final acceptance test

Run at least:

```text
Team A
Q1 ✓
Q2 ✓
Q3 ✗
Q3 ✓
...
Q11 ✓
→ Winner

Team B
Q1 ✓
Q2 ✓
...
→ Winner

Team A refreshes
→ Progress preserved

Attempt to skip Q
→ Blocked

Attempt to read answer
→ Blocked

Duplicate team
→ Blocked
```

---

# 31. Coding Agent Rules

The coding agent must follow these rules throughout development.

### Rule 1

Do not implement future phases before the current phase is tested.

### Rule 2

Do not expose correct answers to the frontend.

### Rule 3

Do not trust client-side state for competition logic.

### Rule 4

Do not use team names as authentication.

### Rule 5

Do not expose Supabase service-role credentials.

### Rule 6

Do not allow the client to directly modify:

```text
current_question
completed
completed_at
```

### Rule 7

Do not allow direct access to future questions.

### Rule 8

Use server/database timestamps for competition events.

### Rule 9

Handle race conditions in answer submission.

### Rule 10

Preserve existing working UI wherever practical.

### Rule 11

Do not introduce unnecessary dependencies.

### Rule 12

After every major phase, report:

```text
Phase completed
Changes made
Files changed
Tests performed
Known issues
Next phase
```

---

# 32. Definition of Done

The HITNEXT platform is considered complete only when:

- [ ] Landing page works in React.
- [ ] Team registration works.
- [ ] Duplicate team names are prevented.
- [ ] Secure team identity/session exists.
- [ ] Question 1-11 are stored in Supabase.
- [ ] Correct answers remain server-side.
- [ ] Teams can only retrieve their current question.
- [ ] Wrong answers do not advance the team.
- [ ] Correct answers advance the team.
- [ ] Question 11 completes the competition.
- [ ] Completion timestamp is server-generated.
- [ ] Winners list works.
- [ ] Refresh does not reset progress.
- [ ] Future question access is blocked.
- [ ] Client-side manipulation cannot bypass questions.
- [ ] Other teams' data cannot be accessed.
- [ ] Service-role credentials are never exposed.
- [ ] RLS has been tested.
- [ ] Edge Functions handle malformed requests.
- [ ] Duplicate/concurrent answer submissions are handled safely.
- [ ] Mobile UI works.
- [ ] Production deployment works.

---

# 33. Final Architecture

The intended final system should look like:

```text
                         ┌──────────────────┐
                         │    HITNEXT       │
                         │   React + Vite   │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │ Supabase Client  │
                         └────────┬─────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
          register-team     get-question    submit-answer
          Edge Function     Edge Function   Edge Function
                 │                │                │
                 └────────────────┼────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    PostgreSQL    │
                         │                  │
                         │ teams            │
                         │ questions        │
                         │ submissions      │
                         └──────────────────┘
```

The fundamental rule of the entire architecture is:

```text
                 FRONTEND
                    │
             "What should I show?"
                    │
                    ▼
              SUPABASE BACKEND
                    │
             "What is allowed?"
                    │
                    ▼
                DATABASE
                    │
             "What is true?"
```

**React controls the experience.  
Edge Functions enforce the rules.  
PostgreSQL stores the authoritative state.**
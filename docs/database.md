# Project Molip Database Design

## 1. Database Principle

Molip stores only raw user records.

AI analysis, interpretation, pattern discovery, and recommendation are handled in the Service Layer.

Database should answer:

- What did the user record?
- When did the user record it?
- What did the user react to?
- Which tags were attached?

Database should not decide:

- What the user is good at
- What the user should do
- What the user's immersion pattern means

---

## 2. Core Concept

Project Molip helps users discover what they repeatedly react to.

Core question:

> What do you repeatedly react to?

MVP flow:

1. User writes a 1-minute daily log
2. User optionally selects reaction tags
3. System stores raw record
4. AI analyzes repeated signals in the service layer

---

## 3. Tables

### users

Stores Molip user profile.

### daily_logs

Stores the user's raw daily record.

### reaction_tags

Stores predefined or user-created reaction tags.

Examples:

- curiosity
- anger
- joy
- envy
- discomfort
- obsession
- energy
- avoidance

### log_reaction_tags

Many-to-many relation between daily logs and reaction tags.

---

## 4. Design Rule

AI-generated analysis should not be stored in Sprint 1.

Later, if needed, we may add:

- ai_insights
- weekly_reports
- immersion_patterns
- recommended_actions
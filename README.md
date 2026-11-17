# HealthCredit

A small healthcare claims portal that makes it easier to follow a claim from submission to review.

HealthCredit started as a payment planner and grew into a claims workflow demo. The current version brings together coverage estimates, claim tracking, and a reviewer workspace. It is a portfolio project for exploring healthcare software workflows.

## What you can try

- Submit a fictional medical bill and see a coverage estimate immediately.
- Search claims by provider, invoice reference, or claim ID.
- Filter claims by their current status.
- Move a claim from Submitted to Under review, then approve or reject it.
- Read the notes and timestamps recorded for each status change.
- See claim totals and estimated approved coverage on the overview page.

The app includes three sample claims so there is something to explore on your first visit.

## Run it locally

You need Python 3 and a modern browser. There are no packages to install or build commands to run.

From the project folder, run:

```bash
python3 -m http.server 8000 
```

On Windows, you can use:

```powershell
py -m http.server 8000 
```

Open http://localhost:8000 in your browser. The pages use relative links so the same files also work on GitHub Pages.

## Walk through a claim

1. Open Submit claim and enter a fictional provider and a unique invoice reference.
2. Choose Diagnostics and enter a bill amount of ₹10,000.
3. The sample policy estimates ₹7,200 in coverage and ₹2,800 as the member share.
4. Submit the claim and open Review workspace.
5. Find the claim, add a note, and select Start review.
6. Add another note and approve or reject the claim.
7. Return to My claims to see the decision and activity history.

Repeated invoice references are checked without regard to letter case. Future service dates are blocked by the form. A review note is required for each reviewer action.

## How the sample policy works

The calculation is intentionally simple so its behaviour is easy to understand.

```text
coverage = min(50,000, max(0, bill amount - 1,000) × 0.80)
member share = bill amount - coverage
```

Dental care has zero coverage under this fictional policy. The deductible and cap apply independently to each claim. An approval is a simulated decision, and the coverage amount remains an estimate.

These rules are made up for the demo and do not represent an insurer's policy.

## Project files

| File | Purpose |
| --- | --- |
| index.html | Overview, policy summary, and recent claims |
| application.html | Claim submission and live coverage estimate |
| claims.html | Searchable claim tracking |
| admin.html | Simulated reviewer workspace |
| planner.html | Redirect from the earlier payment planner |
| app.js | Calculations, validation, storage, and review workflow |
| style.css | Shared responsive layout and styling |

## Built with

HTML, CSS, and vanilla JavaScript. Browser localStorage stores the claim records under hc-claims-v1. The interface uses native form validation and dialog elements.

Each claim holds its bill details, current status, and an activity history. Reviewer actions read the latest saved record before updating it. Changes from another tab refresh the claim table through the browser storage event.

## Current limits

This version is a frontend demo. Data stays in the browser and does not sync between devices. Anyone using the demo can open the reviewer page. There is no authenticated role system, backend database, document upload, insurer integration, or payment processing.

Use fictional information only. Browser storage can be edited or cleared, and simultaneous writes from multiple tabs are not transaction-safe.

The public demo is published through GitHub Pages. You can also run the repository locally.

## Checks completed

JavaScript syntax, internal navigation targets, coverage boundary cases, and saved claim updates were checked during development. Full browser interaction and accessibility testing remain to be completed.

## Possible next steps

- Add a backend API and database for shared, durable records.
- Implement member and reviewer authentication with server-side permissions.
- Add transactional updates and stronger duplicate-submission handling.
- Add end-to-end tests for submission and review.
- Introduce document handling with suitable access controls.

## About

An independent healthcare technology portfolio project by Prashant Gangwar. HealthCredit has no affiliation with Optum or an insurance provider.

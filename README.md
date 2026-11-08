# Fintech Dashboard

A responsive, browser-based personal finance dashboard built with plain HTML, CSS, and JavaScript. It has no build step, no package dependencies, and no backend.

**Live demo:** https://tech-x-ventures.github.io/pocket/

## Features

- Dashboard with balances, budgets, spending charts, transactions, and a profile photo.
- Editable dashboard details, budget, and manually added accounts.
- Add-money and transfer actions that update the balance and transaction list (simulated, no real money moves).
- Transaction search and sorting, plus CSV export.
- Currency selector and converter with currency and country/region labels.
- Live exchange rates from [open.er-api.com](https://open.er-api.com/). The converter says when a rate is unavailable.
- Keyboard-friendly dialogs, labelled controls, and reduced-motion support.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a recent version of Chrome, Edge, Firefox, or Safari.

For live exchange rates the browser needs an internet connection. If the rate service is unavailable, the three tracked currencies use their last saved rates and other conversions show "Rate unavailable".

## Data and limitations

- Dashboard details, budgets, accounts, and the profile photo are stored in the browser'"'"'s `localStorage` on the current device and browser profile. Profile photos are downscaled to a small JPEG before saving.
- There is no server, user authentication, or cloud sync. Browser-local data is not protected as private account data.
- Bank connections and real money transfers are not supported. Do not enter bank credentials.
- Exchange rates may be delayed or unavailable and must not be used as financial advice or for real transactions.

## Exchange-rate data

Rates come from the free Open Access endpoint of [ExchangeRate-API](https://www.exchangerate-api.com). It updates once per day, is rate limited, and requires attribution, which is why the page footer links back to them. See their [terms](https://www.exchangerate-api.com/terms).

## Manual smoke test

There are no automated tests yet. Before merging a change, run through this list:

| Run | Expect | Check |
| --- | --- | --- |
| Open `index.html` with DevTools open | Dashboard renders; converter status changes from "Loading exchange rates…" to "Updated … · open.er-api.com" | No red errors in the Console |
| DevTools → Network → Offline, then reload | Page still renders; converter shows a saved rate or "Rate unavailable" | No uncaught errors |
| Switch the dashboard currency to EUR, then click **Sort by** twice | Amounts show € and reorder by size | No `NaN` or leftover `$` signs |
| Click **Transfer**, enter `412.80`, then open **Edit details** and save | Saves without a validation error | Balance is `807.36`, not `807.3600000000001` |
| In the Console run `localStorage.setItem("fintech-dashboard-details", "{bad")`, then reload | Dashboard loads with defaults and shows a storage notice | No `TypeError` |

## Project files

- `index.html`: dashboard structure.
- `styles.css`: layout and styling.
- `script.js`: interactions, local persistence, and currency conversion.

## Roadmap

- Derive budget, charts, and trends from the transaction list instead of separate numbers.
- Automated tests and a CI workflow.
- Split `script.js` into ES modules.


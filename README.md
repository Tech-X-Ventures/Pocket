# Fintech Dashboard

A responsive, browser-based personal finance dashboard built with plain HTML, CSS, and JavaScript. It has no build step or package dependencies.

## Features

- Dashboard with balances, budgets, spending charts, transactions, and profile photo upload.
- Editable dashboard details, accounts, and budgets.
- Currency selector and converter with currency and country/region labels.
- Live exchange rates loaded from [open.er-api.com](https://open.er-api.com/). The converter reports when a rate is unavailable.
- Search and sorting for transactions.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a browser.

For live exchange rates, the browser needs an internet connection. If the rate service is unavailable, the dashboard uses saved rates when available and indicates unavailable conversions.

## Data and limitations

- Dashboard details, budgets, accounts, and profile photos are stored in the browser's `localStorage` on the current device and browser profile.
- This project has no server, user authentication, or cloud sync. Browser-local data is not protected as private account data.
- Bank connections and real money transfers are not supported. Do not enter bank credentials.
- Exchange rates come from an external service and may be delayed or unavailable. They should not be used as financial advice or for real transactions.

## Project files

- `index.html` — dashboard structure.
- `styles.css` — layout and styling.
- `script.js` — interactions, local persistence, and currency conversion.

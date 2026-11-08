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

## License

[MIT](LICENSE)
EOF
cat > /mnt/user-data/outputs/LICENSE <<'"'"'EOF'"'"'
MIT License

Copyright (c) 2026 Tech-X-Ventures

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
sed -i "s/\r*$/\r/" /mnt/user-data/outputs/README.md
cd /tmp/t && sed -i "s#fs.readFileSync(\"/tmp/orig/index.html\"#fs.readFileSync(\"/mnt/user-data/outputs/index.html\"#" run.js
echo "=== regression run on NEW index.html (patched script lines only) ==="; node run.js 2>&1 | grep -E "PATCHED|^[0-9]+ " | head -40
echo "=== static checks ==="
cd /mnt/user-data/outputs
grep -c "Rates By Exchange Rate API" index.html | sed "s/^/footer attribution links: /"
grep -c "rel=\"icon\"" index.html | sed "s/^/favicon tags: /"
grep -c "site-footer" styles.css | sed "s/^/footer css rules: /"
node --check script.js && echo "script.js syntax ok"
ls -la'

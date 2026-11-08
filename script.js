const balanceValue = document.querySelector(".balance-value");
const cardAmount = document.querySelector(".card-amount");
const transactionList = document.querySelector(".transactions-list");
const searchInput = document.querySelector(".search-box input");
const menuButton = document.querySelector(".menu-icon");
const sidebar = document.querySelector(".sidebar");
const dashboardShell = document.querySelector(".dashboard-shell");
let dataNotice = document.querySelector(".data-notice");

// Keep every stored amount at two decimals (avoids values like 807.3600000000001).
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const scrollBehavior = () => (
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
);

let balance = 0; // set from dashboardDetails below
let sortMode = "default";
let balancesHidden = false;
let budgetLimit = 500;
let savedAccounts = [];
const today = new Date();
const monthShort = new Intl.DateTimeFormat("en-US", { month: "short" });
const recentMonthLabels = Array.from({ length: 6 }, (_, i) => (
  monthShort.format(new Date(today.getFullYear(), today.getMonth() - 5 + i, 1)).toUpperCase()
));
const defaultDashboardDetails = {
  version: 1,
  greeting: "Good morning",
  name: "Alex",
  subtitle: "Here's an overview of your finances",
  period: new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(today),
  currency: "USD",
  manualRates: false,
  balance: 1220.16,
  savings: 12600,
  savingsPeriod: "this month",
  budgetSpent: 184.5,
  budgetLimit: 500,
  spendingMonths: [300, 480, 660, 580, 800, 1000].map((amount, i) => ({ label: recentMonthLabels[i], amount })),
  rates: [
    { currency: "EUR", value: 0.926, change: 0.12 }, // units per USD (fallback only; live feed overrides)
    { currency: "TRY", value: 44.32, change: 0.12 },
    { currency: "CNY", value: 7.09, change: 0.08 },
  ],
  transactions: [
    { name: "Spotify Premium", category: "Subscription", amount: -9.99, time: "2:56 PM" },
    { name: "Nike", category: "Shopping", amount: -128, time: "1:14 PM" },
    { name: "United Airlines", category: "Travel", amount: -412.8, time: "10:32 AM" },
  ],
  trendCategories: ["Travel", "Eating out"],
  trendSeries: [
    [20, 42, 38, 58, 45, 70],
    [30, 48, 36, 55, 62, 82],
  ],
};
const currencyCountries = {
  AED: ["United Arab Emirates"], AFN: ["Afghanistan"], ALL: ["Albania"], AMD: ["Armenia"],
  ANG: ["Curaçao", "Sint Maarten"], AOA: ["Angola"], ARS: ["Argentina"],
  AUD: ["Australia", "Christmas Island", "Cocos (Keeling) Islands", "Kiribati", "Nauru", "Norfolk Island", "Tuvalu"],
  AWG: ["Aruba"], AZN: ["Azerbaijan"], BAM: ["Bosnia and Herzegovina"], BBD: ["Barbados"],
  BDT: ["Bangladesh"], BGN: ["Bulgaria"], BHD: ["Bahrain"], BIF: ["Burundi"], BMD: ["Bermuda"],
  BND: ["Brunei"], BOB: ["Bolivia"], BRL: ["Brazil"], BSD: ["Bahamas"], BTN: ["Bhutan"],
  BWP: ["Botswana", "Zimbabwe"], BYN: ["Belarus"], BZD: ["Belize"], CAD: ["Canada"],
  CDF: ["Democratic Republic of the Congo"], CHF: ["Liechtenstein", "Switzerland"], CLF: ["Chile"],
  CLP: ["Chile"], CNH: ["China"], CNY: ["China", "Zimbabwe"], COP: ["Colombia"], CRC: ["Costa Rica"],
  CUC: ["Cuba"], CUP: ["Cuba"], CVE: ["Cabo Verde"], CZK: ["Czechia"], DJF: ["Djibouti"],
  DKK: ["Denmark", "Faroe Islands", "Greenland"], DOP: ["Dominican Republic"],
  DZD: ["Algeria", "Western Sahara"], EGP: ["Egypt", "Palestine"], ERN: ["Eritrea"],
  ETB: ["Ethiopia"],
  EUR: ["Andorra", "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Estonia", "Finland", "France",
    "French Guiana", "French Southern and Antarctic Lands", "Germany", "Greece", "Guadeloupe", "Ireland",
    "Italy", "Kosovo", "Latvia", "Lithuania", "Luxembourg", "Malta", "Martinique", "Mayotte", "Monaco",
    "Montenegro", "Netherlands", "Portugal", "Réunion", "Saint Barthélemy", "Saint Martin",
    "Saint Pierre and Miquelon", "San Marino", "Slovakia", "Slovenia", "Spain", "Vatican City",
    "Åland Islands"],
  FJD: ["Fiji"], FKP: ["Falkland Islands"], FOK: ["Faroe Islands"],
  GBP: ["Guernsey", "Isle of Man", "Jersey", "Saint Helena", "United Kingdom", "Zimbabwe"],
  GEL: ["Georgia"], GGP: ["Guernsey"], GHS: ["Ghana"], GIP: ["Gibraltar"], GMD: ["The Gambia"],
  GNF: ["Guinea"], GTQ: ["Guatemala"], GYD: ["Guyana"], HKD: ["Hong Kong"], HNL: ["Honduras"],
  HRK: ["Croatia"], HTG: ["Haiti"], HUF: ["Hungary"], IDR: ["Indonesia"], ILS: ["Israel", "Palestine"],
  IMP: ["Isle of Man"], INR: ["Bhutan", "India", "Zimbabwe"], IQD: ["Iraq"], IRR: ["Iran"],
  ISK: ["Iceland"], JEP: ["Jersey"], JMD: ["Jamaica"], JOD: ["Jordan", "Palestine"],
  JPY: ["Japan", "Zimbabwe"], KES: ["Kenya"], KGS: ["Kyrgyzstan"], KHR: ["Cambodia"],
  KID: ["Kiribati"], KMF: ["Comoros"], KPW: ["North Korea"], KRW: ["South Korea"],
  KWD: ["Kuwait"], KYD: ["Cayman Islands"], KZT: ["Kazakhstan"], LAK: ["Laos"], LBP: ["Lebanon"],
  LKR: ["Sri Lanka"], LRD: ["Liberia"], LSL: ["Lesotho"], LYD: ["Libya"], MAD: ["Morocco", "Western Sahara"],
  MDL: ["Moldova"], MGA: ["Madagascar"], MKD: ["North Macedonia"], MMK: ["Myanmar"],
  MNT: ["Mongolia"], MOP: ["Macau"], MRU: ["Mauritania", "Western Sahara"], MUR: ["Mauritius"],
  MVR: ["Maldives"], MWK: ["Malawi"], MXN: ["Mexico"], MYR: ["Malaysia"], MZN: ["Mozambique"],
  NAD: ["Namibia"], NGN: ["Nigeria"], NIO: ["Nicaragua"], NOK: ["Norway", "Svalbard and Jan Mayen"],
  NPR: ["Nepal"], NZD: ["Cook Islands", "New Zealand", "Niue", "Tokelau"], OMR: ["Oman"],
  PAB: ["Panama"], PEN: ["Peru"], PGK: ["Papua New Guinea"], PHP: ["Philippines"], PKR: ["Pakistan"],
  PLN: ["Poland"], PYG: ["Paraguay"], QAR: ["Qatar"], RON: ["Romania"], RSD: ["Serbia"],
  RUB: ["Russia"], RWF: ["Rwanda"], SAR: ["Saudi Arabia"], SBD: ["Solomon Islands"],
  SCR: ["Seychelles"], SDG: ["Sudan"], SEK: ["Sweden"], SGD: ["Brunei", "Singapore"],
  SHP: ["Saint Helena", "South Georgia"], SLE: ["Sierra Leone"], SLL: ["Sierra Leone"],
  SOS: ["Somalia"], SRD: ["Suriname"], SSP: ["South Sudan"], STN: ["São Tomé and Príncipe"],
  SVC: ["El Salvador"], SYP: ["Syria"], SZL: ["Eswatini"], THB: ["Thailand"], TJS: ["Tajikistan"],
  TMT: ["Turkmenistan"], TND: ["Tunisia"], TOP: ["Tonga"], TRY: ["Türkiye"], TTD: ["Trinidad and Tobago"],
  TVD: ["Tuvalu"], TWD: ["Taiwan"], TZS: ["Tanzania"], UAH: ["Ukraine"], UGX: ["Uganda"],
  USD: ["American Samoa", "Bahamas", "British Virgin Islands", "Cambodia", "Ecuador", "El Salvador",
    "Guam", "Marshall Islands", "Micronesia", "Palau", "Panama", "Puerto Rico", "Timor-Leste",
    "Turks and Caicos Islands", "United States", "United States Virgin Islands", "Zimbabwe"],
  UYU: ["Uruguay"], UZS: ["Uzbekistan"], VES: ["Venezuela"], VND: ["Vietnam"], VUV: ["Vanuatu"],
  WST: ["Samoa"], XAF: ["Cameroon", "Central African Republic", "Chad", "Republic of the Congo",
    "Equatorial Guinea", "Gabon"],
  XCD: ["Anguilla", "Antigua and Barbuda", "Dominica", "Grenada", "Montserrat", "Saint Kitts and Nevis",
    "Saint Lucia", "Saint Vincent and the Grenadines"],
  XCG: ["Curaçao", "Sint Maarten"], XDR: ["International Monetary Fund"], XOF: ["Benin", "Burkina Faso",
    "Guinea-Bissau", "Ivory Coast", "Mali", "Niger", "Senegal", "Togo"],
  XPF: ["French Polynesia", "New Caledonia", "Wallis and Futuna"], XSU: ["ALBA countries"],
  YER: ["Yemen"], ZAR: ["Eswatini", "Lesotho", "Namibia", "South Africa", "Zimbabwe"],
  ZMW: ["Zambia"], ZWG: ["Zimbabwe"], ZWL: ["Zimbabwe"],
};
let dashboardDetails = structuredClone(defaultDashboardDetails);
let liveRates = {};
let rateStatus = "Loading exchange rates…";

function getSupportedCurrencies() {
  const currencies = new Set(["USD"]);
  const liveCodes = Object.keys(liveRates);
  if (liveCodes.length) {
    // Once live rates load, only offer currencies that can actually be converted.
    liveCodes.forEach((currency) => currencies.add(currency));
  } else if (typeof Intl.supportedValuesOf === "function") {
    Intl.supportedValuesOf("currency").forEach((currency) => currencies.add(currency));
  }
  dashboardDetails.rates.forEach((rate) => currencies.add(rate.currency));
  currencies.add(dashboardDetails.currency);
  return ["USD", ...[...currencies].filter((currency) => currency !== "USD").sort()];
}

function showStorageMessage(message) {
  if (!dataNotice) {
    // index.html has no notice element, so create one on demand (styled by .data-notice).
    dataNotice = document.createElement("section");
    dataNotice.className = "data-notice";
    const badge = document.createElement("strong");
    badge.textContent = "Storage";
    dataNotice.append(badge);
    const topbar = document.querySelector(".topbar");
    if (topbar) topbar.after(dataNotice);
    else document.body.prepend(dataNotice);
  }
  let status = dataNotice.querySelector(".storage-status");
  if (!status) {
    status = document.createElement("p");
    status.className = "storage-status";
    status.setAttribute("role", "status");
    dataNotice.append(status);
  }
  status.textContent = message;
}

function readLocalValue(key, fallback, validate = () => true) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    const parsed = JSON.parse(value);
    if (!validate(parsed)) throw new TypeError(`Invalid saved value for ${key}.`);
    return parsed;
  } catch (error) {
    console.error(`Could not read ${key} from this browser.`, error);
    showStorageMessage("Some preferences could not be loaded from this browser.");
    return fallback;
  }
}

function saveLocalValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Could not save ${key} in this browser.`, error);
    showStorageMessage("Your latest change works for this visit but could not be saved in this browser.");
    return false;
  }
}

const legacyBudgetLimit = readLocalValue("fintech-dashboard-budget", null, (value) => (
  Number.isFinite(value) && value > 0
));
savedAccounts = readLocalValue("fintech-dashboard-accounts", [], (value) => (
  Array.isArray(value) && value.every((account) => (
    account && typeof account.name === "string" && Number.isFinite(account.balance)
  ))
));
const loadedDetails = readLocalValue(
  "fintech-dashboard-details",
  null,
  (value) => value && typeof value === "object"
    && (value.version === undefined || Number.isInteger(value.version))
    && typeof value.greeting === "string"
    && typeof value.name === "string"
    && typeof value.subtitle === "string"
    && typeof value.period === "string"
    && /^[A-Z]{3}$/.test(value.currency)
    && Number.isFinite(value.balance)
    && Number.isFinite(value.savings)
    && typeof value.savingsPeriod === "string"
    && Number.isFinite(value.budgetSpent)
    && Number.isFinite(value.budgetLimit)
    && Array.isArray(value.spendingMonths)
    && value.spendingMonths.length === 6
    && value.spendingMonths.every((item) => item && typeof item.label === "string" && Number.isFinite(item.amount))
    && Array.isArray(value.rates)
    && value.rates.length === 3
    && value.rates.every((item) => item && typeof item.currency === "string" && Number.isFinite(item.value) && item.value > 0 && Number.isFinite(item.change))
    && (value.manualRates === undefined || typeof value.manualRates === "boolean")
    && Array.isArray(value.transactions)
    && value.transactions.every((item) => item && typeof item.name === "string" && typeof item.category === "string" && Number.isFinite(item.amount) && typeof item.time === "string")
    && Array.isArray(value.trendCategories)
    && value.trendCategories.length === 2
    && value.trendCategories.every((item) => typeof item === "string")
    && Array.isArray(value.trendSeries)
    && value.trendSeries.length === 2
    && value.trendSeries.every((series) => Array.isArray(series) && series.length === 6 && series.every(Number.isFinite))
);
if (loadedDetails) {
  dashboardDetails = loadedDetails;
} else if (legacyBudgetLimit !== null) {
  // Older versions saved the budget under its own key; keep it on upgrade.
  dashboardDetails.budgetLimit = legacyBudgetLimit;
}
balance = round2(dashboardDetails.balance);
budgetLimit = dashboardDetails.budgetLimit;

const dialog = document.createElement("dialog");
dialog.className = "action-dialog";
dialog.setAttribute("aria-labelledby", "dialog-title");
dialog.innerHTML = `
  <div class="dialog-header">
    <h2 id="dialog-title"></h2>
    <button class="dialog-close" type="button" aria-label="Close dialog">&times;</button>
  </div>
  <div class="dialog-content"></div>
`;
document.body.append(dialog);

const dialogTitle = dialog.querySelector("#dialog-title");
const dialogContent = dialog.querySelector(".dialog-content");
const profilePhotoKey = "fintech-dashboard-profile-photo";

// Downscale to a small JPEG so the photo fits comfortably in localStorage.
function resizeImageToDataUrl(file, maxSize = 256) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.addEventListener("load", () => {
      try {
        if (!image.naturalWidth || !image.naturalHeight) throw new Error("Image has no size.");
        const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        context.fillStyle = "#fff"; // JPEG has no transparency
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    });
    image.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be decoded."));
    });
    image.src = objectUrl;
  });
}

function updateProfilePhotos(photoData) {
  document.querySelectorAll(".profile-photo-image").forEach((image) => {
    image.src = photoData;
    image.alt = image.closest(".profile-ring")
      ? `${dashboardDetails.name}'s profile photo`
      : "";
    image.hidden = false;
    image.parentElement.classList.add("has-profile-photo");
  });
}

try {
  const savedPhoto = localStorage.getItem(profilePhotoKey);
  if (savedPhoto) updateProfilePhotos(savedPhoto);
} catch (error) {
  console.error("Could not load the saved profile photo.", error);
}

function getCurrencyRate(currency) {
  if (currency === "USD") return 1;
  const rate = dashboardDetails.rates.find((item) => item.currency === currency);
  if (dashboardDetails.manualRates && rate && rate.value > 0) return rate.value;
  if (Number.isFinite(liveRates[currency]) && liveRates[currency] > 0) return liveRates[currency];
  return rate && rate.value > 0 ? rate.value : null;
}

function formatDashboardCurrency(value) {
  const rate = getCurrencyRate(dashboardDetails.currency);
  return rate === null ? `Rate unavailable (${dashboardDetails.currency})` : formatCurrency(value * rate);
}

function populateCurrencySelect(select, selectedCurrency) {
  const currencies = getSupportedCurrencies();
  const currencyNames = typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "currency" })
    : null;
  select.replaceChildren();
  currencies.forEach((currency) => {
    const option = document.createElement("option");
    option.value = currency;
    const name = currencyNames ? currencyNames.of(currency) : null;
    const countries = currencyCountries[currency] || [];
    const extra = countries.length > 2 ? ` +${countries.length - 2} more` : "";
    const countryLabel = countries.length ? `${countries.slice(0, 2).join(", ")}${extra}` : "Country/region not listed";
    option.textContent = `${currency}${name && name !== currency ? ` — ${name}` : ""} · ${countryLabel}`;
    option.title = countries.length ? countries.join(", ") : "Country/region not listed";
    select.append(option);
  });
  select.value = currencies.includes(selectedCurrency) ? selectedCurrency : "USD";
}

function updateCurrencyConverter() {
  const amountInput = document.querySelector("#converter-amount");
  const fromSelect = document.querySelector("#converter-from");
  const toSelect = document.querySelector("#converter-to");
  const result = document.querySelector(".converter-result");
  if (!amountInput || !fromSelect || !toSelect || !result) return;

  const amount = Number(amountInput.value);
  const fromRate = getCurrencyRate(fromSelect.value);
  const toRate = getCurrencyRate(toSelect.value);
  if (amountInput.value.trim() === "" || !Number.isFinite(amount) || amount < 0) {
    result.textContent = "Enter a valid amount.";
    return;
  }
  if (fromRate === null || toRate === null) {
    result.textContent = `Rate unavailable for ${fromRate === null ? fromSelect.value : toSelect.value}.`;
    return;
  }
  const converted = (amount / fromRate) * toRate;
  result.textContent = `${formatCurrency(amount, fromSelect.value)} = ${formatCurrency(converted, toSelect.value)}`;
}

function formatCurrency(value, currency = dashboardDetails.currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

async function loadExchangeRates() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(8000) : undefined,
    });
    if (!response.ok) throw new Error(`Exchange-rate service returned ${response.status}.`);
    const data = await response.json();
    if (data.result !== "success" || !data.rates || typeof data.rates !== "object") {
      throw new TypeError("The exchange-rate service returned an invalid response.");
    }

    liveRates = Object.fromEntries(
      Object.entries(data.rates).filter(([currency, value]) => (
        /^[A-Z]{3}$/.test(currency) && Number.isFinite(value) && value > 0
      )),
    );
    if (!dashboardDetails.manualRates) {
      dashboardDetails.rates = dashboardDetails.rates.map((rate) => ({
        ...rate,
        value: liveRates[rate.currency] || rate.value,
      }));
    }
    const updated = new Date(data.time_last_update_utc);
    const updatedAt = Number.isNaN(updated.getTime())
      ? "latest available"
      : `${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(updated)} UTC`;
    rateStatus = `Updated ${updatedAt} · open.er-api.com`;
  } catch (error) {
    console.error("Could not load live exchange rates.", error);
    rateStatus = "Live rates unavailable; using configured rates where available.";
  }
  renderDashboardDetails();
}

function getDashboardCurrencySelect() {
  return document.querySelector("#dashboard-currency");
}

function persistDashboardDetails() {
  saveLocalValue("fintech-dashboard-details", dashboardDetails);
  saveLocalValue("fintech-dashboard-budget", dashboardDetails.budgetLimit);
}

function brandClassFor(name) {
  const key = name.toLowerCase();
  if (key.includes("spotify")) return "brand-spotify";
  if (key.includes("nike")) return "brand-nike";
  return "brand-airlines";
}

function renderTransactions() {
  transactionList.replaceChildren();
  dashboardDetails.transactions.forEach((transaction, index) => {
    const item = document.createElement("li");
    item.dataset.amount = String(Math.abs(transaction.amount));
    item.dataset.created = String(dashboardDetails.transactions.length - index);

    const brand = document.createElement("div");
    brand.className = `brand ${brandClassFor(transaction.name)}`;
    brand.textContent = transaction.name.trim().charAt(0).toUpperCase() || "?";

    const meta = document.createElement("div");
    meta.className = "meta";
    const title = document.createElement("strong");
    title.textContent = transaction.name;
    const category = document.createElement("span");
    category.textContent = transaction.category;
    meta.append(title, category);

    const amount = document.createElement("div");
    amount.className = transaction.amount < 0 ? "amount negative" : "amount";
    amount.textContent = `${transaction.amount < 0 ? "-" : "+"}${formatDashboardCurrency(Math.abs(transaction.amount))}`;

    const time = document.createElement("div");
    time.className = "time-stamp";
    time.textContent = transaction.time;
    item.append(brand, meta, amount, time);
    transactionList.append(item);
  });
  sortTransactions();
  applySearch();
}

function makeTrendPath(values) {
  const width = 320;
  const height = 130;
  const max = Math.max(1, ...values);
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - (value / max) * (height - 12) - 6;
    return `${index === 0 ? "M" : "L"}${x},${y}`;
  }).join(" ");
}

function renderDashboardDetails() {
  const title = document.querySelector(".title-block h1");
  title.firstChild.textContent = `${dashboardDetails.greeting}, `;
  title.querySelector("span").textContent = dashboardDetails.name;
  document.querySelector(".profile-button").setAttribute("aria-label", `${dashboardDetails.name}'s profile`);
  document.querySelectorAll(".sidebar .profile-ring > .profile-photo-image").forEach((image) => {
    image.alt = `${dashboardDetails.name}'s profile photo`;
  });
  document.querySelector(".title-block p").textContent = dashboardDetails.subtitle;

  document.querySelector(".date").textContent = `Period · ${dashboardDetails.period}`;
  document.querySelector(".balance-label").textContent = `Total balance · ${dashboardDetails.currency}`;
  document.querySelector(".small-label").textContent = `Balance · ${dashboardDetails.currency}`;
  document.querySelector(".mini-copy strong").textContent = formatDashboardCurrency(dashboardDetails.savings);
  document.querySelector(".mini-meta").textContent = dashboardDetails.savingsPeriod;

  const budgetLabel = document.querySelector(".goal-row > span");
  budgetLabel.textContent = `Budget · ${dashboardDetails.period}`;
  updateBalance();
  updateBudgetSummary();

  document.querySelector(".spending-card .card-header > span").textContent =
    `Monthly spending · ${dashboardDetails.currency}`;
  const bars = document.querySelectorAll(".chart-line .bar");
  const maxSpending = Math.max(1, ...dashboardDetails.spendingMonths.map((month) => month.amount));
  dashboardDetails.spendingMonths.forEach((month, index) => {
    bars[index].style.height = `${Math.max(4, (month.amount / maxSpending) * 100)}%`;
    bars[index].title = `${month.label}: ${formatDashboardCurrency(month.amount)}`;
    bars[index].setAttribute("role", "img");
    bars[index].setAttribute("aria-label", `${month.label}: ${formatDashboardCurrency(month.amount)}`);
  });
  document.querySelectorAll(".chart-scale span").forEach((label, index) => {
    label.textContent = dashboardDetails.spendingMonths[index].label;
  });

  document.querySelectorAll(".rate-row").forEach((row, index) => {
    const rate = dashboardDetails.rates[index];
    row.querySelector(".currency").textContent = rate.currency;
    const selectedRate = getCurrencyRate(dashboardDetails.currency);
    const currentRate = getCurrencyRate(rate.currency);
    const displayedRate = selectedRate === null || currentRate === null ? null : currentRate / selectedRate;
    row.querySelector(".value").textContent = displayedRate === null
      ? "—"
      : new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(displayedRate);
    const trend = row.querySelector(".trend");
    const usesCustomRate = dashboardDetails.manualRates
      && dashboardDetails.rates.some((item) => item.currency === rate.currency);
    trend.textContent = displayedRate === null
      ? "Unavailable"
      : usesCustomRate
        ? "Custom"
        : liveRates[rate.currency] > 0
          ? "Feed"
          : "Saved";
    trend.classList.remove("up", "down");
  });
  document.querySelector(".vs-usd").textContent = `vs ${dashboardDetails.currency}`;
  const customRateCurrencies = dashboardDetails.manualRates
    ? dashboardDetails.rates.map((rate) => rate.currency).join(", ")
    : "";
  document.querySelector(".converter-heading span").textContent = customRateCurrencies
    ? `Custom: ${customRateCurrencies} · ${rateStatus}`
    : rateStatus;
  const currencySelector = getDashboardCurrencySelect();
  if (currencySelector) populateCurrencySelect(currencySelector, dashboardDetails.currency);
  const editorCurrencySelector = document.querySelector('.details-editor [name="currency"]');
  if (editorCurrencySelector) populateCurrencySelect(editorCurrencySelector, dashboardDetails.currency);
  const converterFrom = document.querySelector("#converter-from");
  const converterTo = document.querySelector("#converter-to");
  if (converterFrom && converterTo) {
    populateCurrencySelect(converterFrom, converterFrom.value || "USD");
    populateCurrencySelect(converterTo, converterTo.value || (dashboardDetails.currency === "USD" ? "EUR" : dashboardDetails.currency));
    updateCurrencyConverter();
  }

  document.querySelectorAll(".trend-legend .legend-tag").forEach((tag, index) => {
    tag.textContent = dashboardDetails.trendCategories[index];
  });
  document.querySelectorAll(".trend-chart path").forEach((path, index) => {
    path.setAttribute("d", makeTrendPath(dashboardDetails.trendSeries[index]));
  });
  document.querySelectorAll(".section-context, .trend-panel .card-description").forEach((context) => {
    context.textContent = `${dashboardDetails.period} · ${dashboardDetails.currency}`;
  });
  renderTransactions();
}

function updateBalance() {
  dashboardDetails.balance = balance;
  const formattedBalance = formatDashboardCurrency(balance);
  balanceValue.textContent = formattedBalance;
  cardAmount.textContent = formattedBalance;
  balanceValue.classList.toggle("balance-hidden", balancesHidden);
  cardAmount.classList.toggle("balance-hidden", balancesHidden);
}

function updateBudgetSummary() {
  document.querySelector(".budget-summary").textContent =
    `${formatDashboardCurrency(dashboardDetails.budgetSpent)} of ${formatDashboardCurrency(dashboardDetails.budgetLimit)} budget`;
}

renderDashboardDetails();
updateBudgetSummary();

// Accessible names for controls that only have an icon or an ambiguous label.
searchInput.setAttribute("aria-label", "Search transactions");
searchInput.placeholder = "Search transactions";
const trendSvg = document.querySelector(".trend-chart svg");
if (trendSvg) trendSvg.setAttribute("role", "img");

getDashboardCurrencySelect().addEventListener("change", (event) => {
  dashboardDetails.currency = event.currentTarget.value;
  document.querySelector("#converter-to").value = dashboardDetails.currency;
  renderDashboardDetails();
  persistDashboardDetails();
});

document.querySelector("#converter-amount").addEventListener("input", updateCurrencyConverter);
document.querySelector("#converter-from").addEventListener("change", updateCurrencyConverter);
document.querySelector("#converter-to").addEventListener("change", updateCurrencyConverter);
document.querySelector(".converter-swap").addEventListener("click", () => {
  const from = document.querySelector("#converter-from");
  const to = document.querySelector("#converter-to");
  [from.value, to.value] = [to.value, from.value];
  updateCurrencyConverter();
});

function showWelcomeDialog() {
  const content = document.createElement("div");
  content.className = "welcome-content";

  const intro = document.createElement("p");
  intro.textContent = "A simple place to understand your balances, spending, and budgets.";

  const privacy = document.createElement("p");
  privacy.className = "trust-copy";
  privacy.textContent = "Your profile photo, budget, and account entries are stored only in this browser. Never enter your bank credentials on this page.";

  const actions = document.createElement("div");
  actions.className = "welcome-actions";
  actions.append(
    makeButton("Connect an account", "connect-account"),
    makeButton("Explore dashboard", "explore-dashboard"),
  );
  content.append(intro, privacy, actions);
  openDialog("Welcome to your finance dashboard", content);
  // Closing with X or Esc counts as "seen" too, so the welcome doesn't return on every load.
  dialog.addEventListener("close", () => saveLocalValue("fintech-dashboard-welcome-complete", true), { once: true });
}

function showConnectInfo() {
  const content = document.createElement("div");
  const message = document.createElement("p");
  message.textContent = "Live bank connections are not available on this page. Do not enter bank credentials here. You can add an account manually or continue to the dashboard.";
  content.append(
    message,
    makeButton("Add an account", "add-account"),
    makeButton("Explore dashboard", "explore-dashboard"),
  );
  openDialog("Connect an account", content);
}

function showBudgetDialog() {
  const form = document.createElement("form");
  form.className = "amount-form";
  const description = document.createElement("p");
  description.textContent = "Set a monthly budget. It is saved only in this browser and does not affect a real account.";
  const label = document.createElement("label");
  label.htmlFor = "monthly-budget";
  label.textContent = "Monthly budget (USD)";
  const input = document.createElement("input");
  input.id = "monthly-budget";
  input.name = "budget";
  input.type = "number";
  input.min = "0.01";
  input.step = "0.01";
  input.required = true;
  input.value = String(budgetLimit);
  const error = document.createElement("p");
  error.className = "dialog-error";
  error.setAttribute("aria-live", "polite");
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "dialog-action";
  submit.textContent = "Save budget";
  form.append(description, label, input, error, submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = Number(input.value);
    if (!Number.isFinite(value) || value <= 0) {
      error.textContent = "Enter a budget greater than zero.";
      return;
    }
    budgetLimit = value;
    dashboardDetails.budgetLimit = value;
    updateBudgetSummary();
    persistDashboardDetails();
    dialog.close();
  });
  openDialog("Set a monthly budget", form);
}

function addEditorField(container, labelText, name, value, type = "text", options = {}) {
  const label = document.createElement("label");
  label.className = "editor-field";
  label.textContent = labelText;
  const input = document.createElement("input");
  input.name = name;
  input.type = type;
  input.value = String(value);
  input.required = options.required !== false;
  if (type === "number") {
    input.min = String(options.min ?? 0);
    input.step = String(options.step ?? "0.01");
  }
  if (options.maxLength) input.maxLength = options.maxLength;
  if (options.pattern) input.pattern = options.pattern;
  label.append(input);
  container.append(label);
  return input;
}

function addEditorSelect(container, labelText, name, selectedValue, values) {
  const label = document.createElement("label");
  label.className = "editor-field";
  label.textContent = labelText;
  const select = document.createElement("select");
  select.name = name;
  select.required = true;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
  select.value = selectedValue;
  label.append(select);
  container.append(label);
  return select;
}

function addEditorGroup(form, title) {
  const group = document.createElement("fieldset");
  group.className = "editor-group";
  const legend = document.createElement("legend");
  legend.textContent = title;
  group.append(legend);
  form.append(group);
  return group;
}

function showEditDetailsDialog() {
  const form = document.createElement("form");
  form.className = "details-editor";
  const note = document.createElement("p");
  note.className = "editor-note";
  note.textContent = "Changes are saved in this browser and are visible to anyone using this browser profile. Amount fields use USD; rates are units per USD, and displayed amounts are converted with those rates.";
  form.append(note);

  const profile = addEditorGroup(form, "Profile and period");
  addEditorField(profile, "Greeting", "greeting", dashboardDetails.greeting, "text", { maxLength: 40 });
  addEditorField(profile, "Name", "name", dashboardDetails.name, "text", { maxLength: 40 });
  addEditorField(profile, "Subtitle", "subtitle", dashboardDetails.subtitle, "text", { maxLength: 100 });
  addEditorField(profile, "Period", "period", dashboardDetails.period, "text", { maxLength: 30 });
  addEditorSelect(
    profile,
    "Currency",
    "currency",
    dashboardDetails.currency,
    getSupportedCurrencies(),
  );

  const totals = addEditorGroup(form, "Balances and budget");
  addEditorField(totals, "Total balance (USD)", "balance", dashboardDetails.balance, "number");
  addEditorField(totals, "Savings (USD)", "savings", dashboardDetails.savings, "number");
  addEditorField(totals, "Savings period", "savingsPeriod", dashboardDetails.savingsPeriod, "text", { maxLength: 30 });
  addEditorField(totals, "Budget spent (USD)", "budgetSpent", dashboardDetails.budgetSpent, "number");
  addEditorField(totals, "Budget limit (USD)", "budgetLimit", dashboardDetails.budgetLimit, "number", { min: 0.01 });

  const months = addEditorGroup(form, "Monthly spending chart");
  dashboardDetails.spendingMonths.forEach((month, index) => {
    addEditorField(months, `Month ${index + 1}`, `monthLabel${index}`, month.label, "text", {
      maxLength: 10,
    });
    addEditorField(months, `Amount ${index + 1} (USD)`, `monthAmount${index}`, month.amount, "number");
  });

  const rates = addEditorGroup(form, "Exchange rates");
  const ratesNote = document.createElement("p");
  ratesNote.className = "editor-note editor-group-note";
  ratesNote.textContent = "Each rate is the number of currency units equal to 1 USD.";
  rates.append(ratesNote);
  dashboardDetails.rates.forEach((rate, index) => {
    addEditorField(rates, `Currency ${index + 1}`, `rateCurrency${index}`, rate.currency, "text", {
      maxLength: 3,
      pattern: "[A-Za-z]{3}",
    });
    addEditorField(rates, `Rate ${index + 1}`, `rateValue${index}`, rate.value, "number", {
      min: 0.000001,
      step: "any",
    });
    addEditorField(rates, `Change % ${index + 1}`, `rateChange${index}`, rate.change, "number", {
      min: -100000,
      step: "0.01",
    });
  });

  const transactions = addEditorGroup(form, "Transactions");
  const transactionRows = document.createElement("div");
  transactionRows.className = "transaction-editor-rows";
  transactions.append(transactionRows);
  let nextTransactionIndex = dashboardDetails.transactions.length;
  const appendTransactionRow = (transaction, index) => {
    const row = document.createElement("div");
    row.className = "transaction-editor-row";
    addEditorField(row, "Merchant", `transactionName${index}`, transaction.name, "text", {
      maxLength: 60,
    });
    addEditorField(row, "Category", `transactionCategory${index}`, transaction.category, "text", {
      maxLength: 40,
    });
    addEditorField(row, "Amount in USD (negative for expense)", `transactionAmount${index}`, transaction.amount, "number", {
      min: -1000000000,
    });
    addEditorField(row, "Time", `transactionTime${index}`, transaction.time, "text", {
      maxLength: 20,
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "transaction-remove";
    remove.dataset.removeTransaction = "";
    remove.textContent = "Remove transaction";
    row.append(remove);
    transactionRows.append(row);
  };
  dashboardDetails.transactions.forEach(appendTransactionRow);
  const addTransactionButton = document.createElement("button");
  addTransactionButton.type = "button";
  addTransactionButton.className = "editor-add-transaction";
  addTransactionButton.textContent = "Add transaction";
  transactions.append(addTransactionButton);
  form.addEventListener("click", (event) => {
    if (event.target.closest(".editor-add-transaction")) {
      appendTransactionRow({ name: "", category: "", amount: 0, time: "" }, nextTransactionIndex);
      nextTransactionIndex += 1;
    } else if (event.target.closest("[data-remove-transaction]")) {
      event.target.closest(".transaction-editor-row").remove();
    }
  });

  const trends = addEditorGroup(form, "Spending trends");
  dashboardDetails.trendCategories.forEach((category, index) => {
    addEditorField(trends, `Category ${index + 1}`, `trendCategory${index}`, category, "text", { maxLength: 40 });
    dashboardDetails.trendSeries[index].forEach((value, pointIndex) => {
      addEditorField(trends, `${category} · point ${pointIndex + 1}`, `trend${index}Point${pointIndex}`, value, "number");
    });
  });

  const error = document.createElement("p");
  error.className = "dialog-error";
  error.setAttribute("aria-live", "polite");
  const save = document.createElement("button");
  save.type = "submit";
  save.className = "dialog-action editor-save";
  save.textContent = "Save all changes";
  form.append(error, save);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const readText = (key) => String(formData.get(key) || "").trim();
    const readNumber = (key) => Number(formData.get(key));
    const updated = {
      greeting: readText("greeting"),
      name: readText("name"),
      subtitle: readText("subtitle"),
      period: readText("period"),
      currency: readText("currency").toUpperCase(),
      manualRates: false, // decided below, once the rate fields are compared
      balance: readNumber("balance"),
      savings: readNumber("savings"),
      savingsPeriod: readText("savingsPeriod"),
      budgetSpent: readNumber("budgetSpent"),
      budgetLimit: readNumber("budgetLimit"),
      spendingMonths: dashboardDetails.spendingMonths.map((month, index) => ({
        label: readText(`monthLabel${index}`).toUpperCase(),
        amount: readNumber(`monthAmount${index}`),
      })),
      rates: dashboardDetails.rates.map((rate, index) => ({
        currency: readText(`rateCurrency${index}`).toUpperCase(),
        value: readNumber(`rateValue${index}`),
        change: readNumber(`rateChange${index}`),
      })),
      transactions: [...transactionRows.querySelectorAll(".transaction-editor-row")].map((row) => {
        const getValue = (prefix) => row.querySelector(`[name^="${prefix}"]`).value.trim();
        return {
          name: getValue("transactionName"),
          category: getValue("transactionCategory"),
          amount: Number(row.querySelector('[name^="transactionAmount"]').value),
          time: getValue("transactionTime"),
        };
      }),
      trendCategories: dashboardDetails.trendCategories.map((category, index) => (
        readText(`trendCategory${index}`)
      )),
      trendSeries: dashboardDetails.trendSeries.map((series, index) => (
        series.map((value, pointIndex) => readNumber(`trend${index}Point${pointIndex}`))
      )),
    };

    // Only freeze the live feed when the user actually changed a tracked rate.
    updated.manualRates = Boolean(dashboardDetails.manualRates) || dashboardDetails.rates.some((rate, index) => (
      rate.currency !== updated.rates[index].currency || rate.value !== updated.rates[index].value
    ));
    updated.version = 1;

    try {
      new Intl.NumberFormat("en-US", { style: "currency", currency: updated.currency });
    } catch (currencyError) {
      error.textContent = "Enter a valid three-letter currency code.";
      return;
    }

    if (!updated.greeting || !updated.name || !updated.subtitle || !updated.period
      || !updated.savingsPeriod
      || updated.spendingMonths.some((month) => !month.label || month.amount < 0)
      || updated.rates.some((rate) => !/^[A-Z]{3}$/.test(rate.currency) || rate.value <= 0)
      || !getSupportedCurrencies().includes(updated.currency)
      || updated.transactions.some((transaction) => !transaction.name || !transaction.category || !transaction.time)
      || updated.trendCategories.some((category) => !category)
      || updated.trendSeries.some((series) => series.some((value) => value < 0))) {
      error.textContent = "Fill in all text fields and use valid non-negative amounts.";
      return;
    }

    dashboardDetails = updated;
    balance = updated.balance;
    budgetLimit = updated.budgetLimit;
    renderDashboardDetails();
    persistDashboardDetails();
    dialog.close();
  });
  openDialog("Edit dashboard details", form);
}

function showAccountsDialog() {
  const content = document.createElement("div");
  const privacy = document.createElement("p");
  privacy.textContent = "Account details you add are saved in this browser and are not included in the total balance.";
  content.append(privacy);

  if (savedAccounts.length) {
    const list = document.createElement("ul");
    list.className = "account-list";
    savedAccounts.forEach((account, index) => {
      const item = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = account.name;
      const amount = document.createElement("span");
      amount.textContent = formatDashboardCurrency(account.balance);
      const actions = document.createElement("div");
      actions.className = "account-actions";
      const edit = makeButton("Edit", "edit-account");
      edit.dataset.accountIndex = String(index);
      edit.setAttribute("aria-label", `Edit ${account.name}`);
      const remove = makeButton("Remove", "remove-account");
      remove.dataset.accountIndex = String(index);
      remove.setAttribute("aria-label", `Remove ${account.name}`);
      actions.append(edit, remove);
      item.append(name, amount, actions);
      list.append(item);
    });
    content.append(list);
  } else {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No accounts yet. Add one manually to see how account summaries work.";
    content.append(empty);
  }

  const form = document.createElement("form");
  form.className = "amount-form";
  const nameLabel = document.createElement("label");
  nameLabel.htmlFor = "account-name";
  nameLabel.textContent = "Account name";
  const nameInput = document.createElement("input");
  nameInput.id = "account-name";
  nameInput.name = "name";
  nameInput.type = "text";
  nameInput.maxLength = 40;
  nameInput.required = true;
  nameInput.placeholder = "e.g. Savings";
  const balanceLabel = document.createElement("label");
  balanceLabel.htmlFor = "account-balance";
  balanceLabel.textContent = "Balance (USD)";
  const accountBalance = document.createElement("input");
  accountBalance.id = "account-balance";
  accountBalance.name = "balance";
  accountBalance.type = "number";
  accountBalance.min = "0";
  accountBalance.step = "0.01";
  accountBalance.required = true;
  accountBalance.placeholder = "0.00";
  const error = document.createElement("p");
  error.className = "dialog-error";
  error.setAttribute("aria-live", "polite");
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "dialog-action";
  submit.textContent = "Add account";
  form.append(nameLabel, nameInput, balanceLabel, accountBalance, error, submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const value = Number(accountBalance.value);
    if (!name || !Number.isFinite(value) || value < 0) {
      error.textContent = "Enter an account name and a valid non-negative balance.";
      return;
    }
    savedAccounts.push({ name, balance: value });
    saveLocalValue("fintech-dashboard-accounts", savedAccounts);
    showAccountsDialog();
  });
  content.append(form);
  openDialog("Accounts", content);
}

function openDialog(title, content) {
  dialogTitle.textContent = title;
  dialogContent.replaceChildren();
  if (typeof content === "string") {
    const message = document.createElement("p");
    message.textContent = content;
    dialogContent.append(message);
  } else {
    dialogContent.append(content);
  }
  if (!dialog.open) dialog.showModal();
}

function makeButton(label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "dialog-action";
  button.textContent = label;
  button.dataset.dialogAction = action;
  return button;
}

function makeAmountDialog(action) {
  const form = document.createElement("form");
  form.className = "amount-form";

  const message = document.createElement("p");
  message.textContent = action === "add"
    ? "Choose an amount in USD to add to your account balance."
    : "Choose an amount in USD to transfer from your account balance.";

  const label = document.createElement("label");
  label.htmlFor = "transaction-amount";
  label.textContent = "Amount (USD)";

  const input = document.createElement("input");
  input.id = "transaction-amount";
  input.name = "amount";
  input.type = "number";
  input.min = "0.01";
  input.step = "0.01";
  input.required = true;
  input.placeholder = "0.00";

  const error = document.createElement("p");
  error.className = "dialog-error";
  error.setAttribute("aria-live", "polite");

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "dialog-action";
  submit.textContent = action === "add" ? "Add money" : "Transfer";

  form.append(message, label, input, error, submit);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number(input.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      error.textContent = "Enter an amount greater than zero.";
      return;
    }
    if (action === "transfer" && amount > balance) {
      error.textContent = "This amount is higher than your available balance.";
      return;
    }

    balance = round2(balance + (action === "add" ? amount : -amount));
    updateBalance();
    addTransaction(action === "add" ? "Money added" : "Transfer", amount, action);
    dialog.close();
  });

  openDialog(action === "add" ? "Add money" : "Transfer money", form);
  input.focus();
}

function addTransaction(name, amount, action) {
  const timestamp = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
  dashboardDetails.transactions.unshift({
    name,
    category: action === "add" ? "Deposit" : "Transfer",
    amount: action === "add" ? amount : -amount,
    time: timestamp,
  });
  renderTransactions();
  persistDashboardDetails();
}

function sortTransactions() {
  const items = [...transactionList.children];
  if (sortMode === "amount-asc") {
    items.sort((a, b) => Number(a.dataset.amount) - Number(b.dataset.amount));
  } else if (sortMode === "amount-desc") {
    items.sort((a, b) => Number(b.dataset.amount) - Number(a.dataset.amount));
  } else {
    items.sort((a, b) => Number(b.dataset.created) - Number(a.dataset.created));
  }
  items.forEach((item) => transactionList.append(item));
}

function applySearch() {
  const query = searchInput.value.trim().toLowerCase();
  const items = [...transactionList.children];
  items.forEach((item) => {
    item.hidden = !item.textContent.toLowerCase().includes(query);
  });
  document.querySelector(".transactions-empty").hidden =
    items.some((item) => !item.hidden);
}

function showChat() {
  const container = document.createElement("div");
  const note = document.createElement("p");
  note.textContent = "Messages stay in this page and aren't sent to a support team.";

  const messages = document.createElement("div");
  messages.className = "chat-messages";
  messages.setAttribute("aria-live", "polite");

  const form = document.createElement("form");
  form.className = "chat-form";
  const input = document.createElement("input");
  input.name = "message";
  input.type = "text";
  input.placeholder = "Write a message";
  input.setAttribute("aria-label", "Write a message");
  input.required = true;
  const send = document.createElement("button");
  send.type = "submit";
  send.className = "dialog-action";
  send.textContent = "Send";
  form.append(input, send);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.createElement("p");
    message.className = "chat-message";
    message.textContent = input.value.trim();
    if (!message.textContent) return;
    messages.append(message);
    input.value = "";
    input.focus();
  });

  container.append(note, messages, form);
  openDialog("Chats", container);
  input.focus();
}

function showSettings() {
  const container = document.createElement("div");
  const description = document.createElement("p");
  description.textContent = "Manage how amounts appear on this dashboard.";
  const toggle = makeButton(balancesHidden ? "Show balances" : "Hide balances", "toggle-balances");
  container.append(description, toggle);
  openDialog("Settings", container);
}

function showMoreActions() {
  const container = document.createElement("div");
  const description = document.createElement("p");
  description.textContent = "Jump to another area of your dashboard.";
  container.append(
    description,
    makeButton("Recent transactions", "transactions"),
    makeButton("Spending trends", "trends"),
    makeButton("Accounts", "accounts"),
  );
  openDialog("More actions", container);
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.type = "button";
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
      item.removeAttribute("aria-current");
    });
    button.classList.add("active");
    button.setAttribute("aria-current", "page");

    const section = button.textContent.trim();
    if (section === "Chats") {
      showChat();
    } else if (section === "Settings") {
      showSettings();
    } else {
      const target = section === "Home"
        ? document.querySelector(".topbar")
        : section === "Wallets"
          ? document.querySelector(".hero-card")
          : document.querySelector(".spending-card");
      target.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
    }
  });
});

document.querySelector(".bell-icon").addEventListener("click", () => {
  openDialog("Notifications", "You're all caught up. There are no new notifications.");
});

document.querySelector(".profile-button").addEventListener("click", () => {
  const profile = document.createElement("div");
  profile.className = "profile-details";

  const avatar = document.createElement("div");
  avatar.className = "profile-ring";
  avatar.setAttribute("aria-hidden", "true");
  const face = document.createElement("span");
  face.className = "profile-face";
  face.innerHTML = '<span class="hair"></span><span class="face-shade"></span><span class="eyes"></span><span class="nose"></span><span class="mouth"></span>';
  avatar.append(face);
  const photo = document.createElement("img");
  photo.className = "profile-photo-image";
  photo.alt = "";
  photo.hidden = true;
  avatar.append(photo);
  const savedPhoto = document.querySelector(".profile-photo-image:not([hidden])");
  if (savedPhoto) {
    photo.src = savedPhoto.src;
    photo.hidden = false;
    avatar.classList.add("has-profile-photo");
  }

  const name = document.createElement("strong");
  name.textContent = dashboardDetails.name;
  const accountType = document.createElement("p");
  accountType.textContent = "Personal account";
  const uploadLabel = document.createElement("label");
  uploadLabel.className = "photo-upload-button";
  uploadLabel.htmlFor = "profile-photo-upload";
  uploadLabel.textContent = "Upload profile photo";
  const uploadInput = document.createElement("input");
  uploadInput.id = "profile-photo-upload";
  uploadInput.type = "file";
  uploadInput.accept = "image/*";
  uploadInput.className = "photo-upload-input";
  const uploadStatus = document.createElement("p");
  uploadStatus.className = "photo-upload-status";
  uploadStatus.setAttribute("aria-live", "polite");
  uploadInput.addEventListener("change", () => {
    const file = uploadInput.files && uploadInput.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      uploadStatus.textContent = "Choose an image file to continue.";
      uploadInput.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      uploadStatus.textContent = "Choose an image smaller than 5 MB.";
      uploadInput.value = "";
      return;
    }

    resizeImageToDataUrl(file).then((dataUrl) => {
      try {
        localStorage.setItem(profilePhotoKey, dataUrl);
        updateProfilePhotos(dataUrl);
        photo.src = dataUrl;
        photo.hidden = false;
        avatar.classList.add("has-profile-photo");
        uploadStatus.textContent = "Profile photo updated.";
      } catch (error) {
        console.error("Could not save the selected profile photo.", error);
        uploadStatus.textContent = "The photo could not be saved in this browser.";
      }
    }).catch((error) => {
      console.error("Could not read the selected photo.", error);
      uploadStatus.textContent = "The selected photo could not be read.";
    });
  });
  profile.append(avatar, name, accountType, uploadLabel, uploadInput, uploadStatus);
  openDialog("Profile", profile);
});

sidebar.id = sidebar.id || "sidebar";
menuButton.setAttribute("aria-controls", sidebar.id);
menuButton.addEventListener("click", () => {
  const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
  sidebar.hidden = isExpanded;
  menuButton.setAttribute("aria-expanded", String(!isExpanded));
  dashboardShell.classList.toggle("menu-collapsed", isExpanded);
});

const balanceButtons = document.querySelectorAll(".balance-actions button");
balanceButtons[0].setAttribute("aria-label", "Add 10 USD to balance");
balanceButtons[1].setAttribute("aria-label", "Subtract 10 USD from balance");
balanceButtons[0].addEventListener("click", () => {
  balance = round2(balance + 10);
  updateBalance();
  persistDashboardDetails();
});
balanceButtons[1].addEventListener("click", () => {
  if (balance < 10) {
    openDialog("Balance", "The account balance cannot be reduced below zero.");
    return;
  }
  balance = round2(balance - 10);
  updateBalance();
  persistDashboardDetails();
});

const quickButtons = document.querySelectorAll(".quick-btn");
quickButtons[0].addEventListener("click", () => makeAmountDialog("add"));
quickButtons[1].addEventListener("click", () => makeAmountDialog("transfer"));
quickButtons[2].addEventListener("click", showAccountsDialog);
quickButtons[3].addEventListener("click", showMoreActions);
document.querySelector(".edit-details-button").addEventListener("click", showEditDetailsDialog);

document.querySelector(".more-vert").addEventListener("click", () => {
  const container = document.createElement("div");
  const description = document.createElement("p");
  description.textContent = "Download your transactions (amounts in USD) as a CSV file.";
  const exportButton = makeButton("Download transactions CSV", "export-spending");
  container.append(description, exportButton);
  openDialog("Spending options", container);
});

document.querySelector(".upgrade-card button").addEventListener("click", () => {
  const container = document.createElement("div");
  const description = document.createElement("p");
  description.textContent = "Bank connections, paid plans, and live transfers are not available on this page.";
  container.append(description, makeButton("Got it", "close"));
  openDialog("About account services", container);
});

document.querySelectorAll(".next-step-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.nextAction === "transactions") {
      document.querySelector(".transactions-panel").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
    } else if (button.dataset.nextAction === "budget") {
      showBudgetDialog();
    } else if (button.dataset.nextAction === "account") {
      showAccountsDialog();
    }
  });
});

document.querySelector(".sort-btn").addEventListener("click", (event) => {
  const button = event.currentTarget;
  if (sortMode === "default") {
    sortMode = "amount-asc";
    button.textContent = "Amount: low to high";
  } else if (sortMode === "amount-asc") {
    sortMode = "amount-desc";
    button.textContent = "Amount: high to low";
  } else {
    sortMode = "default";
    button.textContent = "Sort by";
  }
  sortTransactions();
});

searchInput.addEventListener("input", applySearch);

dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
// Close only when the press AND the click both land on the backdrop. This stops a
// text-selection drag that ends outside an input from closing the dialog.
let pressStartedOnBackdrop = false;
dialog.addEventListener("pointerdown", (event) => {
  pressStartedOnBackdrop = event.target === dialog;
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog && pressStartedOnBackdrop) dialog.close();
  pressStartedOnBackdrop = false;
});
dialog.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dialog-action]");
  if (!button) return;

  if (button.dataset.dialogAction === "toggle-balances") {
    balancesHidden = !balancesHidden;
    updateBalance();
    button.textContent = balancesHidden ? "Show balances" : "Hide balances";
  } else if (button.dataset.dialogAction === "close") {
    dialog.close();
  } else if (button.dataset.dialogAction === "transactions") {
    dialog.close();
    document.querySelector(".transactions-panel").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  } else if (button.dataset.dialogAction === "trends") {
    dialog.close();
    document.querySelector(".trend-panel").scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  } else if (button.dataset.dialogAction === "accounts") {
    dialog.close();
    showAccountsDialog();
  } else if (button.dataset.dialogAction === "edit-account") {
    const index = Number(button.dataset.accountIndex);
    const account = savedAccounts[index];
    if (!account) return;
    const content = document.createElement("form");
    content.className = "amount-form";
    const nameLabel = document.createElement("label");
    nameLabel.htmlFor = "edit-account-name";
    nameLabel.textContent = "Account name";
    const nameInput = document.createElement("input");
    nameInput.id = "edit-account-name";
    nameInput.value = account.name;
    nameInput.required = true;
    nameInput.maxLength = 40;
    const balanceLabel = document.createElement("label");
    balanceLabel.htmlFor = "edit-account-balance";
    balanceLabel.textContent = "Balance (USD)";
    const balanceInput = document.createElement("input");
    balanceInput.id = "edit-account-balance";
    balanceInput.type = "number";
    balanceInput.min = "0";
    balanceInput.step = "0.01";
    balanceInput.value = String(account.balance);
    balanceInput.required = true;
    const save = document.createElement("button");
    save.type = "submit";
    save.className = "dialog-action";
    save.textContent = "Save account";
    const editError = document.createElement("p");
    editError.className = "dialog-error";
    editError.setAttribute("aria-live", "polite");
    content.append(nameLabel, nameInput, balanceLabel, balanceInput, editError, save);
    content.addEventListener("submit", (submitEvent) => {
      submitEvent.preventDefault();
      const updatedName = nameInput.value.trim();
      const updatedBalance = round2(Number(balanceInput.value));
      if (!updatedName || !Number.isFinite(updatedBalance) || updatedBalance < 0) {
        editError.textContent = "Enter an account name and a valid non-negative balance.";
        return;
      }
      savedAccounts[index] = { name: updatedName, balance: updatedBalance };
      saveLocalValue("fintech-dashboard-accounts", savedAccounts);
      showAccountsDialog();
    });
    openDialog("Edit account", content);
  } else if (button.dataset.dialogAction === "remove-account") {
    const index = Number(button.dataset.accountIndex);
    if (index >= 0 && index < savedAccounts.length) {
      savedAccounts.splice(index, 1);
      saveLocalValue("fintech-dashboard-accounts", savedAccounts);
      showAccountsDialog();
    }
  } else if (button.dataset.dialogAction === "export-spending") {
    const csvRows = [
      ["Merchant", "Category", "Amount (USD)", "Time"],
      ...dashboardDetails.transactions.map((transaction) => [
        transaction.name,
        transaction.category,
        transaction.amount,
        transaction.time,
      ]),
    ];
    // Quote every cell and neutralise spreadsheet formulas (= + - @) in text fields.
    const csvCell = (field) => {
      const text = String(field);
      const guarded = typeof field === "string" && /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
      return `"${guarded.replace(/"/g, '""')}"`;
    };
    const csv = csvRows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    // The BOM keeps non-ASCII merchant names readable when opened in Excel.
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    dialog.close();
  } else if (button.dataset.dialogAction === "connect-account") {
    showConnectInfo();
  } else if (button.dataset.dialogAction === "add-account") {
    showAccountsDialog();
  } else if (button.dataset.dialogAction === "explore-dashboard") {
    saveLocalValue("fintech-dashboard-welcome-complete", true);
    dialog.close();
  }
});

if (!readLocalValue("fintech-dashboard-welcome-complete", false, (value) => (
  typeof value === "boolean"
))) {
  showWelcomeDialog();
}

loadExchangeRates();

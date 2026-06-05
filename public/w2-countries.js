/* ============================================================================
   w2-countries.js — SINGLE SOURCE OF TRUTH for the W❤️² checkout country list.
   The ONLY country list in the whole product. Loaded once, used everywhere
   (agent store, landing, site, gamelanding). Никаких вторых правд.
   Exposes:
     window.W2_COUNTRIES        -> [{ code, name, flag, dial }]
     window.W2_COUNTRY_BY_CODE  -> { [code]: {...} }
     window.W2_COUNTRY(code)    -> {...} (fallback to first)
   ========================================================================== */
(function () {
  if (window.W2_COUNTRIES) return; // single instance

  var LIST = [
    // — core / SEA —
    { code: "VN", name: "Vietnam",        flag: "🇻🇳", dial: "+84"  },
    { code: "TH", name: "Thailand",       flag: "🇹🇭", dial: "+66"  },
    { code: "SG", name: "Singapore",      flag: "🇸🇬", dial: "+65"  },
    { code: "MY", name: "Malaysia",       flag: "🇲🇾", dial: "+60"  },
    { code: "ID", name: "Indonesia",      flag: "🇮🇩", dial: "+62"  },
    { code: "PH", name: "Philippines",    flag: "🇵🇭", dial: "+63"  },
    { code: "KH", name: "Cambodia",       flag: "🇰🇭", dial: "+855" },
    { code: "LA", name: "Laos",           flag: "🇱🇦", dial: "+856" },
    { code: "MM", name: "Myanmar",        flag: "🇲🇲", dial: "+95"  },
    { code: "IN", name: "India",          flag: "🇮🇳", dial: "+91"  },
    { code: "CN", name: "China",          flag: "🇨🇳", dial: "+86"  },
    { code: "JP", name: "Japan",          flag: "🇯🇵", dial: "+81"  },
    { code: "KR", name: "South Korea",    flag: "🇰🇷", dial: "+82"  },
    { code: "HK", name: "Hong Kong",      flag: "🇭🇰", dial: "+852" },
    { code: "TW", name: "Taiwan",         flag: "🇹🇼", dial: "+886" },
    // — Americas —
    { code: "US", name: "United States",  flag: "🇺🇸", dial: "+1"   },
    { code: "CA", name: "Canada",         flag: "🇨🇦", dial: "+1"   },
    { code: "MX", name: "Mexico",         flag: "🇲🇽", dial: "+52"  },
    { code: "BR", name: "Brazil",         flag: "🇧🇷", dial: "+55"  },
    { code: "AR", name: "Argentina",      flag: "🇦🇷", dial: "+54"  },
    // — Middle East —
    { code: "AE", name: "UAE",            flag: "🇦🇪", dial: "+971" },
    { code: "SA", name: "Saudi Arabia",   flag: "🇸🇦", dial: "+966" },
    { code: "QA", name: "Qatar",          flag: "🇶🇦", dial: "+974" },
    { code: "IL", name: "Israel",         flag: "🇮🇱", dial: "+972" },
    { code: "TR", name: "Turkey",         flag: "🇹🇷", dial: "+90"  },
    // — Russia / CIS —
    { code: "RU", name: "Russia",         flag: "🇷🇺", dial: "+7"   },
    { code: "UA", name: "Ukraine",        flag: "🇺🇦", dial: "+380" },
    { code: "BY", name: "Belarus",        flag: "🇧🇾", dial: "+375" },
    { code: "KZ", name: "Kazakhstan",     flag: "🇰🇿", dial: "+7"   },
    { code: "GE", name: "Georgia",        flag: "🇬🇪", dial: "+995" },
    { code: "AM", name: "Armenia",        flag: "🇦🇲", dial: "+374" },
    { code: "AZ", name: "Azerbaijan",     flag: "🇦🇿", dial: "+994" },
    { code: "UZ", name: "Uzbekistan",     flag: "🇺🇿", dial: "+998" },
    { code: "KG", name: "Kyrgyzstan",     flag: "🇰🇬", dial: "+996" },
    // — Europe —
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", dial: "+44"  },
    { code: "IE", name: "Ireland",        flag: "🇮🇪", dial: "+353" },
    { code: "DE", name: "Germany",        flag: "🇩🇪", dial: "+49"  },
    { code: "FR", name: "France",         flag: "🇫🇷", dial: "+33"  },
    { code: "ES", name: "Spain",          flag: "🇪🇸", dial: "+34"  },
    { code: "PT", name: "Portugal",       flag: "🇵🇹", dial: "+351" },
    { code: "IT", name: "Italy",          flag: "🇮🇹", dial: "+39"  },
    { code: "NL", name: "Netherlands",    flag: "🇳🇱", dial: "+31"  },
    { code: "BE", name: "Belgium",        flag: "🇧🇪", dial: "+32"  },
    { code: "CH", name: "Switzerland",    flag: "🇨🇭", dial: "+41"  },
    { code: "AT", name: "Austria",        flag: "🇦🇹", dial: "+43"  },
    { code: "SE", name: "Sweden",         flag: "🇸🇪", dial: "+46"  },
    { code: "NO", name: "Norway",         flag: "🇳🇴", dial: "+47"  },
    { code: "DK", name: "Denmark",        flag: "🇩🇰", dial: "+45"  },
    { code: "FI", name: "Finland",        flag: "🇫🇮", dial: "+358" },
    { code: "PL", name: "Poland",         flag: "🇵🇱", dial: "+48"  },
    { code: "CZ", name: "Czechia",        flag: "🇨🇿", dial: "+420" },
    { code: "GR", name: "Greece",         flag: "🇬🇷", dial: "+30"  },
    { code: "RO", name: "Romania",        flag: "🇷🇴", dial: "+40"  },
    { code: "HU", name: "Hungary",        flag: "🇭🇺", dial: "+36"  },
    // — Oceania / Africa —
    { code: "AU", name: "Australia",      flag: "🇦🇺", dial: "+61"  },
    { code: "NZ", name: "New Zealand",    flag: "🇳🇿", dial: "+64"  },
    { code: "ZA", name: "South Africa",   flag: "🇿🇦", dial: "+27"  },
    // — fallback —
    { code: "OTHER", name: "Other",       flag: "🌍", dial: "+"     }
  ];

  var byCode = {};
  for (var i = 0; i < LIST.length; i++) byCode[LIST[i].code] = LIST[i];

  window.W2_COUNTRIES = LIST;
  window.W2_COUNTRY_BY_CODE = byCode;
  window.W2_COUNTRY = function (code) { return byCode[code] || LIST[0]; };
})();

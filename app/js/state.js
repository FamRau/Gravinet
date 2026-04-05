// ══ GLOBAL STATE ══
// All mutable state lives here as plain variables.
// Other modules read and mutate these directly.

let stakeholders      = [];
let projects          = [];
let activeProjectId   = '';
let orgName           = 'Meine Organisation';
let nextStakeholderId = 1;
let nextProjectId     = 2;
let nextPlanId        = 6;

// Table sort state
let sortCol = '';   // 'name' | 'einfluss' | 'interesse' | 'kontakt'
let sortDir = 1;    // 1 = aufsteigend, -1 = absteigend

// Contact interval warning (days)
let contactWarningDays = 90;

// Language
let appLang = 'de';   // 'de' | 'en'

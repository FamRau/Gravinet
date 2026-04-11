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
let nextAufgabeId     = 1;

// Table sort state
let sortCol = '';   // 'name' | 'einfluss' | 'interesse' | 'kontakt'
let sortDir = 1;    // 1 = aufsteigend, -1 = absteigend

// Contact interval warning (days)
let contactWarningDays = 90;

// Language
let appLang = 'de';   // 'de' | 'en'

// Todoist integration settings (token stored separately via safeStorage)
let todoistSettings = {
  username: '',
  syncMode: 'none',   // 'none' | 'start' | '30min' | '1hour'
  projectId: '',      // Todoist project ID to sync with ('' = Inbox)
  projectName: '',    // display name for UI
  importShId:   '',   // Gravinet stakeholder ID for importing new Todoist tasks
  importProjId: '',   // Gravinet project ID for importing new Todoist tasks
};

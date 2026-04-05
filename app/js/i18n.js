// ══ INTERNATIONALISATION ══
// Supported: 'de' (default), 'en'

const TRANSLATIONS = {
  de: {
    // Navigation
    nav_projects: 'Projekte', nav_contacts: 'Kontakte', nav_print: 'Drucken',
    nav_print_contacts: 'Kontaktdatenblätter', nav_print_report: 'Projektbericht',
    nav_data: 'Daten', nav_data_export: 'Exportieren', nav_data_import: 'Importieren',
    nav_data_json: 'JSON', nav_data_csv: 'CSV',
    nav_data_export_csv: 'Stakeholder exportieren', nav_data_import_csv: 'Stakeholder importieren',
    nav_settings: 'Einstellungen',
    settings_theme: 'Thema', settings_theme_dark: '🌙 Dunkel', settings_theme_light: '☀ Hell',
    settings_interval: 'Kontakt-Intervall',
    settings_lang: 'Sprache', settings_lang_de: 'Deutsch', settings_lang_en: 'English',
    // Stats
    stat_stakeholder: 'Stakeholder', stat_supportive: 'Supportiv', stat_critical: 'Kritisch',
    // Tabs
    tab_list: '📋 Stakeholder', tab_matrix: '🎯 Matrix', tab_project: 'Projekt',
    tab_plan_label: '{n}-Jahres-Plan',
    // Save
    save_loading: 'Lädt…', save_saved: 'Gespeichert', save_saving: 'Speichert…', save_error: 'Fehler',
    // Toolbar
    search_placeholder: 'Stakeholder suchen…',
    filter_all_groups: 'Alle Gruppen', filter_intern: 'Intern', filter_extern: 'Extern',
    filter_all_attitudes: 'Alle Haltungen', filter_supportiv: 'Supportiv',
    filter_neutral: 'Neutral', filter_kritisch: 'Kritisch',
    btn_add: '+ Hinzufügen',
    // Table headers
    th_name: 'Name / Funktion', th_gruppe: 'Gruppe', th_einfluss: 'Einfluss',
    th_interesse: 'Interesse', th_haltung: 'Haltung', th_strategie: 'Strategie',
    th_beziehung: 'Beziehung', th_kontakt: 'Letzter Kontakt', th_journal: 'Journal',
    // Table states
    table_no_project: 'Kein Projekt ausgewählt.',
    table_empty: 'Keine Stakeholder in diesem Projekt.',
    table_add_link: 'Hinzufügen →',
    // Row
    btn_edit: '✏ Bearbeiten',
    // Birthday
    birthday_today: 'heute', birthday_tomorrow: 'morgen',
    birthday_alert_today: 'hat heute Geburtstag', birthday_alert_soon: 'hat bald Geburtstag',
    // Matrix
    matrix_satisfy: 'Zufriedenstellen', matrix_engage: 'Aktiv einbinden',
    matrix_monitor: 'Beobachten', matrix_inform: 'Informiert halten',
    matrix_axis_influence: 'Einfluss →', matrix_axis_interest: 'Interesse →',
    matrix_attitude: 'Haltung:',
    // Plan
    btn_add_year: '+ Jahr hinzufügen',
    // Contacts view
    contact_search_placeholder: 'Kontakt suchen…', btn_new_contact: '+ Neuer Kontakt',
    contacts_empty: 'Noch keine Kontakte.<br>Lege deinen ersten Stakeholder an.',
    th_email: 'E-Mail', th_phone: 'Telefon', th_birthday: 'Geburtstag', th_projects: 'Projekte',
    // Projects view
    proj_active_badge: 'Aktiv', proj_plan_measures: 'Planmaßnahmen',
    btn_open: 'Öffnen', btn_to_list: 'Zu Stakeholder', btn_new_project: 'Neues Projekt',
    // Detail
    detail_tab_profile: '📋 Profil', detail_tab_journal: '📓 Journal',
    detail_influence: 'Einfluss', detail_interest: 'Interesse',
    detail_attitude: 'Haltung', detail_strategy: 'Strategie',
    detail_goal: 'Strategisches Ziel', detail_measures: 'Maßnahmen',
    btn_edit_full: '✏ Bearbeiten',
    // Journal
    journal_empty: 'Noch keine Einträge.<br>Dokumentiere deine erste Interaktion!',
    journal_entries: 'Einträge', journal_new_entry: 'Neuer Eintrag',
    journal_placeholder: 'Beschreibe die Interaktion, Themen, Stimmung, nächste Schritte…',
    btn_save_entry: 'Eintrag speichern', confirm_delete_journal: 'Journaleintrag löschen?',
    journal_type: 'Typ',
    jtype_meeting: '📅 Meeting', jtype_email: '✉ E-Mail', jtype_call: '📞 Telefonat',
    jtype_talk: '💬 Gespräch', jtype_other: '📝 Sonstiges',
    tab_journal_search: '🔍 Journal',
    journal_search_title: 'Journal-Suche',
    journal_search_placeholder: 'Journaleinträge durchsuchen…',
    journal_search_empty: 'Keine Einträge gefunden.',
    journal_search_all_types: 'Alle Typen',
    // Edit modal
    edit_title: 'Stakeholder bearbeiten', section_contact_data: 'Kontaktdaten',
    label_name: 'Name', label_role: 'Funktion / Rolle', label_email: 'E-Mail',
    label_phone: 'Telefon', label_birthday: 'Geburtstag',
    section_project_assign: 'Projektzuordnung', label_group: 'Gruppe', label_attitude: 'Haltung',
    label_influence_range: 'Einfluss (1–10)', label_interest_range: 'Interesse (1–10)',
    label_goal: 'Strategisches Ziel', label_measures: 'Maßnahmen (eine pro Zeile)',
    label_notes: 'Notizen', notes_placeholder: 'Interessen, rote Linien, persönliche Details…',
    btn_save: 'Speichern', btn_remove_from_project: 'Aus Projekt entfernen',
    // Picker
    picker_title: 'Stakeholder hinzufügen', picker_placeholder: 'Name oder Funktion suchen…',
    picker_all_added: 'Alle Kontakte sind bereits in diesem Projekt.<br>Lege einen neuen Stakeholder an.',
    btn_new_stakeholder: '+ Neuen Stakeholder anlegen', btn_picker_add: 'Hinzufügen',
    // Link modal
    link_subtitle_suffix: '· Projektzuordnung festlegen',
    link_goal_placeholder: 'Was soll sich in dieser Beziehung verändern?',
    btn_add_to_project: 'Zum Projekt hinzufügen',
    // New stakeholder
    new_sh_title: 'Neuer Stakeholder', placeholder_name: 'Vor- und Nachname',
    placeholder_role: 'z.B. Bereichsleiterin IT', placeholder_email: 'name@firma.at',
    placeholder_phone: '+43 1 234 5678', btn_save_stakeholder: 'Stakeholder speichern',
    // Kontakt edit
    kontakt_edit_title: 'Kontakt bearbeiten', btn_delete: '🗑 Löschen',
    // Project modal
    proj_modal_new: 'Projekt anlegen', proj_modal_edit: 'Projekt bearbeiten',
    label_project_name: 'Projektname', label_description: 'Beschreibung',
    placeholder_project_name: 'z.B. Stakeholder-Management 2025',
    placeholder_description: 'Kurze Beschreibung des Projekts…', btn_delete_long: '🗑 Löschen',
    // Print contacts modal
    print_contacts_title: 'Kontaktdatenblätter drucken',
    print_contacts_desc: 'Kontakte auswählen → wird als PDF in Downloads gespeichert.',
    btn_select_all: 'Alle auswählen / abwählen', btn_create_pdf: '🖨 PDF erstellen',
    // Plan year modal
    plan_year_new: 'Jahr hinzufügen', plan_year_edit: 'Jahr bearbeiten',
    label_year_label: 'Bezeichnung (z.B. Jahr 4)', label_year: 'Jahr',
    label_title_theme: 'Titel / Thema', placeholder_year_label: 'Jahr 4',
    placeholder_year: '2028', placeholder_title_theme: 'z.B. Konsolidieren & Gestalten',
    // Plan item modal
    plan_item_title: 'Maßnahme bearbeiten', label_quarter: 'Quartal', label_measure: 'Maßnahme',
    // Strategie
    strat_engage: 'Aktiv einbinden', strat_satisfy: 'Zufriedenstellen',
    strat_inform: 'Informiert halten', strat_monitor: 'Beobachten',
    // Badges
    badge_intern: 'INTERN', badge_extern: 'EXTERN',
    badge_supportiv: 'Supportiv', badge_neutral: 'Neutral', badge_kritisch: 'Kritisch',
    // Alerts
    alert_name_required: 'Bitte Name eingeben.', alert_proj_name: 'Bitte Projektname eingeben.',
    alert_select_contact: 'Bitte mindestens einen Kontakt auswählen.',
    alert_pdf_error: 'Fehler beim PDF-Erstellen: ', alert_import_error: 'Importfehler: ',
    confirm_delete_sh: '„{name}" vollständig aus allen Projekten löschen?',
    confirm_remove_sh: '„{name}" aus diesem Projekt entfernen?',
    confirm_delete_proj: 'Projekt „{name}" löschen? Die Stakeholder-Kontakte bleiben erhalten.',
    // Misc
    tooltip_edit_org: 'Bezeichnung bearbeiten', days_unit: 'T', days_label: 'Tage',
    // Print PDF
    print_basic_data: 'Grunddaten', print_proj_assignments: 'Projektzuordnungen',
    print_journal_section: 'Journal', print_no_journal: 'Keine Einträge vorhanden.',
    print_stakeholder_list: 'Stakeholder-Liste', print_matrix_section: 'Stakeholder-Matrix',
    print_col_name: 'Name / Funktion', print_col_group: 'Gruppe',
    print_col_influence: 'Einfluss', print_col_interest: 'Interesse',
    print_col_attitude: 'Haltung', print_col_strategy: 'Strategie',
    print_report_created: 'Projektbericht · Erstellt am', print_report_stakeholders: 'Stakeholder',
    print_goal_label: 'Strategisches Ziel', print_measures_label: 'Maßnahmen',
    print_journal_entries: 'Einträge',
    // Dashboard
    tab_dashboard: '📊 Dashboard',
    dash_overdue: 'Kontakt überfällig',
    dash_due_soon: 'Kontakt bald fällig',
    dash_birthdays: 'Geburtstage',
    dash_recent: 'Letzte Aktivität',
    dash_no_overdue: 'Alle Kontakte sind aktuell.',
    dash_no_soon: 'Keine Kontakte demnächst fällig.',
    dash_no_birthdays: 'Keine Geburtstage in den nächsten 30 Tagen.',
    dash_no_recent: 'Noch keine Journal-Einträge.',
    dash_never: 'Nie',
    dash_search_placeholder: 'Stakeholder suchen…',
    dash_search_empty: 'Keine Ergebnisse.',
    // Relationship
    label_beziehung: 'Beziehungsstärke (1–5)',
    detail_beziehung: 'Beziehungsstärke',
    // Contact interval per stakeholder
    label_contact_interval: 'Kontakt-Intervall',
    interval_global: 'Standard ({n}d)',
    interval_days: '{n} Tage',
  },
  en: {
    // Navigation
    nav_projects: 'Projects', nav_contacts: 'Contacts', nav_print: 'Print',
    nav_print_contacts: 'Contact Sheets', nav_print_report: 'Project Report',
    nav_data: 'Data', nav_data_export: 'Export', nav_data_import: 'Import',
    nav_data_json: 'JSON', nav_data_csv: 'CSV',
    nav_data_export_csv: 'Export stakeholders', nav_data_import_csv: 'Import stakeholders',
    nav_settings: 'Settings',
    settings_theme: 'Theme', settings_theme_dark: '🌙 Dark', settings_theme_light: '☀ Light',
    settings_interval: 'Contact Interval',
    settings_lang: 'Language', settings_lang_de: 'Deutsch', settings_lang_en: 'English',
    // Stats
    stat_stakeholder: 'Stakeholders', stat_supportive: 'Supportive', stat_critical: 'Critical',
    // Tabs
    tab_list: '📋 Stakeholders', tab_matrix: '🎯 Matrix', tab_project: 'Project',
    tab_plan_label: '{n}-Year Plan',
    // Save
    save_loading: 'Loading…', save_saved: 'Saved', save_saving: 'Saving…', save_error: 'Error',
    // Toolbar
    search_placeholder: 'Search stakeholders…',
    filter_all_groups: 'All Groups', filter_intern: 'Internal', filter_extern: 'External',
    filter_all_attitudes: 'All Attitudes', filter_supportiv: 'Supportive',
    filter_neutral: 'Neutral', filter_kritisch: 'Critical',
    btn_add: '+ Add',
    // Table headers
    th_name: 'Name / Role', th_gruppe: 'Group', th_einfluss: 'Influence',
    th_interesse: 'Interest', th_haltung: 'Attitude', th_strategie: 'Strategy',
    th_beziehung: 'Relationship', th_kontakt: 'Last Contact', th_journal: 'Journal',
    // Table states
    table_no_project: 'No project selected.',
    table_empty: 'No stakeholders in this project.',
    table_add_link: 'Add →',
    // Row
    btn_edit: '✏ Edit',
    // Birthday
    birthday_today: 'today', birthday_tomorrow: 'tomorrow',
    birthday_alert_today: 'has a birthday today', birthday_alert_soon: 'has a birthday soon',
    // Matrix
    matrix_satisfy: 'Keep Satisfied', matrix_engage: 'Manage Closely',
    matrix_monitor: 'Monitor', matrix_inform: 'Keep Informed',
    matrix_axis_influence: 'Influence →', matrix_axis_interest: 'Interest →',
    matrix_attitude: 'Attitude:',
    // Plan
    btn_add_year: '+ Add Year',
    // Contacts view
    contact_search_placeholder: 'Search contacts…', btn_new_contact: '+ New Contact',
    contacts_empty: 'No contacts yet.<br>Create your first stakeholder.',
    th_email: 'E-Mail', th_phone: 'Phone', th_birthday: 'Birthday', th_projects: 'Projects',
    // Projects view
    proj_active_badge: 'Active', proj_plan_measures: 'Plan items',
    btn_open: 'Open', btn_to_list: 'To Stakeholders', btn_new_project: 'New Project',
    // Detail
    detail_tab_profile: '📋 Profile', detail_tab_journal: '📓 Journal',
    detail_influence: 'Influence', detail_interest: 'Interest',
    detail_attitude: 'Attitude', detail_strategy: 'Strategy',
    detail_goal: 'Strategic Goal', detail_measures: 'Measures',
    btn_edit_full: '✏ Edit',
    // Journal
    journal_empty: 'No entries yet.<br>Document your first interaction!',
    journal_entries: 'entries', journal_new_entry: 'New Entry',
    journal_placeholder: 'Describe the interaction, topics, mood, next steps…',
    btn_save_entry: 'Save Entry', confirm_delete_journal: 'Delete journal entry?',
    journal_type: 'Type',
    jtype_meeting: '📅 Meeting', jtype_email: '✉ E-Mail', jtype_call: '📞 Call',
    jtype_talk: '💬 Conversation', jtype_other: '📝 Other',
    tab_journal_search: '🔍 Journal',
    journal_search_title: 'Journal Search',
    journal_search_placeholder: 'Search journal entries…',
    journal_search_empty: 'No entries found.',
    journal_search_all_types: 'All types',
    // Edit modal
    edit_title: 'Edit Stakeholder', section_contact_data: 'Contact Details',
    label_name: 'Name', label_role: 'Function / Role', label_email: 'E-Mail',
    label_phone: 'Phone', label_birthday: 'Birthday',
    section_project_assign: 'Project Assignment', label_group: 'Group', label_attitude: 'Attitude',
    label_influence_range: 'Influence (1–10)', label_interest_range: 'Interest (1–10)',
    label_goal: 'Strategic Goal', label_measures: 'Measures (one per line)',
    label_notes: 'Notes', notes_placeholder: 'Interests, red lines, personal details…',
    btn_save: 'Save', btn_remove_from_project: 'Remove from Project',
    // Picker
    picker_title: 'Add Stakeholder', picker_placeholder: 'Search by name or role…',
    picker_all_added: 'All contacts are already in this project.<br>Create a new stakeholder.',
    btn_new_stakeholder: '+ Create New Stakeholder', btn_picker_add: 'Add',
    // Link modal
    link_subtitle_suffix: '· Set project assignment',
    link_goal_placeholder: 'What should change in this relationship?',
    btn_add_to_project: 'Add to Project',
    // New stakeholder
    new_sh_title: 'New Stakeholder', placeholder_name: 'First and last name',
    placeholder_role: 'e.g. Head of IT', placeholder_email: 'name@company.com',
    placeholder_phone: '+1 234 567 8900', btn_save_stakeholder: 'Save Stakeholder',
    // Kontakt edit
    kontakt_edit_title: 'Edit Contact', btn_delete: '🗑 Delete',
    // Project modal
    proj_modal_new: 'Create Project', proj_modal_edit: 'Edit Project',
    label_project_name: 'Project Name', label_description: 'Description',
    placeholder_project_name: 'e.g. Stakeholder Management 2025',
    placeholder_description: 'Brief description of the project…', btn_delete_long: '🗑 Delete',
    // Print contacts modal
    print_contacts_title: 'Print Contact Sheets',
    print_contacts_desc: 'Select contacts → saved as PDF to Downloads.',
    btn_select_all: 'Select all / deselect all', btn_create_pdf: '🖨 Create PDF',
    // Plan year modal
    plan_year_new: 'Add Year', plan_year_edit: 'Edit Year',
    label_year_label: 'Label (e.g. Year 4)', label_year: 'Year',
    label_title_theme: 'Title / Theme', placeholder_year_label: 'Year 4',
    placeholder_year: '2028', placeholder_title_theme: 'e.g. Consolidate & Shape',
    // Plan item modal
    plan_item_title: 'Edit Measure', label_quarter: 'Quarter', label_measure: 'Measure',
    // Strategie
    strat_engage: 'Manage Closely', strat_satisfy: 'Keep Satisfied',
    strat_inform: 'Keep Informed', strat_monitor: 'Monitor',
    // Badges
    badge_intern: 'INTERNAL', badge_extern: 'EXTERNAL',
    badge_supportiv: 'Supportive', badge_neutral: 'Neutral', badge_kritisch: 'Critical',
    // Alerts
    alert_name_required: 'Please enter a name.', alert_proj_name: 'Please enter a project name.',
    alert_select_contact: 'Please select at least one contact.',
    alert_pdf_error: 'Error creating PDF: ', alert_import_error: 'Import error: ',
    confirm_delete_sh: 'Delete "{name}" from all projects?',
    confirm_remove_sh: 'Remove "{name}" from this project?',
    confirm_delete_proj: 'Delete project "{name}"? Stakeholder contacts will be preserved.',
    // Misc
    tooltip_edit_org: 'Edit name', days_unit: 'd', days_label: 'days',
    // Print PDF
    print_basic_data: 'Basic Data', print_proj_assignments: 'Project Assignments',
    print_journal_section: 'Journal', print_no_journal: 'No entries available.',
    print_stakeholder_list: 'Stakeholder List', print_matrix_section: 'Stakeholder Matrix',
    print_col_name: 'Name / Role', print_col_group: 'Group',
    print_col_influence: 'Influence', print_col_interest: 'Interest',
    print_col_attitude: 'Attitude', print_col_strategy: 'Strategy',
    print_report_created: 'Project Report · Created on', print_report_stakeholders: 'Stakeholders',
    print_goal_label: 'Strategic Goal', print_measures_label: 'Measures',
    print_journal_entries: 'entries',
    // Dashboard
    tab_dashboard: '📊 Dashboard',
    dash_overdue: 'Contact Overdue',
    dash_due_soon: 'Due Soon',
    dash_birthdays: 'Birthdays',
    dash_recent: 'Recent Activity',
    dash_no_overdue: 'All contacts are up to date.',
    dash_no_soon: 'No contacts due soon.',
    dash_no_birthdays: 'No birthdays in the next 30 days.',
    dash_no_recent: 'No journal entries yet.',
    dash_never: 'Never',
    dash_search_placeholder: 'Search stakeholders…',
    dash_search_empty: 'No results.',
    // Relationship
    label_beziehung: 'Relationship Strength (1–5)',
    detail_beziehung: 'Relationship',
    // Contact interval per stakeholder
    label_contact_interval: 'Contact Interval',
    interval_global: 'Default ({n}d)',
    interval_days: '{n} days',
  }
};

// Translate a key. Falls back to German if key missing in current lang.
function t(key) {
  return (TRANSLATIONS[appLang] || TRANSLATIONS.de)[key] ?? TRANSLATIONS.de[key] ?? key;
}

// Apply translations to all [data-i18n], [data-i18n-ph], [data-i18n-title] elements.
// Also calls renderAll() to refresh all JS-rendered content.
function applyTranslations() {
  document.documentElement.lang = appLang === 'en' ? 'en' : 'de';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(el.dataset.i18n);
    if (val != null) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const val = t(el.dataset.i18nHtml);
    if (val != null) el.innerHTML = val;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const val = t(el.dataset.i18nPh);
    if (val != null) el.placeholder = val;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const val = t(el.dataset.i18nTitle);
    if (val != null) el.title = val;
  });
  renderAll();
  updatePlanTabLabel();
}

// Change language, save, and re-render.
function setLang(lang) {
  appLang = lang;
  saveNow();
  applyTranslations();
}

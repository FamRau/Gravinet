// ══ CONSTANTS ══
const LEGACY_STORAGE_KEY = 'gravinet_v1';

const HALTUNG_COLORS = {
  supportiv: 'var(--accent3)',
  neutral:   'var(--muted)',
  kritisch:  'var(--danger)'
};

const STRATEGIE_MAP = {
  hh: 'strat_engage',
  hn: 'strat_satisfy',
  nh: 'strat_inform',
  nn: 'strat_monitor'
};

const DEFAULT_PLAN = [
  { id:'p1', label:'Jahr 1', year:'2025', title:'Verstehen & Vertrauen', items:[
    {q:'Q1',text:'Antrittsrunden mit allen Direktionen & Geschäftsleitung',done:false},
    {q:'Q1',text:'Stakeholder-Map erstellen, ersten Einfluss-Scan durchführen',done:false},
    {q:'Q2',text:'Erwartungsworkshop mit kritischen Stakeholdern',done:false},
    {q:'Q2',text:'Quick Wins in Abstimmung mit wichtigsten Lieferanten identifizieren',done:false},
    {q:'Q3',text:'Jour-fixe-Struktur mit internen Schlüssel-SH etablieren',done:false},
    {q:'Q3',text:'Erstes Stakeholder-Review & Plan-Update',done:false},
    {q:'Q4',text:'Jahresbilanz: Beziehungsqualität messen, Strategie anpassen',done:false},
  ]},
  { id:'p2', label:'Jahr 2', year:'2026', title:'Konsolidieren & Gestalten', items:[
    {q:'Q1',text:'Gemeinsame Projekte mit strategischen Partnern lancieren',done:false},
    {q:'Q1',text:'Kritische Beziehungen gezielt entwickeln',done:false},
    {q:'Q2',text:'Feedbackschleifen & Eskalationspfade institutionalisieren',done:false},
    {q:'Q2',text:'Externe Stakeholder in Prozessoptimierung einbinden',done:false},
    {q:'Q3',text:'Halbjährliches Stakeholder-Forum einführen',done:false},
    {q:'Q4',text:'Wirkungsmessung: KPIs für Stakeholder-Zufriedenheit definieren',done:false},
  ]},
  { id:'p3', label:'Jahr 3', year:'2027', title:'Verstetigen & Ausbauen', items:[
    {q:'Q1',text:'Strategische Partnerschaften vertraglich festigen',done:false},
    {q:'Q1',text:'Neue Stakeholder aus Wachstumsinitiativen identifizieren',done:false},
    {q:'Q2',text:'Übergabe-/Nachfolgeplanung für Schlüsselbeziehungen vorbereiten',done:false},
    {q:'Q2',text:'Best-Practice-Sharing mit anderen Direktionen',done:false},
    {q:'Q3',text:'Vollständige Überarbeitung des Stakeholder-Plans',done:false},
    {q:'Q4',text:'Zwischenbilanz & Planung für Phase 2',done:false},
  ]},
  { id:'p4', label:'Jahr 4', year:'2028', title:'Wachsen & Innovieren', items:[
    {q:'Q1',text:'Neue strategische Kooperationen initiieren',done:false},
    {q:'Q2',text:'Stakeholder-Netzwerk auf neue Bereiche ausweiten',done:false},
    {q:'Q3',text:'Innovations-Workshops mit Schlüsselpartnern',done:false},
    {q:'Q4',text:'Jahresbilanz & Weiterentwicklung der Strategie',done:false},
  ]},
  { id:'p5', label:'Jahr 5', year:'2029', title:'Konsolidieren & Übergeben', items:[
    {q:'Q1',text:'Langfristige Sicherung aller Schlüsselbeziehungen',done:false},
    {q:'Q2',text:'Dokumentation von Lessons Learned',done:false},
    {q:'Q3',text:'Nachfolgeplanung für kritische Stakeholder-Rollen',done:false},
    {q:'Q4',text:'Abschlussbilanz 5-Jahres-Zyklus & Ausblick 2030+',done:false},
  ]},
];

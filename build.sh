#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  Stakeholder D4 – AppImage Build-Skript
#  Ausführen auf deinem Linux-Rechner:  chmod +x build.sh && ./build.sh
# ═══════════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║  Stakeholder D4  –  AppImage Build               ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Node.js prüfen ──
if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js nicht gefunden. Bitte installieren: https://nodejs.org${NC}"
  exit 1
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 16 ]; then
  echo -e "${RED}✗ Node.js >= 16 benötigt (gefunden: $(node -v))${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) gefunden${NC}"

# ── Abhängigkeiten installieren ──
cd "$DIR"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}▶ Installiere Abhängigkeiten (npm install)…${NC}"
  npm install
  echo -e "${GREEN}✓ Abhängigkeiten installiert${NC}"
else
  echo -e "${GREEN}✓ node_modules bereits vorhanden${NC}"
fi

# ── AppImage bauen ──
echo -e "${YELLOW}▶ Baue AppImage (kann 2–5 Minuten dauern)…${NC}"
npm run build

# ── Ergebnis prüfen ──
APPIMAGE=$(find "$DIR/dist" -name "*.AppImage" | head -1)
if [ -z "$APPIMAGE" ]; then
  echo -e "${RED}✗ AppImage nicht gefunden. Prüfe die Build-Ausgabe oben.${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗"
echo -e "║  ✓ AppImage erfolgreich erstellt!                        ║"
echo -e "╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Datei:    ${CYAN}${APPIMAGE}${NC}"
echo -e "  Größe:    $(du -sh "$APPIMAGE" | cut -f1)"
echo ""
echo -e "${YELLOW}  Starten:${NC}"
echo -e "  chmod +x \"$APPIMAGE\""
echo -e "  \"$APPIMAGE\""
echo ""
echo -e "${YELLOW}  GNOME Desktop-Integration:${NC}"
echo -e "  Rechtsklick auf .AppImage → 'Als Programm ausführen' aktivieren"
echo -e "  Oder: AppImage in ~/Anwendungen/ ablegen und per Dateimanager starten"
echo ""

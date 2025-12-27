#!/bin/bash

# ============================================================================
# ODEN FORGE - INSTALLER
# ============================================================================
# Instala todo lo necesario para usar Oden Forge:
# - Comandos /oden:* (52 comandos unificados)
# - Scripts de soporte
# - Hooks
# - Rules de Claude
# - Carpetas para PRDs y Epics
# - Agentes de desarrollo (opcional)
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    ODEN FORGE INSTALLER                      ║${NC}"
echo -e "${BLUE}║         Documentation-First Development Toolkit              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# CHECK PREREQUISITES
# ============================================================================

echo -e "${YELLOW}Verificando requisitos...${NC}"

# Check if Claude directory exists
if [ ! -d "$HOME/.claude" ]; then
    echo -e "${YELLOW}Creando directorio ~/.claude...${NC}"
    mkdir -p "$HOME/.claude"
fi

# Check for git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git no está instalado. Por favor instala git primero.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git instalado${NC}"

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠ GitHub CLI (gh) no está instalado.${NC}"
    echo -e "  Para sync con GitHub, instala: https://cli.github.com/"
    GH_INSTALLED=false
else
    echo -e "${GREEN}✓ GitHub CLI instalado${NC}"
    GH_INSTALLED=true
fi

echo ""

# ============================================================================
# INSTALL COMMANDS
# ============================================================================

echo -e "${YELLOW}Instalando comandos /oden:*...${NC}"

mkdir -p "$HOME/.claude/commands/oden"

if [ -d "$SCRIPT_DIR/.claude/commands/oden" ]; then
    cp -r "$SCRIPT_DIR/.claude/commands/oden/"* "$HOME/.claude/commands/oden/"
    ODEN_COUNT=$(ls "$HOME/.claude/commands/oden/"*.md 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ $ODEN_COUNT comandos /oden:* instalados${NC}"
else
    echo -e "${RED}❌ No se encontraron comandos${NC}"
    exit 1
fi

echo ""

# ============================================================================
# INSTALL SCRIPTS
# ============================================================================

echo -e "${YELLOW}Instalando scripts...${NC}"

mkdir -p "$HOME/.claude/scripts/oden"

if [ -d "$SCRIPT_DIR/.claude/scripts/oden" ]; then
    cp -r "$SCRIPT_DIR/.claude/scripts/oden/"* "$HOME/.claude/scripts/oden/"
    chmod +x "$HOME/.claude/scripts/oden/"*.sh 2>/dev/null || true
    SCRIPT_COUNT=$(ls "$HOME/.claude/scripts/oden/"*.sh 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ $SCRIPT_COUNT scripts instalados${NC}"
else
    echo -e "${YELLOW}⚠ No se encontraron scripts${NC}"
fi

echo ""

# ============================================================================
# INSTALL HOOKS
# ============================================================================

echo -e "${YELLOW}Instalando hooks...${NC}"

mkdir -p "$HOME/.claude/hooks"

if [ -d "$SCRIPT_DIR/.claude/hooks" ]; then
    cp -r "$SCRIPT_DIR/.claude/hooks/"* "$HOME/.claude/hooks/"
    chmod +x "$HOME/.claude/hooks/"*.sh 2>/dev/null || true
    echo -e "${GREEN}✓ Hooks instalados${NC}"
else
    echo -e "${YELLOW}⚠ No se encontraron hooks${NC}"
fi

echo ""

# ============================================================================
# INSTALL RULES
# ============================================================================

echo -e "${YELLOW}Instalando rules...${NC}"

mkdir -p "$HOME/.claude/rules"

if [ -d "$SCRIPT_DIR/.claude/rules" ]; then
    cp -r "$SCRIPT_DIR/.claude/rules/"* "$HOME/.claude/rules/"
    RULES_COUNT=$(ls "$HOME/.claude/rules/"*.md 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ $RULES_COUNT rules instaladas${NC}"
else
    echo -e "${YELLOW}⚠ No se encontraron rules${NC}"
fi

echo ""

# ============================================================================
# CREATE FOLDERS
# ============================================================================

echo -e "${YELLOW}Creando carpetas de trabajo...${NC}"

mkdir -p "$HOME/.claude/prds"
mkdir -p "$HOME/.claude/epics"
touch "$HOME/.claude/prds/.gitkeep" 2>/dev/null || true
touch "$HOME/.claude/epics/.gitkeep" 2>/dev/null || true
echo -e "${GREEN}✓ Carpetas prds/ y epics/ creadas${NC}"

echo ""

# ============================================================================
# INSTALL AGENTS (OPTIONAL)
# ============================================================================

echo -e "${YELLOW}¿Deseas instalar los agentes de desarrollo? (y/n)${NC}"
read -r INSTALL_AGENTS

if [[ "$INSTALL_AGENTS" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Instalando agentes...${NC}"

    mkdir -p "$HOME/.claude/agents"

    if [ -d "$SCRIPT_DIR/.claude/agents" ]; then
        cp -r "$SCRIPT_DIR/.claude/agents/"* "$HOME/.claude/agents/"
        AGENTS_COUNT=$(ls "$HOME/.claude/agents/"*.md 2>/dev/null | wc -l | tr -d ' ')
        echo -e "${GREEN}✓ $AGENTS_COUNT agentes instalados${NC}"
    else
        echo -e "${YELLOW}⚠ No se encontraron agentes en el repo.${NC}"
        echo -e "  Usa /oden:init-agents dentro de Claude Code para instalarlos.${NC}"
    fi
else
    echo -e "${BLUE}Agentes no instalados. Usa /oden:init-agents después.${NC}"
fi

echo ""

# ============================================================================
# GITHUB CLI SETUP
# ============================================================================

if [ "$GH_INSTALLED" = true ]; then
    # Check if already authenticated
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✓ GitHub CLI ya está autenticado${NC}"
    else
        echo -e "${YELLOW}¿Deseas configurar GitHub CLI ahora? (y/n)${NC}"
        read -r SETUP_GH

        if [[ "$SETUP_GH" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Iniciando autenticación de GitHub...${NC}"
            gh auth login
        fi
    fi
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  INSTALACIÓN COMPLETADA                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}COMANDOS INSTALADOS (/oden:*):${NC}"
echo -e "  Setup:        init, init-agents, init-mcp, help"
echo -e "  Pre-Dev:      architect, analyze, spec, plan, checklist"
echo -e "  GitHub:       prd-new, epic-sync, issue-start, ..."
echo -e "  Desarrollo:   dev, test, debug, research, daily"
echo -e "  Git:          git start, git pr, git finish"
echo ""
echo -e "${BLUE}ESTRUCTURA CREADA:${NC}"
echo -e "  ~/.claude/commands/oden/   → Comandos"
echo -e "  ~/.claude/scripts/oden/    → Scripts"
echo -e "  ~/.claude/hooks/           → Hooks"
echo -e "  ~/.claude/rules/           → Rules"
echo -e "  ~/.claude/prds/            → PRDs"
echo -e "  ~/.claude/epics/           → Epics"
echo ""
echo -e "${BLUE}PRÓXIMOS PASOS:${NC}"
echo -e "  1. Abre Claude Code en tu proyecto"
echo -e "  2. Ejecuta: /oden:init"
echo -e "  3. Sigue el wizard"
echo ""
echo -e "${YELLOW}DOCUMENTACIÓN:${NC}"
echo -e "  README: $SCRIPT_DIR/README.md"
echo -e "  Help:   /oden:help"
echo ""

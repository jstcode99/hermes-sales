#!/bin/bash

# Matriz de componentes oficiales de shadcn/ui
components=(
  "accordion" "alert" "alert-dialog" "aspect-ratio" "avatar"
  "badge" "breadcrumb" "button" "calendar" "card"
  "carousel" "chart" "checkbox" "collapsible" "command"
  "context-menu" "dialog" "drawer" "dropdown-menu" "hover-card"
  "input" "input-otp" "label" "menubar" "navigation-menu"
  "pagination" "popover" "progress" "radio-group" "resizable"
  "scroll-area" "select" "separator" "sheet" "sidebar"
  "skeleton" "slider" "sonner" "switch" "table"
  "tabs" "textarea" "toast" "toggle" "toggle-group" "tooltip"
)

echo "⚡ Usando Bun para instalar componentes de shadcn..."

# Recorremos la matriz
for component in "${components[@]}"; do
  echo "--- Instalando: $component ---"
  # --bun asegura que se ejecute usando el runtime de Bun específicamente
  bunx --bun shadcn@latest add "$component" -y
done

echo "✨ ¡Proceso finalizado con éxito!"

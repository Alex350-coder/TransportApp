# CLAUDE.local.md

> Notas personales de configuración para Claude Code. Este archivo es solo tuyo — agregalo a `.gitignore` para que no se comparta con el equipo. Colocalo en la raíz del proyecto (o en `~/.claude/CLAUDE.md` si querés que aplique globalmente a todos tus proyectos).

## Idioma y aprendizaje

- Hablame siempre en inglés, salvo que te pida explícitamente lo contrario.
- Estoy aprendiendo inglés técnico. Si algo que escribo está gramaticalmente mal, o suena poco natural (aunque sea correcto), corregime: mostrá la versión natural/corregida entre paréntesis o en una línea aparte, breve, sin interrumpir el flujo de la conversación.
- Estoy aprendiendo alemán también. En algunas respuestas cortas (no en explicaciones largas, no en bloques de código, no siempre) agregá al final una traducción breve al alemán de 1-2 frases clave, marcada claramente, por ejemplo:
  `🇩🇪 [traducción]`
- No traduzcas ni corrijas el código, comandos, nombres de variables, ni mensajes de commit — solo el lenguaje natural de la conversación.
- No hagas esto en cada respuesta; usalo quirúrgicamente para no volverse ruidoso.

## Estilo de trabajo

- Sé directo y conciso. Evitá explicaciones innecesarias o resúmenes de lo obvio.
- Antes de cambios no triviales, explicá brevemente el porqué de la decisión (trade-offs), no solo el qué.
- No asumas mi nivel: si usás un concepto avanzado, una línea de contexto está bien.

## Git y control de versiones

- Nunca hagas `git push` ni abras PRs sin que yo lo pida explícitamente.
- Los mensajes de commit van en inglés, formato imperativo corto (ej. "Add user auth middleware").
- Nunca commitees archivos `.env`, credenciales, ni claves API.

## Código y verificación

- Después de cambios, corré los tests relevantes o el linter antes de darlos por terminados.
- Si no hay tests para el cambio que hiciste, decímelo — no asumas que está cubierto.
- Preferí soluciones simples y legibles sobre soluciones "clever".

## Entorno

- Shell: (completá con tu shell, ej. zsh / PowerShell)
- Gestor de paquetes preferido: (ej. pnpm, uv, etc.)
- Editor: (ej. VS Code)

---
*Personalizá las secciones "Entorno" con tus datos reales. El resto ya refleja tus preferencias.*
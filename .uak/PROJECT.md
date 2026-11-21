# PROJECT · Nerdearla Vibeathon by Devin · Reto 3 EIRA (sprint mode)

> Filled in by `/uak-setup` with the human at minute 0. uak reads the flat fields of the last block from
> the remote `main`, so a stale worktree can never change permissions.

## Event
| Field | Value |
|---|---|
| Event / challenge | Nerdearla Vibeathon by Devin, CDMX · Reto 3 "Consolidación y visualización del impacto social" (EIRA Movimiento Rosa A.C.) · https://vibeathon-mexico-2026.devpost.com/ |
| Start | 2026-11-21 11:45 America/Mexico_City |
| Official deadline | 2026-11-21 16:00 America/Mexico_City · platforms: Devpost (form + repo + YouTube video) |
| Product name | _(sin nombre por ahora; decisión del humano)_ |
| Schedule (`uak clock`) | design lock 12:00 · first claim by 12:05 · walking skeleton 12:15 · plan-B video 13:52 · freeze 15:21 |
| Clean rehearsal / plan B | 15:39 |
| Internal submission | 15:45 |
| Humans | crisMmolina: todo (producto, código, demo) · submission owner: crisMmolina |
| Agents | cris-1, cris-2 (posibles agentes extra desde Devin: [To validate] límite 2 por humano) |
| Machines | 1 laptop (macOS) · ports already taken: ninguno conocido |

## Official rubric (weights not published; split evenly, unverified)
| ID | Criterion | Weight | Evidence in the demo |
|---|---|---:|---|
| C1 | Funcionamiento real (caso completo, datos ficticios) | 20 | Pasos 1→6 de IDEA §4 con el caso práctico de la guía EIRA |
| C2 | Usabilidad / utilidad para EIRA | 20 | Flujo guiado, botón de datos demo, español claro |
| C3 | Privacidad y confianza | 20 | 100 % local en el navegador, enmascaramiento, nunca fusión automática, bitácora |
| C4 | Escalabilidad / otra campaña | 20 | Presets de mapeo y reglas en JSON |
| C5 | Impacto e innovación | 20 | Mapa 3D que baja al deduplicar; informe trazable |

## Event rules
| Topic | Confirmed rule | Source |
|---|---|---|
| AI use / prior code | IA permitida (vibecoding) · código previo: [To validate] | Humano / Devpost |
| Data and licenses | Solo datos sintéticos; GeoJSON INEGI con atribución [To validate] | Guía EIRA |
| Format and video limits | Video en YouTube; duración no publicada → objetivo ≤ 3 min mostrando el flujo completo | Devpost |

## Plan B
- A video of the whole flow at `demo/plan-b.mp4` (v1 at 13:52, final at 15:39). Use it if network, Mapbox token or the live demo fails. Mapbox falla → MapLibre + GeoJSON local.

## Executable config
A human sets `yes`. A missing field means `no`.

```text
Mode: sprint
Backlog-Proposed-Epoch: 0
Backlog-Approved: yes
Autonomy: yes
Auto-Merge: yes
Review-Mode: claims
Plan-Channel: claims
Freeze-Epoch: 1795296105
Lease-Seconds: 2700
Review-Lease-Seconds: 14400
Events-Per-Session: 100
Checkpoint-Percent: 60
Merge-Lease-Seconds: 1800
Merge-Wait-Seconds: 180
Merge-Adopt-Seconds: 300
Max-Parallel-Subagents: 4
Opus-Subagents-Per-Session: 2
Pace: auto
Subagent-Hard-Cap: 6
Strong-Hard-Cap: 3
Subagents-Per-Session: 40
Subagents-Per-Machine: 8
Subagent-Burst-Per-Minute: 6
Max-Worktree-Agents: 6
Blackbox: on
Additive-Paths: -
Test-First: yes
```

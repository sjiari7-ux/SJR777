/* ═══════════════════════════════════════════════════════════════
   ARCADIA MMO — Game Engine
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'souq-ledger-state-v7';
const SAVE_INTERVAL_MS = 5000;
const TICK_MS = 1000;
const ENERGY_REGEN_MS = 5*60*1000;
const HEALTH_REGEN_MS = 30*1000;
const PRICE_TICK_MS = 15000;
const MISSION_PERIOD_MS = 24*60*60*1000;
const LB_EVOLVE_MS = 45000;
const PRESTIGE_LEVEL_REQ = 20;
const GEAR_BAG_LIMIT = 40;
const PRICE_HISTORY_LENGTH = 12;

// Resource icons are self-contained inline SVG images (base64 data URIs, flat icons8-style ore art) — no network calls.
function resIcon(b64svg, alt){
  return `<img class="res-icon" src="data:image/svg+xml;base64,${b64svg}" alt="${alt}">`;
}
// ─── Game Data: Resources, Goods, Recipes, Zones, Classes, Gear ───
const RESOURCES = {
  wood: { name:'Wood', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoLTggMjIgMzgpIj4KICAgIDxjbGlwUGF0aCBpZD0iY3Atd2EiPjxjaXJjbGUgY3g9IjIyIiBjeT0iMzgiIHI9IjEyLjUiLz48L2NsaXBQYXRoPgogICAgPGNpcmNsZSBjeD0iMjIiIGN5PSIzOCIgcj0iMTIuNSIgZmlsbD0iIzZENEM0MSIvPgogICAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLXdhKSI+CiAgICAgIDxlbGxpcHNlIGN4PSIxNy42MjUiIGN5PSIzMy42MjUiIHJ4PSI4LjUiIHJ5PSI4LjUiIGZpbGw9IiM4RDZFNjMiLz4KICAgIDwvZz4KICAgIDxjaXJjbGUgY3g9IjIyIiBjeT0iMzgiIHI9IjcuNzUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzVENDAzNyIgc3Ryb2tlLXdpZHRoPSIxLjYiIG9wYWNpdHk9IjAuNTUiLz4KICAgIDxjaXJjbGUgY3g9IjIyIiBjeT0iMzgiIHI9IjQuMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNUQ0MDM3IiBzdHJva2Utd2lkdGg9IjEuNiIgb3BhY2l0eT0iMC41NSIvPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InJvdGF0ZSg2IDQxIDM0KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLXdiIj48Y2lyY2xlIGN4PSI0MSIgY3k9IjM0IiByPSIxNSIvPjwvY2xpcFBhdGg+CiAgICA8Y2lyY2xlIGN4PSI0MSIgY3k9IjM0IiByPSIxNSIgZmlsbD0iIzZENEM0MSIvPgogICAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLXdiKSI+CiAgICAgIDxlbGxpcHNlIGN4PSIzNS43NSIgY3k9IjI4Ljc1IiByeD0iMTAuMjAwMDAwMDAwMDAwMDAxIiByeT0iMTAuMjAwMDAwMDAwMDAwMDAxIiBmaWxsPSIjOEQ2RTYzIi8+CiAgICA8L2c+CiAgICA8Y2lyY2xlIGN4PSI0MSIgY3k9IjM0IiByPSI5LjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzVENDAzNyIgc3Ryb2tlLXdpZHRoPSIxLjYiIG9wYWNpdHk9IjAuNTUiLz4KICAgIDxjaXJjbGUgY3g9IjQxIiBjeT0iMzQiIHI9IjQuOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNUQ0MDM3IiBzdHJva2Utd2lkdGg9IjEuNiIgb3BhY2l0eT0iMC41NSIvPgogIDwvZz48L3N2Zz4=','Wood'), basePrice:4 },
  stone: { name:'Stone', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoLTEyIDIxIDM3KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLXN0b25lYSI+PGVsbGlwc2UgY3g9IjIxIiBjeT0iMzciIHJ4PSIxMSIgcnk9IjkiLz48L2NsaXBQYXRoPgogICAgPGVsbGlwc2UgY3g9IjIxIiBjeT0iMzciIHJ4PSIxMSIgcnk9IjkiIGZpbGw9IiM1NDZFN0EiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1zdG9uZWEpIj4KICAgICAgPGVsbGlwc2UgY3g9IjE3IiBjeT0iMzMuNSIgcng9IjYuODIiIHJ5PSI1LjU4IiBmaWxsPSIjQjBCRUM1Ii8+CiAgICA8L2c+CiAgPC9nPgogIDxnIHRyYW5zZm9ybT0icm90YXRlKDYgNDAgMzgpIj4KICAgIDxjbGlwUGF0aCBpZD0iY3Atc3RvbmViIj48ZWxsaXBzZSBjeD0iNDAiIGN5PSIzOCIgcng9IjE0LjUiIHJ5PSIxMS41Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSI0MCIgY3k9IjM4IiByeD0iMTQuNSIgcnk9IjExLjUiIGZpbGw9IiM1NDZFN0EiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1zdG9uZWIpIj4KICAgICAgPGVsbGlwc2UgY3g9IjM1IiBjeT0iMzQiIHJ4PSI4LjciIHJ5PSI2Ljg5OTk5OTk5OTk5OTk5OTUiIGZpbGw9IiNCMEJFQzUiLz4KICAgIDwvZz4KICA8L2c+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoLTYgMzAgMjQpIj4KICAgIDxjbGlwUGF0aCBpZD0iY3Atc3RvbmVjIj48ZWxsaXBzZSBjeD0iMzAiIGN5PSIyNCIgcng9IjguNSIgcnk9IjYuOCIvPjwvY2xpcFBhdGg+CiAgICA8ZWxsaXBzZSBjeD0iMzAiIGN5PSIyNCIgcng9IjguNSIgcnk9IjYuOCIgZmlsbD0iIzU0NkU3QSIvPgogICAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLXN0b25lYykiPgogICAgICA8ZWxsaXBzZSBjeD0iMjciIGN5PSIyMS41IiByeD0iNS4xIiByeT0iNC4wOCIgZmlsbD0iI0IwQkVDNSIvPgogICAgPC9nPgogIDwvZz48L3N2Zz4=','Stone'), basePrice:5 },
  food: { name:'Food', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PGxpbmUgeDE9IjMyIiB5MT0iNDgiIHgyPSIzMiIgeTI9IjE3IiBzdHJva2U9IiNDNjg0MDAiIHN0cm9rZS13aWR0aD0iMi42Ii8+PGVsbGlwc2UgY3g9IjMyIiBjeT0iMTgiIHJ4PSIzLjMiIHJ5PSI1LjYiIGZpbGw9IiNGRkIzMDAiIHRyYW5zZm9ybT0icm90YXRlKDAgMzIgMTgpIi8+PGVsbGlwc2UgY3g9IjMxLjEiIGN5PSIxNi43IiByeD0iMS42IiByeT0iMi43IiBmaWxsPSIjRkZFMDgyIiB0cmFuc2Zvcm09InJvdGF0ZSgwIDMyIDE4KSIvPjxlbGxpcHNlIGN4PSIyNS41IiBjeT0iMjIiIHJ4PSIzLjMiIHJ5PSI1LjYiIGZpbGw9IiNGRkIzMDAiIHRyYW5zZm9ybT0icm90YXRlKC0zNSAyNS41IDIyKSIvPjxlbGxpcHNlIGN4PSIyNC42IiBjeT0iMjAuNyIgcng9IjEuNiIgcnk9IjIuNyIgZmlsbD0iI0ZGRTA4MiIgdHJhbnNmb3JtPSJyb3RhdGUoLTM1IDI1LjUgMjIpIi8+PGVsbGlwc2UgY3g9IjM4LjUiIGN5PSIyMiIgcng9IjMuMyIgcnk9IjUuNiIgZmlsbD0iI0ZGQjMwMCIgdHJhbnNmb3JtPSJyb3RhdGUoMzUgMzguNSAyMikiLz48ZWxsaXBzZSBjeD0iMzcuNiIgY3k9IjIwLjciIHJ4PSIxLjYiIHJ5PSIyLjciIGZpbGw9IiNGRkUwODIiIHRyYW5zZm9ybT0icm90YXRlKDM1IDM4LjUgMjIpIi8+PGVsbGlwc2UgY3g9IjIzLjUiIGN5PSIzMCIgcng9IjMuMyIgcnk9IjUuNiIgZmlsbD0iI0ZGQjMwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTM1IDIzLjUgMzApIi8+PGVsbGlwc2UgY3g9IjIyLjYiIGN5PSIyOC43IiByeD0iMS42IiByeT0iMi43IiBmaWxsPSIjRkZFMDgyIiB0cmFuc2Zvcm09InJvdGF0ZSgtMzUgMjMuNSAzMCkiLz48ZWxsaXBzZSBjeD0iNDAuNSIgY3k9IjMwIiByeD0iMy4zIiByeT0iNS42IiBmaWxsPSIjRkZCMzAwIiB0cmFuc2Zvcm09InJvdGF0ZSgzNSA0MC41IDMwKSIvPjxlbGxpcHNlIGN4PSIzOS42IiBjeT0iMjguNyIgcng9IjEuNiIgcnk9IjIuNyIgZmlsbD0iI0ZGRTA4MiIgdHJhbnNmb3JtPSJyb3RhdGUoMzUgNDAuNSAzMCkiLz48ZWxsaXBzZSBjeD0iMjIuNSIgY3k9IjM4IiByeD0iMy4zIiByeT0iNS42IiBmaWxsPSIjRkZCMzAwIiB0cmFuc2Zvcm09InJvdGF0ZSgtMzUgMjIuNSAzOCkiLz48ZWxsaXBzZSBjeD0iMjEuNiIgY3k9IjM2LjciIHJ4PSIxLjYiIHJ5PSIyLjciIGZpbGw9IiNGRkUwODIiIHRyYW5zZm9ybT0icm90YXRlKC0zNSAyMi41IDM4KSIvPjxlbGxpcHNlIGN4PSI0MS41IiBjeT0iMzgiIHJ4PSIzLjMiIHJ5PSI1LjYiIGZpbGw9IiNGRkIzMDAiIHRyYW5zZm9ybT0icm90YXRlKDM1IDQxLjUgMzgpIi8+PGVsbGlwc2UgY3g9IjQwLjYiIGN5PSIzNi43IiByeD0iMS42IiByeT0iMi43IiBmaWxsPSIjRkZFMDgyIiB0cmFuc2Zvcm09InJvdGF0ZSgzNSA0MS41IDM4KSIvPjwvc3ZnPg==','Food'), basePrice:3 },
  coal: { name:'Coal', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoLTEyIDIxIDM3KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLWNvYWxhIj48ZWxsaXBzZSBjeD0iMjEiIGN5PSIzNyIgcng9IjExIiByeT0iOSIvPjwvY2xpcFBhdGg+CiAgICA8ZWxsaXBzZSBjeD0iMjEiIGN5PSIzNyIgcng9IjExIiByeT0iOSIgZmlsbD0iIzIxMjEyMSIvPgogICAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLWNvYWxhKSI+CiAgICAgIDxlbGxpcHNlIGN4PSIxNyIgY3k9IjMzLjUiIHJ4PSI2LjgyIiByeT0iNS41OCIgZmlsbD0iIzYxNjE2MSIvPgogICAgPC9nPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InJvdGF0ZSg2IDQwIDM4KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLWNvYWxiIj48ZWxsaXBzZSBjeD0iNDAiIGN5PSIzOCIgcng9IjE0LjUiIHJ5PSIxMS41Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSI0MCIgY3k9IjM4IiByeD0iMTQuNSIgcnk9IjExLjUiIGZpbGw9IiMyMTIxMjEiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1jb2FsYikiPgogICAgICA8ZWxsaXBzZSBjeD0iMzUiIGN5PSIzNCIgcng9IjguNyIgcnk9IjYuODk5OTk5OTk5OTk5OTk5NSIgZmlsbD0iIzYxNjE2MSIvPgogICAgPC9nPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InJvdGF0ZSgtNiAzMCAyNCkiPgogICAgPGNsaXBQYXRoIGlkPSJjcC1jb2FsYyI+PGVsbGlwc2UgY3g9IjMwIiBjeT0iMjQiIHJ4PSI4LjUiIHJ5PSI2LjgiLz48L2NsaXBQYXRoPgogICAgPGVsbGlwc2UgY3g9IjMwIiBjeT0iMjQiIHJ4PSI4LjUiIHJ5PSI2LjgiIGZpbGw9IiMyMTIxMjEiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1jb2FsYykiPgogICAgICA8ZWxsaXBzZSBjeD0iMjciIGN5PSIyMS41IiByeD0iNS4xIiByeT0iNC4wOCIgZmlsbD0iIzYxNjE2MSIvPgogICAgPC9nPgogIDwvZz48L3N2Zz4=','Coal'), basePrice:6 },
  iron: { name:'Iron', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoLTEyIDIxIDM3KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLWlyb25hIj48ZWxsaXBzZSBjeD0iMjEiIGN5PSIzNyIgcng9IjExIiByeT0iOSIvPjwvY2xpcFBhdGg+CiAgICA8ZWxsaXBzZSBjeD0iMjEiIGN5PSIzNyIgcng9IjExIiByeT0iOSIgZmlsbD0iIzM3NDc0RiIvPgogICAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLWlyb25hKSI+CiAgICAgIDxlbGxpcHNlIGN4PSIxNyIgY3k9IjMzLjUiIHJ4PSI2LjgyIiByeT0iNS41OCIgZmlsbD0iIzc4OTA5QyIvPgogICAgPC9nPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InJvdGF0ZSg2IDQwIDM4KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLWlyb25iIj48ZWxsaXBzZSBjeD0iNDAiIGN5PSIzOCIgcng9IjE0LjUiIHJ5PSIxMS41Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSI0MCIgY3k9IjM4IiByeD0iMTQuNSIgcnk9IjExLjUiIGZpbGw9IiMzNzQ3NEYiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1pcm9uYikiPgogICAgICA8ZWxsaXBzZSBjeD0iMzUiIGN5PSIzNCIgcng9IjguNyIgcnk9IjYuODk5OTk5OTk5OTk5OTk5NSIgZmlsbD0iIzc4OTA5QyIvPgogICAgPC9nPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InJvdGF0ZSgtNiAzMCAyNCkiPgogICAgPGNsaXBQYXRoIGlkPSJjcC1pcm9uYyI+PGVsbGlwc2UgY3g9IjMwIiBjeT0iMjQiIHJ4PSI4LjUiIHJ5PSI2LjgiLz48L2NsaXBQYXRoPgogICAgPGVsbGlwc2UgY3g9IjMwIiBjeT0iMjQiIHJ4PSI4LjUiIHJ5PSI2LjgiIGZpbGw9IiMzNzQ3NEYiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1pcm9uYykiPgogICAgICA8ZWxsaXBzZSBjeD0iMjciIGN5PSIyMS41IiByeD0iNS4xIiByeT0iNC4wOCIgZmlsbD0iIzc4OTA5QyIvPgogICAgPC9nPgogIDwvZz48L3N2Zz4=','Iron'), basePrice:8 },
  gold: { name:'Gold', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoLTEyIDIxIDM3KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLWdvbGRhIj48ZWxsaXBzZSBjeD0iMjEiIGN5PSIzNyIgcng9IjExIiByeT0iOSIvPjwvY2xpcFBhdGg+CiAgICA8ZWxsaXBzZSBjeD0iMjEiIGN5PSIzNyIgcng9IjExIiByeT0iOSIgZmlsbD0iI0Y5QTgyNSIvPgogICAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLWdvbGRhKSI+CiAgICAgIDxlbGxpcHNlIGN4PSIxNyIgY3k9IjMzLjUiIHJ4PSI2LjgyIiByeT0iNS41OCIgZmlsbD0iI0ZGRTA4MiIvPgogICAgPC9nPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InJvdGF0ZSg2IDQwIDM4KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLWdvbGRiIj48ZWxsaXBzZSBjeD0iNDAiIGN5PSIzOCIgcng9IjE0LjUiIHJ5PSIxMS41Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSI0MCIgY3k9IjM4IiByeD0iMTQuNSIgcnk9IjExLjUiIGZpbGw9IiNGOUE4MjUiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1nb2xkYikiPgogICAgICA8ZWxsaXBzZSBjeD0iMzUiIGN5PSIzNCIgcng9IjguNyIgcnk9IjYuODk5OTk5OTk5OTk5OTk5NSIgZmlsbD0iI0ZGRTA4MiIvPgogICAgPC9nPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InJvdGF0ZSgtNiAzMCAyNCkiPgogICAgPGNsaXBQYXRoIGlkPSJjcC1nb2xkYyI+PGVsbGlwc2UgY3g9IjMwIiBjeT0iMjQiIHJ4PSI4LjUiIHJ5PSI2LjgiLz48L2NsaXBQYXRoPgogICAgPGVsbGlwc2UgY3g9IjMwIiBjeT0iMjQiIHJ4PSI4LjUiIHJ5PSI2LjgiIGZpbGw9IiNGOUE4MjUiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1nb2xkYykiPgogICAgICA8ZWxsaXBzZSBjeD0iMjciIGN5PSIyMS41IiByeD0iNS4xIiByeT0iNC4wOCIgZmlsbD0iI0ZGRTA4MiIvPgogICAgPC9nPgogIDwvZz48L3N2Zz4=','Gold'), basePrice:20 },
  cotton: { name:'Cotton', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGNsaXBQYXRoIGlkPSJjcC1jb3QwIj48Y2lyY2xlIGN4PSIyNCIgY3k9IjMxIiByPSIxMCIvPjwvY2xpcFBhdGg+CiAgPGNpcmNsZSBjeD0iMjQiIGN5PSIzMSIgcj0iMTAiIGZpbGw9IiNFMEUwRTAiLz4KICA8ZyBjbGlwLXBhdGg9InVybCgjY3AtY290MCkiPjxjaXJjbGUgY3g9IjIxLjAiIGN5PSIyOC4wIiByPSI3LjUiIGZpbGw9IiNGQUZBRkEiLz48L2c+CiAgPGNsaXBQYXRoIGlkPSJjcC1jb3QxIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjMxIiByPSIxMCIvPjwvY2xpcFBhdGg+CiAgPGNpcmNsZSBjeD0iNDAiIGN5PSIzMSIgcj0iMTAiIGZpbGw9IiNFMEUwRTAiLz4KICA8ZyBjbGlwLXBhdGg9InVybCgjY3AtY290MSkiPjxjaXJjbGUgY3g9IjM3LjAiIGN5PSIyOC4wIiByPSI3LjUiIGZpbGw9IiNGQUZBRkEiLz48L2c+CiAgPGNsaXBQYXRoIGlkPSJjcC1jb3QyIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjI0IiByPSIxMSIvPjwvY2xpcFBhdGg+CiAgPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTEiIGZpbGw9IiNFMEUwRTAiLz4KICA8ZyBjbGlwLXBhdGg9InVybCgjY3AtY290MikiPjxjaXJjbGUgY3g9IjI4LjciIGN5PSIyMC43IiByPSI4LjI1IiBmaWxsPSIjRkFGQUZBIi8+PC9nPgogIDxjbGlwUGF0aCBpZD0iY3AtY290MyI+PGNpcmNsZSBjeD0iMzIiIGN5PSIzNyIgcj0iMTEiLz48L2NsaXBQYXRoPgogIDxjaXJjbGUgY3g9IjMyIiBjeT0iMzciIHI9IjExIiBmaWxsPSIjRTBFMEUwIi8+CiAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLWNvdDMpIj48Y2lyY2xlIGN4PSIyOC43IiBjeT0iMzMuNyIgcj0iOC4yNSIgZmlsbD0iI0ZBRkFGQSIvPjwvZz48bGluZSB4MT0iMzIiIHkxPSI0NiIgeDI9IjMyIiB5Mj0iNTEiIHN0cm9rZT0iIzY4OUYzOCIgc3Ryb2tlLXdpZHRoPSIyLjIiLz48L3N2Zz4=','Cotton'), basePrice:3 },
  leather: { name:'Leather', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGNsaXBQYXRoIGlkPSJjcC1sZWEiPjxwYXRoIGQ9Ik0yMCAyNCBRMTcgMzIgMjIgNDEgUTI5IDQ3IDM1IDQ1IFE0MyA0MiA0NSAzNCBRNDcgMjMgNDAgMTkgUTM0IDE1IDI3IDE4IFEyMSAyMCAyMCAyNCBaIi8+PC9jbGlwUGF0aD4KICA8cGF0aCBkPSJNMjAgMjQgUTE3IDMyIDIyIDQxIFEyOSA0NyAzNSA0NSBRNDMgNDIgNDUgMzQgUTQ3IDIzIDQwIDE5IFEzNCAxNSAyNyAxOCBRMjEgMjAgMjAgMjQgWiIgZmlsbD0iIzZENEM0MSIvPgogIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1sZWEpIj48ZWxsaXBzZSBjeD0iMjYiIGN5PSIyNiIgcng9IjEyIiByeT0iMTAiIGZpbGw9IiM4RDZFNjMiLz48L2c+CiAgPHBhdGggZD0iTTI0IDI0IEw0MCAzOSBNMjQgMzUgTDM1IDIyIiBzdHJva2U9IiM0RTM0MkUiIHN0cm9rZS13aWR0aD0iMS4zIiBzdHJva2UtZGFzaGFycmF5PSIyLDIiIG9wYWNpdHk9IjAuNyIvPgo8L3N2Zz4=','Leather'), basePrice:6 },
  sand: { name:'Sand', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGNsaXBQYXRoIGlkPSJjcC1zYW5kIj48cGF0aCBkPSJNMTIgNDIgUTIyIDI3IDMyIDM5IFE0MiAyNyA1MiA0MiBMNTIgNTAgTDEyIDUwIFoiLz48L2NsaXBQYXRoPgogIDxwYXRoIGQ9Ik0xMiA0MiBRMjIgMjcgMzIgMzkgUTQyIDI3IDUyIDQyIEw1MiA1MCBMMTIgNTAgWiIgZmlsbD0iI0ZGQ0EyOCIvPgogIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1zYW5kKSI+PGVsbGlwc2UgY3g9IjI2IiBjeT0iMzYiIHJ4PSIxOCIgcnk9IjEwIiBmaWxsPSIjRkZFMDgyIi8+PC9nPgogIDxjaXJjbGUgY3g9IjIwIiBjeT0iNDQiIHI9IjEuMiIgZmlsbD0iI0ZGQjMwMCIgb3BhY2l0eT0iMC42Ii8+PGNpcmNsZSBjeD0iMjgiIGN5PSI0Ni41IiByPSIxLjIiIGZpbGw9IiNGRkIzMDAiIG9wYWNpdHk9IjAuNiIvPjxjaXJjbGUgY3g9IjM2IiBjeT0iNDQiIHI9IjEuMiIgZmlsbD0iI0ZGQjMwMCIgb3BhY2l0eT0iMC42Ii8+PGNpcmNsZSBjeD0iNDQiIGN5PSI0Ni41IiByPSIxLjIiIGZpbGw9IiNGRkIzMDAiIG9wYWNpdHk9IjAuNiIvPjxjaXJjbGUgY3g9IjI0IiBjeT0iNDEiIHI9IjEuMiIgZmlsbD0iI0ZGQjMwMCIgb3BhY2l0eT0iMC42Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MSIgcj0iMS4yIiBmaWxsPSIjRkZCMzAwIiBvcGFjaXR5PSIwLjYiLz4KPC9zdmc+','Sand'), basePrice:2 },
  gemstones: { name:'Gemstones', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPHBvbHlnb24gcG9pbnRzPSIzMiwxMiA0MSwyMiA0OCwyOSAzMiw0OSAxNiwyOSAyMywyMiIgZmlsbD0iI0FCNDdCQyIvPgogIDxwb2x5Z29uIHBvaW50cz0iMzIsMTIgNDEsMjIgMjMsMjIiIGZpbGw9IiNFMUJFRTciLz4KICA8cG9seWdvbiBwb2ludHM9IjQxLDIyIDQ4LDI5IDMyLDI5IiBmaWxsPSIjQUI0N0JDIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIxNiwyOSAyMywyMiAzMiwyOSIgZmlsbD0iI0NFOTNEOCIvPgogIDxwb2x5Z29uIHBvaW50cz0iMzIsMjkgNDgsMjkgMzIsNDkiIGZpbGw9IiM3QjFGQTIiLz4KICA8cG9seWdvbiBwb2ludHM9IjE2LDI5IDMyLDI5IDMyLDQ5IiBmaWxsPSIjOEUyNEFBIi8+Cjwvc3ZnPg==','Gemstones'), basePrice:30 },
  water: { name:'Water', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGNsaXBQYXRoIGlkPSJjcC13YXRlciI+PHBhdGggZD0iTTMyIDEzIEM0MSAyNiA0NyAzNCA0NyA0MiBDNDcgNTEgNDAgNTYgMzIgNTYgQzI0IDU2IDE3IDUxIDE3IDQyIEMxNyAzNCAyMyAyNiAzMiAxMyBaIi8+PC9jbGlwUGF0aD4KICA8cGF0aCBkPSJNMzIgMTMgQzQxIDI2IDQ3IDM0IDQ3IDQyIEM0NyA1MSA0MCA1NiAzMiA1NiBDMjQgNTYgMTcgNTEgMTcgNDIgQzE3IDM0IDIzIDI2IDMyIDEzIFoiIGZpbGw9IiMwMjg4RDEiLz4KICA8ZyBjbGlwLXBhdGg9InVybCgjY3Atd2F0ZXIpIj48ZWxsaXBzZSBjeD0iMjYiIGN5PSIzOCIgcng9IjgiIHJ5PSIxNCIgZmlsbD0iIzRGQzNGNyIvPjwvZz4KPC9zdmc+','Water'), basePrice:1 },
  salt: { name:'Salt', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGNsaXBQYXRoIGlkPSJjcC1zMSI+PHBvbHlnb24gcG9pbnRzPSIyMywyMCAzMiwyOSAyMywzOCAxNCwyOSIvPjwvY2xpcFBhdGg+CiAgPHBvbHlnb24gcG9pbnRzPSIyMywyMCAzMiwyOSAyMywzOCAxNCwyOSIgZmlsbD0iI0NGRDhEQyIvPgogIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1zMSkiPjxwb2x5Z29uIHBvaW50cz0iMTQuOSwyNy4yIDIzLDIwIDI0LjM1LDI3LjY1IiBmaWxsPSIjRkZGRkZGIi8+PC9nPgogIDxjbGlwUGF0aCBpZD0iY3AtczIiPjxwb2x5Z29uIHBvaW50cz0iNDEsMTYuNSA1MS41LDI3IDQxLDM3LjUgMzAuNSwyNyIvPjwvY2xpcFBhdGg+CiAgPHBvbHlnb24gcG9pbnRzPSI0MSwxNi41IDUxLjUsMjcgNDEsMzcuNSAzMC41LDI3IiBmaWxsPSIjQjBCRUM1Ii8+CiAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLXMyKSI+PHBvbHlnb24gcG9pbnRzPSIzMS41NDk5OTk5OTk5OTk5OTcsMjQuOSA0MSwxNi41IDQyLjU3NSwyNS40MjUiIGZpbGw9IiNGQUZBRkEiLz48L2c+CiAgPGNsaXBQYXRoIGlkPSJjcC1zMyI+PHBvbHlnb24gcG9pbnRzPSIzMywzMy41IDQxLjUsNDIgMzMsNTAuNSAyNC41LDQyIi8+PC9jbGlwUGF0aD4KICA8cG9seWdvbiBwb2ludHM9IjMzLDMzLjUgNDEuNSw0MiAzMyw1MC41IDI0LjUsNDIiIGZpbGw9IiNFQ0VGRjEiLz4KICA8ZyBjbGlwLXBhdGg9InVybCgjY3AtczMpIj48cG9seWdvbiBwb2ludHM9IjI1LjM1LDQwLjMgMzMsMzMuNSAzNC4yNzUsNDAuNzI1IiBmaWxsPSIjRkZGRkZGIi8+PC9nPjwvc3ZnPg==','Salt'), basePrice:4 },
  copper: { name:'Copper', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoLTEyIDIxIDM3KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLWNvcHBlcmEiPjxlbGxpcHNlIGN4PSIyMSIgY3k9IjM3IiByeD0iMTEiIHJ5PSI5Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSIyMSIgY3k9IjM3IiByeD0iMTEiIHJ5PSI5IiBmaWxsPSIjQkYzNjBDIi8+CiAgICA8ZyBjbGlwLXBhdGg9InVybCgjY3AtY29wcGVyYSkiPgogICAgICA8ZWxsaXBzZSBjeD0iMTciIGN5PSIzMy41IiByeD0iNi44MiIgcnk9IjUuNTgiIGZpbGw9IiNGRjhBNjUiLz4KICAgIDwvZz4KICA8L2c+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoNiA0MCAzOCkiPgogICAgPGNsaXBQYXRoIGlkPSJjcC1jb3BwZXJiIj48ZWxsaXBzZSBjeD0iNDAiIGN5PSIzOCIgcng9IjE0LjUiIHJ5PSIxMS41Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSI0MCIgY3k9IjM4IiByeD0iMTQuNSIgcnk9IjExLjUiIGZpbGw9IiNCRjM2MEMiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1jb3BwZXJiKSI+CiAgICAgIDxlbGxpcHNlIGN4PSIzNSIgY3k9IjM0IiByeD0iOC43IiByeT0iNi44OTk5OTk5OTk5OTk5OTk1IiBmaWxsPSIjRkY4QTY1Ii8+CiAgICA8L2c+CiAgPC9nPgogIDxnIHRyYW5zZm9ybT0icm90YXRlKC02IDMwIDI0KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLWNvcHBlcmMiPjxlbGxpcHNlIGN4PSIzMCIgY3k9IjI0IiByeD0iOC41IiByeT0iNi44Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSIzMCIgY3k9IjI0IiByeD0iOC41IiByeT0iNi44IiBmaWxsPSIjQkYzNjBDIi8+CiAgICA8ZyBjbGlwLXBhdGg9InVybCgjY3AtY29wcGVyYykiPgogICAgICA8ZWxsaXBzZSBjeD0iMjciIGN5PSIyMS41IiByeD0iNS4xIiByeT0iNC4wOCIgZmlsbD0iI0ZGOEE2NSIvPgogICAgPC9nPgogIDwvZz48L3N2Zz4=','Copper'), basePrice:7 },
  silver: { name:'Silver', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoLTEyIDIxIDM3KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLXNpbHZlcmEiPjxlbGxpcHNlIGN4PSIyMSIgY3k9IjM3IiByeD0iMTEiIHJ5PSI5Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSIyMSIgY3k9IjM3IiByeD0iMTEiIHJ5PSI5IiBmaWxsPSIjNzg5MDlDIi8+CiAgICA8ZyBjbGlwLXBhdGg9InVybCgjY3Atc2lsdmVyYSkiPgogICAgICA8ZWxsaXBzZSBjeD0iMTciIGN5PSIzMy41IiByeD0iNi44MiIgcnk9IjUuNTgiIGZpbGw9IiNFQ0VGRjEiLz4KICAgIDwvZz4KICA8L2c+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoNiA0MCAzOCkiPgogICAgPGNsaXBQYXRoIGlkPSJjcC1zaWx2ZXJiIj48ZWxsaXBzZSBjeD0iNDAiIGN5PSIzOCIgcng9IjE0LjUiIHJ5PSIxMS41Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSI0MCIgY3k9IjM4IiByeD0iMTQuNSIgcnk9IjExLjUiIGZpbGw9IiM3ODkwOUMiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1zaWx2ZXJiKSI+CiAgICAgIDxlbGxpcHNlIGN4PSIzNSIgY3k9IjM0IiByeD0iOC43IiByeT0iNi44OTk5OTk5OTk5OTk5OTk1IiBmaWxsPSIjRUNFRkYxIi8+CiAgICA8L2c+CiAgPC9nPgogIDxnIHRyYW5zZm9ybT0icm90YXRlKC02IDMwIDI0KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLXNpbHZlcmMiPjxlbGxpcHNlIGN4PSIzMCIgY3k9IjI0IiByeD0iOC41IiByeT0iNi44Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSIzMCIgY3k9IjI0IiByeD0iOC41IiByeT0iNi44IiBmaWxsPSIjNzg5MDlDIi8+CiAgICA8ZyBjbGlwLXBhdGg9InVybCgjY3Atc2lsdmVyYykiPgogICAgICA8ZWxsaXBzZSBjeD0iMjciIGN5PSIyMS41IiByeD0iNS4xIiByeT0iNC4wOCIgZmlsbD0iI0VDRUZGMSIvPgogICAgPC9nPgogIDwvZz48L3N2Zz4=','Silver'), basePrice:15 },
  zinc: { name:'Zinc', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGNsaXBQYXRoIGlkPSJjcC16aW5jIj48cG9seWdvbiBwb2ludHM9IjMyLDE1IDQ0LDIyIDQ0LDM2IDMyLDQzIDIwLDM2IDIwLDIyIi8+PC9jbGlwUGF0aD4KICA8cG9seWdvbiBwb2ludHM9IjMyLDE1IDQ0LDIyIDQ0LDM2IDMyLDQzIDIwLDM2IDIwLDIyIiBmaWxsPSIjNjA3RDhCIi8+CiAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLXppbmMpIj48ZWxsaXBzZSBjeD0iMjYiIGN5PSIyMiIgcng9IjE0IiByeT0iMTAiIGZpbGw9IiNCMEJFQzUiLz48L2c+CiAgPGNpcmNsZSBjeD0iMzIiIGN5PSIyOSIgcj0iNy41IiBmaWxsPSIjMzc0NzRGIi8+Cjwvc3ZnPg==','Zinc'), basePrice:9 },
  lead: { name:'Lead', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGcgdHJhbnNmb3JtPSJyb3RhdGUoLTEyIDIxIDM3KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLWxlYWRhIj48ZWxsaXBzZSBjeD0iMjEiIGN5PSIzNyIgcng9IjExIiByeT0iOSIvPjwvY2xpcFBhdGg+CiAgICA8ZWxsaXBzZSBjeD0iMjEiIGN5PSIzNyIgcng9IjExIiByeT0iOSIgZmlsbD0iIzI2MzIzOCIvPgogICAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLWxlYWRhKSI+CiAgICAgIDxlbGxpcHNlIGN4PSIxNyIgY3k9IjMzLjUiIHJ4PSI2LjgyIiByeT0iNS41OCIgZmlsbD0iIzYwN0Q4QiIvPgogICAgPC9nPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InJvdGF0ZSg2IDQwIDM4KSI+CiAgICA8Y2xpcFBhdGggaWQ9ImNwLWxlYWRiIj48ZWxsaXBzZSBjeD0iNDAiIGN5PSIzOCIgcng9IjE0LjUiIHJ5PSIxMS41Ii8+PC9jbGlwUGF0aD4KICAgIDxlbGxpcHNlIGN4PSI0MCIgY3k9IjM4IiByeD0iMTQuNSIgcnk9IjExLjUiIGZpbGw9IiMyNjMyMzgiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1sZWFkYikiPgogICAgICA8ZWxsaXBzZSBjeD0iMzUiIGN5PSIzNCIgcng9IjguNyIgcnk9IjYuODk5OTk5OTk5OTk5OTk5NSIgZmlsbD0iIzYwN0Q4QiIvPgogICAgPC9nPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InJvdGF0ZSgtNiAzMCAyNCkiPgogICAgPGNsaXBQYXRoIGlkPSJjcC1sZWFkYyI+PGVsbGlwc2UgY3g9IjMwIiBjeT0iMjQiIHJ4PSI4LjUiIHJ5PSI2LjgiLz48L2NsaXBQYXRoPgogICAgPGVsbGlwc2UgY3g9IjMwIiBjeT0iMjQiIHJ4PSI4LjUiIHJ5PSI2LjgiIGZpbGw9IiMyNjMyMzgiLz4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjcC1sZWFkYykiPgogICAgICA8ZWxsaXBzZSBjeD0iMjciIGN5PSIyMS41IiByeD0iNS4xIiByeT0iNC4wOCIgZmlsbD0iIzYwN0Q4QiIvPgogICAgPC9nPgogIDwvZz48L3N2Zz4=','Lead'), basePrice:5 },
  magic_stones: { name:'Magic Stones', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPHBvbHlnb24gcG9pbnRzPSIzMiwxMSA0MCwyNyAzMiw1MiAyNCwyNyIgZmlsbD0iIzdCMUZBMiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMzIsMTEgNDAsMjcgMzIsMzIgMjQsMjciIGZpbGw9IiNDRTkzRDgiLz4KICA8cG9seWdvbiBwb2ludHM9IjI0LDI3IDMyLDMyIDMyLDUyIiBmaWxsPSIjOEUyNEFBIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI0NywxNSA0OC42LDE5LjQgNTMsMjEgNDguNiwyMi42IDQ3LDI3IDQ1LjQsMjIuNiA0MSwyMSA0NS40LDE5LjQiIGZpbGw9IiNGRkQ1NEYiLz4KICA8cG9seWdvbiBwb2ludHM9IjE2LDMzIDE3LjIsMzYgMjAsMzcgMTcuMiwzOCAxNiw0MSAxNC44LDM4IDEyLDM3IDE0LjgsMzYiIGZpbGw9IiNGRkQ1NEYiLz4KPC9zdmc+','Magic Stones'), basePrice:25 },
  herbs: { name:'Herbs', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPHBhdGggZD0iTTMyIDUwIEMzMiAzNiAzMiAyNCAzMiAxNSIgc3Ryb2tlPSIjMzM2OTFFIiBzdHJva2Utd2lkdGg9IjIuMiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMiAyMSBDMjMgMTkgMTkgMjYgMTkgMzAgQzI3IDMwIDMxIDI3IDMyIDIxIFoiIGZpbGw9IiM0M0EwNDciLz4KICA8cGF0aCBkPSJNMjUgMjMgQzIzIDI1IDIyIDI3LjUgMjIgMjkuNSBDMjUgMjkgMjcuNSAyNyAyOSAyNCBaIiBmaWxsPSIjODFDNzg0Ii8+CiAgPHBhdGggZD0iTTMyIDMwIEM0MSAyOCA0NSAzNCA0NSAzOCBDMzcgMzggMzMgMzUgMzIgMzAgWiIgZmlsbD0iIzQzQTA0NyIvPgogIDxwYXRoIGQ9Ik0zNSAzMiBDMzkgMzEuNSA0MS41IDMzLjUgNDIuNSAzNiBDMzkgMzYgMzYgMzQuNSAzNSAzMiBaIiBmaWxsPSIjODFDNzg0Ii8+CiAgPHBhdGggZD0iTTMyIDM5IEMyNCAzOCAyMCA0NCAyMCA0OCBDMjggNDggMzEgNDQgMzIgMzkgWiIgZmlsbD0iIzQzQTA0NyIvPgogIDxwYXRoIGQ9Ik0yNSA0MSBDMjIuNSA0MyAyMSA0NSAyMC41IDQ3IEMyNCA0Ni41IDI2LjUgNDQuNSAyNy41IDQxLjUgWiIgZmlsbD0iIzgxQzc4NCIvPgo8L3N2Zz4=','Herbs'), basePrice:4 },
  honey: { name:'Honey', icon:resIcon('PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGNsaXBQYXRoIGlkPSJjcC1ob25leSI+PHBhdGggZD0iTTIzIDIyIGgxOCB2NiBjNS41IDMuMyA1LjUgOS41IDUuNSAxMi41IGMwIDguNSAtNi41IDEzIC0xNC4yNSAxMyBzLTE0LjI1IC00LjUgLTE0LjI1IC0xMyBjMCAtMyAwIC05LjIgNS41IC0xMi41IFoiLz48L2NsaXBQYXRoPgogIDxwYXRoIGQ9Ik0yMyAyMiBoMTggdjYgYzUuNSAzLjMgNS41IDkuNSA1LjUgMTIuNSBjMCA4LjUgLTYuNSAxMyAtMTQuMjUgMTMgcy0xNC4yNSAtNC41IC0xNC4yNSAtMTMgYzAgLTMgMCAtOS4yIDUuNSAtMTIuNSBaIiBmaWxsPSIjRTY1MTAwIi8+CiAgPGcgY2xpcC1wYXRoPSJ1cmwoI2NwLWhvbmV5KSI+PGVsbGlwc2UgY3g9IjI3IiBjeT0iMzAiIHJ4PSIxMCIgcnk9IjEyIiBmaWxsPSIjRkZCMzAwIi8+PC9nPgogIDxyZWN0IHg9IjIzIiB5PSIxOCIgd2lkdGg9IjE4IiBoZWlnaHQ9IjUuNSIgcng9IjEuOCIgZmlsbD0iIzVENDAzNyIvPgogIDxwb2x5Z29uIHBvaW50cz0iMzIsMzEgMzUuNSwzMyAzNS41LDM3LjUgMzIsMzkuNSAyOC41LDM3LjUgMjguNSwzMyIgZmlsbD0iI0ZGRTA4MiIvPgo8L3N2Zz4=','Honey'), basePrice:8 },
};
const GOODS = {
  plank:     { name:'Wood Planks', icon:'🪚', basePrice:14 },
  brick:     { name:'Bricks',      icon:'🧱', basePrice:22 },
  bread:     { name:'Bread',       icon:'🍞', basePrice:10 },
  furniture: { name:'Furniture',   icon:'🪑', basePrice:60 },
  steel:     { name:'Steel',       icon:'🔧', basePrice:25 },
  paper:     { name:'Paper',       icon:'📄', basePrice:8 },
  cloth:     { name:'Cloth',       icon:'🧵', basePrice:12 },
  jewelry:   { name:'Jewelry',     icon:'💍', basePrice:120 },
  glass:     { name:'Glass',       icon:'🪟', basePrice:35 },
  bronze:    { name:'Bronze',      icon:'🟤', basePrice:28 },
  concrete:  { name:'Concrete',    icon:'🧱', basePrice:15 },
  health_potion: { name:'Health Potion', icon:'💚', basePrice:50 },
  energy_potion: { name:'Energy Potion', icon:'⚡', basePrice:40 },
  toasted_bread:     { name:'Toasted Bread',      icon:'🥖', basePrice:18 },
  honey_bread:       { name:'Honey Bread',        icon:'🍯', basePrice:30 },
  legendary_bread:   { name:'Legendary Bread',    icon:'👑', basePrice:80 },
  small_energy_potion:    { name:'Small Energy Potion',    icon:'🧪', basePrice:25 },
  medium_energy_potion:   { name:'Medium Energy Potion',   icon:'⚗️', basePrice:50 },
  large_energy_potion:    { name:'Large Energy Potion',    icon:'🔮', basePrice:120 },
  legendary_energy_potion:{ name:'Legendary Energy Potion',icon:'✨', basePrice:300 },
};
const ITEMS = { ...RESOURCES, ...GOODS };

const RECIPES = {
  plank:     { inputs:{wood:20},                        output:5, energyCost:2, xp:5,  minLevel:1 },
  brick:     { inputs:{stone:15, coal:5},               output:5, energyCost:3, xp:8,  minLevel:1 },
  bread:     { inputs:{food:15},                        output:5, energyCost:2, xp:5,  minLevel:1 },
  furniture: { inputs:{plank:5, brick:5},               output:2, energyCost:5, xp:15, minLevel:5 },
  steel:     { inputs:{iron:15, coal:10},               output:3, energyCost:4, xp:10, minLevel:3 },
  paper:     { inputs:{wood:10, water:10},              output:5, energyCost:2, xp:6,  minLevel:2 },
  cloth:     { inputs:{cotton:20},                      output:5, energyCost:2, xp:6,  minLevel:1 },
  jewelry:   { inputs:{gold:10, gemstones:5},           output:2, energyCost:6, xp:25, minLevel:10 },
  glass:     { inputs:{sand:20, coal:8},                output:4, energyCost:3, xp:12, minLevel:4 },
  bronze:    { inputs:{copper:15, zinc:10},             output:4, energyCost:3, xp:10, minLevel:3 },
  concrete:  { inputs:{stone:10, sand:5, water:5},        output:3, energyCost:4, xp:12, minLevel:5 },
  health_potion: { inputs:{food:10, water:5}, output:2, energyCost:3, xp:8, minLevel:8 },
  energy_potion: { inputs:{food:5, water:10, coal:2}, output:2, energyCost:3, xp:8, minLevel:8 },
  toasted_bread:     { inputs:{food:8, water:3, coal:1}, output:2, energyCost:2, xp:6, minLevel:5 },
  honey_bread:       { inputs:{food:10, water:3, honey:2}, output:2, energyCost:3, xp:10, minLevel:15 },
  legendary_bread:   { inputs:{food:15, water:5, herbs:5, honey:3}, output:1, energyCost:5, xp:20, minLevel:30 },
  small_energy_potion:    { inputs:{herbs:5, water:3}, output:2, energyCost:2, xp:5, minLevel:3 },
  medium_energy_potion:   { inputs:{herbs:10, water:5, glass:1}, output:2, energyCost:3, xp:8, minLevel:12 },
  large_energy_potion:    { inputs:{herbs:15, water:8, glass:3, gold:1}, output:2, energyCost:4, xp:15, minLevel:25 },
  legendary_energy_potion:{ inputs:{herbs:20, water:10, glass:5, gold:3, gemstones:2}, output:1, energyCost:6, xp:30, minLevel:40 },
};

const MISSION_POOL = [
  { id:'collect', track:'collected', label:(t)=>`Collect ${t} units of any resource`, gen:()=>80+Math.floor(Math.random()*120), reward:(t)=>Math.round(t*0.8) },
  { id:'craft',   track:'crafted',   label:(t)=>`Craft ${t} products`,              gen:()=>5+Math.floor(Math.random()*8),   reward:(t)=>t*15 },
  { id:'sell',    track:'sold',      label:(t)=>`Sell ${t} units on the market`,     gen:()=>10+Math.floor(Math.random()*20), reward:(t)=>t*6 },
  { id:'win',     track:'wins',      label:(t)=>`Win ${t} battles`,                  gen:()=>2+Math.floor(Math.random()*3),   reward:(t)=>t*40 },
];

const LB_NAMES = ['Trader_Sami','Night_Rider','Mother_Gold','Hunter_Yasin','Valley_Treasure'];

const SKILLS = {
  health:  { name:'Health',  icon:'❤️', perLevel:20,  max:20, desc:'Increases max health points' },
  damage:  { name:'Damage',  icon:'⚔️', perLevel:2,   max:20, desc:'Increases combat power' },
  defense: { name:'Defense', icon:'🛡️', perLevel:0.05,max:15, desc:'Reduces damage taken on defeat' },
  stamina: { name:'Stamina', icon:'🔋', perLevel:5,   max:20, desc:'Increases max energy and reduces costs' },
  storage: { name:'Storage', icon:'📦', perLevel:50,  max:20, desc:'Increases storage capacity' },
  profit:  { name:'Profit',  icon:'💰', perLevel:0.02,max:20, desc:'Increases sell price multiplier' },
};

/* ===== GEAR TIER SYSTEM ===== */
const GEAR_TIERS = [
  { name:'Common',    color:'#c0b8a8', symbol:'●',    power:1.00, minLevel:1,  maxUpgrade:0, numStats:1, sellMin:30,  sellMax:100  },
  { name:'Uncommon',  color:'#6fa285', symbol:'◆',    power:1.25, minLevel:10, maxUpgrade:1, numStats:2, sellMin:150, sellMax:400  },
  { name:'Rare',      color:'#7ab8d4', symbol:'★',    power:1.50, minLevel:25, maxUpgrade:2, numStats:3, sellMin:500, sellMax:1500 },
  { name:'Epic',      color:'#b8a0d4', symbol:'◆★',   power:2.00, minLevel:40, maxUpgrade:3, numStats:4, sellMin:2000,sellMax:5000 },
  { name:'Legendary', color:'#e8bd6e', symbol:'★★★',  power:3.00, minLevel:55, maxUpgrade:5, numStats:5, sellMin:8000,sellMax:20000},
  { name:'Mythic',    color:'#d44c4c', symbol:'✦',    power:4.00, minLevel:70, maxUpgrade:7, numStats:6, sellMin:25000,sellMax:50000},
];

const GEAR_SLOTS = {
  weapon:    { name:'Weapon',    icon:'⚔️' },
  armor:     { name:'Armor',     icon:'🛡️' },
  helmet:    { name:'Helmet',    icon:'⛑️' },
  boots:     { name:'Boots',     icon:'👢' },
  accessory: { name:'Accessory', icon:'💍' },
  gloves:    { name:'Gloves',    icon:'🧤' },
};

const GEAR_NAMES = {
  weapon:    ['Stone Knife','Iron Sword','Steel Blade','Magic Sword','Shadow Sword','Fire Sword'],
  armor:     ['Wooden Armor','Iron Armor','Steel Armor','Magic Armor','Dark Armor','Fire Armor'],
  helmet:    ['Leather Helmet','Iron Helmet','Steel Helmet','Golden Crown','Magic Helmet','Crown of Legends'],
  boots:     ['Leather Boots','Iron Boots','Steel Boots','Swift Boots','Magic Boots','Wind Boots'],
  accessory: ['Health Ring','Power Ring','Defense Necklace','Thief Ring','Life Necklace','Ring of Legends'],
  gloves:    ['Leather Gloves','Iron Gloves','Steel Gloves','Magic Gloves','Dark Gloves','Gloves of Legends'],
};
const CRAFTABLE_GEAR = {
  weapon: [
    { tier:0, name:'Stone Knife',      icon:'🗡️',  levelReq:1,  energyCost:3,  xp:8,  inputs:{stone:5, wood:2} },
    { tier:1, name:'Iron Sword',       icon:'⚔️',  levelReq:12, energyCost:5,  xp:15, inputs:{iron:10, coal:5} },
    { tier:2, name:'Steel Blade',      icon:'⚔️',  levelReq:32, energyCost:8,  xp:25, inputs:{steel:8, gold:3} },
    { tier:3, name:'Magic Sword',      icon:'⚔️✨',levelReq:55, energyCost:12, xp:45, inputs:{steel:5, magic_stones:3, gold:10} },
    { tier:4, name:'Shadow Sword',     icon:'⚔️🌑',levelReq:70, energyCost:15, xp:65, inputs:{steel:10, magic_stones:5, gold:20} },
    { tier:5, name:'Fire Sword',       icon:'⚔️🔥',levelReq:85, energyCost:20, xp:90, inputs:{steel:15, magic_stones:10, gemstones:5, gold:30} },
  ],
  armor: [
    { tier:0, name:'Wooden Armor',     icon:'🛡️',  levelReq:2,  energyCost:3,  xp:8,  inputs:{wood:10, stone:5} },
    { tier:1, name:'Iron Armor',       icon:'🛡️',  levelReq:14, energyCost:5,  xp:15, inputs:{iron:12, coal:5, wood:5} },
    { tier:2, name:'Steel Armor',      icon:'🛡️',  levelReq:34, energyCost:8,  xp:25, inputs:{steel:10, iron:6, gold:8} },
    { tier:3, name:'Magic Armor',      icon:'🛡️✨',levelReq:55, energyCost:12, xp:45, inputs:{steel:10, magic_stones:5, gold:15} },
    { tier:4, name:'Dark Armor',       icon:'🛡️🌑',levelReq:70, energyCost:15, xp:65, inputs:{steel:15, magic_stones:10, gold:25} },
    { tier:5, name:'Fire Armor',       icon:'🛡️🔥',levelReq:85, energyCost:20, xp:90, inputs:{steel:12, magic_stones:8, gemstones:5, gold:20} },
  ],
  helmet: [
    { tier:0, name:'Leather Helmet',   icon:'🪖',  levelReq:3,  energyCost:3,  xp:8,  inputs:{leather:5, cloth:3} },
    { tier:1, name:'Iron Helmet',      icon:'🪖',  levelReq:15, energyCost:5,  xp:15, inputs:{iron:8, coal:5} },
    { tier:2, name:'Steel Helmet',     icon:'🪖',  levelReq:35, energyCost:8,  xp:25, inputs:{steel:8, gold:5} },
    { tier:3, name:'Golden Crown',     icon:'👑',  levelReq:40, energyCost:10, xp:35, inputs:{gold:10, iron:5, steel:3} },
    { tier:4, name:'Magic Helmet',     icon:'🪖✨',levelReq:55, energyCost:12, xp:45, inputs:{steel:8, magic_stones:5, gold:10} },
    { tier:5, name:'Crown of Legends', icon:'👑🌟',levelReq:65, energyCost:15, xp:60, inputs:{steel:10, gemstones:8, gold:20} },
  ],
  boots: [
    { tier:0, name:'Leather Boots',    icon:'👢',  levelReq:2,  energyCost:3,  xp:8,  inputs:{leather:5, cloth:3} },
    { tier:1, name:'Iron Boots',       icon:'👢',  levelReq:14, energyCost:5,  xp:15, inputs:{iron:6, leather:4} },
    { tier:2, name:'Steel Boots',      icon:'👢',  levelReq:34, energyCost:8,  xp:25, inputs:{steel:8, leather:5, gold:5} },
    { tier:3, name:'Swift Boots',      icon:'👢⚡',levelReq:40, energyCost:10, xp:35, inputs:{steel:10, magic_stones:5, gold:8} },
    { tier:4, name:'Magic Boots',      icon:'👢✨',levelReq:55, energyCost:12, xp:45, inputs:{steel:8, gemstones:5, gold:10} },
    { tier:5, name:'Wind Boots',       icon:'👢🌪️',levelReq:65, energyCost:15, xp:60, inputs:{steel:10, magic_stones:8, gold:15} },
  ],
  accessory: [
    { tier:0, name:'Health Ring',      icon:'💍❤️',levelReq:20, energyCost:8,  xp:20, inputs:{gold:10, gemstones:5} },
    { tier:1, name:'Power Ring',       icon:'💍⚔️',levelReq:25, energyCost:8,  xp:22, inputs:{gold:10, magic_stones:5} },
    { tier:2, name:'Defense Necklace', icon:'📿🛡️',levelReq:30, energyCost:10, xp:28, inputs:{gold:15, gemstones:8} },
    { tier:3, name:'Thief Ring',       icon:'💍💰',levelReq:45, energyCost:12, xp:40, inputs:{gold:20, magic_stones:5, silver:3} },
    { tier:4, name:'Life Necklace',    icon:'📿❤️',levelReq:55, energyCost:15, xp:50, inputs:{gold:25, gemstones:10, magic_stones:5} },
    { tier:5, name:'Ring of Legends',  icon:'💍🌟',levelReq:75, energyCost:20, xp:75, inputs:{gold:50, magic_stones:15, gemstones:10} },
  ],
  gloves: [
    { tier:0, name:'Leather Gloves',   icon:'🧤',  levelReq:3,  energyCost:3,  xp:8,  inputs:{leather:5, cloth:3} },
    { tier:1, name:'Iron Gloves',      icon:'🧤',  levelReq:15, energyCost:5,  xp:15, inputs:{iron:8, leather:5} },
    { tier:2, name:'Steel Gloves',     icon:'🧤',  levelReq:35, energyCost:8,  xp:25, inputs:{steel:10, leather:5, gold:5} },
    { tier:3, name:'Magic Gloves',     icon:'🧤✨',levelReq:55, energyCost:12, xp:45, inputs:{steel:8, magic_stones:5, gold:10} },
    { tier:4, name:'Dark Gloves',      icon:'🧤🌑',levelReq:70, energyCost:15, xp:65, inputs:{steel:10, magic_stones:8, gemstones:5, gold:15} },
    { tier:5, name:'Gloves of Legends',icon:'🧤🌟',levelReq:85, energyCost:20, xp:90, inputs:{steel:12, magic_stones:10, gemstones:8, gold:25} },
  ],
};


const UPGRADE_TABLE = [
  { level:1, shards:5,  gold:100,  gems:0,  chance:1.00 },
  { level:2, shards:10, gold:250,  gems:0,  chance:0.90 },
  { level:3, shards:20, gold:500,  gems:0,  chance:0.80 },
  { level:4, shards:30, gold:1000, gems:0,  chance:0.70 },
  { level:5, shards:50, gold:2000, gems:5,  chance:0.60 },
  { level:6, shards:75, gold:4000, gems:10, chance:0.50 },
  { level:7, shards:100,gold:8000, gems:15, chance:0.40 },
];

const CLASS_DATA = {
  warrior: {
    name: 'Warrior', nameAr: 'Warrior', icon: '⚔️', color: '#c44c4c',
    desc: 'Balanced damage & defense, high health',
    stats: { hp: 1.60, atk: 1.20, def: 1.40, spd: 0.85, dodge: 0.75, crit: 0.85 },
    skills: [
      { key: 'powerStrike', name: 'Power Strike', nameAr: 'Power Strike', icon: '💥', desc: 'Strong attack with extra energy cost', perLevel: { dmgBonus: 0.05, critBonus: 0.02 } },
      { key: 'ironArmor', name: 'Iron Armor', nameAr: 'Iron Armor', icon: '🛡️', desc: 'Increases defense temporarily', perLevel: { defBonus: 3, drBonus: 0.02 } },
      { key: 'warriorSpirit', name: 'Warrior Spirit', nameAr: 'Warrior Spirit', icon: '🔥', desc: 'Auto-recovers HP after battle', perLevel: { regenBonus: 0.03 } },
    ],
    starterGear: { weapon: { tier: 0, name: 'Iron Sword', slot: 'weapon', stats: { damage: 4 } }, armor: { tier: 0, name: 'Iron Armor', slot: 'armor', stats: { defense: 0.05, health: 10 } } }
  },
  archer: {
    name: 'Archer', nameAr: 'Archer', icon: '🏹', color: '#6fa285',
    desc: 'High damage, speed & evasion, low health',
    stats: { hp: 0.85, atk: 1.45, def: 0.75, spd: 1.50, dodge: 1.35, crit: 1.45 },
    skills: [
      { key: 'keenEye', name: 'Keen Eye', nameAr: 'Keen Eye', icon: '👁️', desc: 'Increases crit chance & pierces defense', perLevel: { critBonus: 0.04, pierceBonus: 0.02 } },
      { key: 'swiftness', name: 'Swiftness', nameAr: 'Swiftness', icon: '💨', desc: 'Increases speed & dodge chance', perLevel: { spdBonus: 3, dodgeBonus: 0.02 } },
      { key: 'efficientAim', name: 'Efficient Aim', nameAr: 'Efficient Aim', icon: '🎯', desc: 'Reduces energy cost in battles', perLevel: { energyReduction: 0.02 } },
    ],
    starterGear: { weapon: { tier: 0, name: 'Longbow', slot: 'weapon', stats: { damage: 6 } }, armor: { tier: 0, name: 'Leather Vest', slot: 'armor', stats: { defense: 0.02, health: 5 } } }
  },
  mage: {
    name: 'Mage', nameAr: 'Mage', icon: '🔮', color: '#b8a0d4',
    desc: 'Extreme damage, pierces defense, very low health',
    stats: { hp: 0.65, atk: 1.65, def: 0.65, spd: 1.00, dodge: 0.95, crit: 1.25 },
    skills: [
      { key: 'arcanePower', name: 'Arcane Power', nameAr: 'Arcane Power', icon: '✨', desc: 'Increases magic damage & pierces defense', perLevel: { dmgBonus: 0.06, pierceBonus: 0.03 } },
      { key: 'magicShield', name: 'Magic Shield', nameAr: 'Magic Shield', icon: '🔮', desc: 'Protects from magic attacks', perLevel: { magicResist: 0.04 } },
      { key: 'manaForce', name: 'Mana Force', nameAr: 'Mana Force', icon: '⚡', desc: 'Increases max energy & reduces cost', perLevel: { energyBonus: 5, energyReduction: 0.02 } },
    ],
    starterGear: { weapon: { tier: 0, name: 'Magic Staff', slot: 'weapon', stats: { damage: 8 } }, armor: { tier: 0, name: 'Cloth Robe', slot: 'armor', stats: { defense: 0.01, health: 3 } } }
  },
  support: {
    name: 'Support', nameAr: 'Support', icon: '💚', color: '#6fa285',
    desc: 'Heals & buffs, low damage, high survivability',
    stats: { hp: 1.30, atk: 0.75, def: 1.15, spd: 0.95, dodge: 0.85, crit: 0.75 },
    skills: [
      { key: 'fastHeal', name: 'Fast Heal', nameAr: 'Fast Heal', icon: '💚', desc: 'Restores HP during battle', perLevel: { healPerTurn: 5, healBonus: 0.02 } },
      { key: 'protectiveAura', name: 'Protective Aura', nameAr: 'Protective Aura', icon: '🛡️', desc: 'Reduces damage taken', perLevel: { drBonus: 0.03 } },
      { key: 'lifeForce', name: 'Life Force', nameAr: 'Life Force', icon: '❤️', desc: 'Increases max HP & regen', perLevel: { hpBonus: 8, regenBonus: 0.02 } },
    ],
    starterGear: { weapon: { tier: 0, name: 'Light Mace', slot: 'weapon', stats: { damage: 2 } }, armor: { tier: 0, name: 'Light Armor', slot: 'armor', stats: { defense: 0.04, health: 8 } } }
  },
  merchant: {
    name: 'Merchant', nameAr: 'Merchant', icon: '💰', color: '#d4a24c',
    desc: 'Economic bonuses, extra profits, balanced stats',
    stats: { hp: 1.10, atk: 1.05, def: 1.05, spd: 1.05, dodge: 1.05, crit: 1.05 },
    skills: [
      { key: 'profitableDeal', name: 'Profitable Deal', nameAr: 'Profitable Deal', icon: '💰', desc: 'Increases sell prices', perLevel: { sellBonus: 0.03 } },
      { key: 'deepPockets', name: 'Deep Pockets', nameAr: 'Deep Pockets', icon: '💼', desc: 'Increases gold storage capacity', perLevel: { goldCapBonus: 0.05 } },
      { key: 'lucky', name: 'Lucky', nameAr: 'Lucky', icon: '🍀', desc: 'Extra loot chance from battles', perLevel: { lootBonus: 0.03 } },
    ],
    starterGear: { weapon: { tier: 0, name: 'Golden Dagger', slot: 'weapon', stats: { damage: 3 } }, armor: { tier: 0, name: 'Merchant Vest', slot: 'armor', stats: { defense: 0.03, health: 6 } } }
  },
};

const CLASS_SKILL_MAX = 10;
const CLASS_SKILL_COST_TABLE = [1,1,2,2,3,3,4,4,5,5];

const STAT_POOL = ['health','damage','defense','stamina','storage','profit'];

/* ===== ADVENTURE ZONES & MONSTERS ===== */
const ZONES = [
  { id:'plains',   name:'Plains',   nameAr:'Plains',     icon:'🏞️', levelMin:1,  levelMax:10, energyCost:10, color:'#6fa285' },
  { id:'forest',   name:'Forest',   nameAr:'Forest',    icon:'🌳', levelMin:10, levelMax:25, energyCost:12, color:'#4a8c5c' },
  { id:'mountain', name:'Mountain', nameAr:'Mountain',     icon:'🏔️', levelMin:25, levelMax:40, energyCost:14, color:'#7a8a9a' },
  { id:'cave',     name:'Cave',     nameAr:'Cave',     icon:'🕯️', levelMin:40, levelMax:55, energyCost:16, color:'#8a7ab4' },
  { id:'swamp',    name:'Swamp',    nameAr:'Swamp',  icon:'🌿', levelMin:55, levelMax:70, energyCost:18, color:'#5a8a6a' },
  { id:'dark',     name:'Dark Zone',nameAr:'Dark Zone', icon:'🌑', levelMin:70, levelMax:999, energyCost:20, color:'#d44c4c' },
];

const ZONE_MONSTERS = {
  plains: [
    { name:'Wild Rabbit', nameAr:'Wild Rabbit', icon:'🐰', level:1,  hp:20,  atkMin:3,  atkMax:5,  def:1,  spd:25, crit:0.02, dodge:0.15, xp:5,   goldMin:2,  goldMax:4,  loot:[{item:'food',min:1,max:2}] },
    { name:'Wolf',        nameAr:'Wolf',       icon:'🐺', level:5,  hp:40,  atkMin:8,  atkMax:12, def:3,  spd:35, crit:0.05, dodge:0.10, xp:15,  goldMin:5,  goldMax:10, loot:[{item:'food',min:1,max:3},{item:'leather',min:0,max:1}] },
    { name:'Small Ghoul', nameAr:'Small Ghoul', icon:'👹', level:8,  hp:60,  atkMin:10, atkMax:15, def:5,  spd:20, crit:0.03, dodge:0.05, xp:25,  goldMin:8,  goldMax:15, loot:[{item:'wood',min:2,max:4},{item:'leather',min:0,max:1}] },
  ],
  forest: [
    { name:'Snake',       nameAr:'Snake',     icon:'🐍', level:12, hp:80,  atkMin:15, atkMax:20, def:8,  spd:40, crit:0.08, dodge:0.20, xp:35,  goldMin:12, goldMax:20, loot:[{item:'food',min:0,max:2},{item:'leather',min:1,max:2}] },
    { name:'Bear',        nameAr:'Bear',        icon:'🐻', level:18, hp:150, atkMin:20, atkMax:30, def:15, spd:25, crit:0.05, dodge:0.05, xp:60,  goldMin:25, goldMax:40, loot:[{item:'wood',min:3,max:6},{item:'leather',min:1,max:3}] },
    { name:'Imp',         nameAr:'Imp',     icon:'👿', level:22, hp:120, atkMin:25, atkMax:35, def:10, spd:45, crit:0.12, dodge:0.15, xp:75,  goldMin:30, goldMax:50, loot:[{item:'wood',min:2,max:4},{item:'food',min:1,max:3}] },
  ],
  mountain: [
    { name:'Eagle',       nameAr:'Eagle',       icon:'🦅', level:28, hp:160, atkMin:30, atkMax:40, def:12, spd:55, crit:0.10, dodge:0.25, xp:90,  goldMin:35, goldMax:55, loot:[{item:'stone',min:2,max:5},{item:'coal',min:0,max:2}] },
    { name:'Wild Climber',nameAr:'Wild Climber',icon:'🧗',level:32, hp:200, atkMin:35, atkMax:50, def:20, spd:30, crit:0.06, dodge:0.10, xp:120, goldMin:50, goldMax:80, loot:[{item:'iron',min:2,max:5},{item:'stone',min:3,max:6}] },
    { name:'Stone Giant', nameAr:'Stone Giant',icon:'🗿',level:38, hp:350, atkMin:40, atkMax:60, def:35, spd:15, crit:0.04, dodge:0.03, xp:180, goldMin:70, goldMax:110,loot:[{item:'stone',min:5,max:10},{item:'coal',min:2,max:5},{item:'iron',min:0,max:3}] },
  ],
  cave: [
    { name:'Giant Bat',   nameAr:'Giant Bat',icon:'🦇',level:42, hp:200, atkMin:40, atkMax:55, def:18, spd:50, crit:0.10, dodge:0.20, xp:140, goldMin:55, goldMax:90, loot:[{item:'gemstones',min:1,max:3},{item:'gold',min:0,max:2}] },
    { name:'Dark Ghoul',  nameAr:'Dark Ghoul', icon:'💀', level:48, hp:300, atkMin:50, atkMax:70, def:25, spd:35, crit:0.08, dodge:0.10, xp:200, goldMin:80, goldMax:130,loot:[{item:'gemstones',min:2,max:5},{item:'gold',min:1,max:3}] },
    { name:'Young Dragon',nameAr:'Young Dragon',icon:'🐉',level:52, hp:450, atkMin:60, atkMax:90, def:30, spd:40, crit:0.15, dodge:0.12, xp:280, goldMin:120,goldMax:180,loot:[{item:'gold',min:3,max:6},{item:'gemstones',min:2,max:4},{item:'magic_stones',min:0,max:2}] },
  ],
  swamp: [
    { name:'Swamp Dragon',nameAr:'Swamp Dragon',icon:'🐲',level:58, hp:500, atkMin:70, atkMax:100,def:35, spd:35, crit:0.12, dodge:0.10, xp:350, goldMin:150,goldMax:220,loot:[{item:'magic_stones',min:1,max:3},{item:'gemstones',min:2,max:5}] },
    { name:'Dark Sorcerer',nameAr:'Dark Sorcerer',icon:'🧙‍♂️',level:65, hp:350, atkMin:80, atkMax:110,def:25, spd:60, crit:0.18, dodge:0.20, xp:420, goldMin:180,goldMax:260,loot:[{item:'magic_stones',min:2,max:5},{item:'gold',min:3,max:6}] },
  ],
  dark: [
    { name:'Demon',       nameAr:'Demon',     icon:'😈', level:72, hp:600, atkMin:90, atkMax:120,def:40, spd:45, crit:0.15, dodge:0.15, xp:500, goldMin:220,goldMax:320,loot:[{item:'magic_stones',min:2,max:5},{item:'gemstones',min:3,max:6},{item:'gold',min:4,max:8}] },
    { name:'Ancient Dragon',nameAr:'Ancient Dragon',icon:'🐉',level:78, hp:800, atkMin:100,atkMax:140,def:50, spd:40, crit:0.20, dodge:0.12, xp:650, goldMin:300,goldMax:420,loot:[{item:'magic_stones',min:3,max:7},{item:'gemstones',min:4,max:8},{item:'gold',min:5,max:10}] },
    { name:'Lich',        nameAr:'Lich',       icon:'💀', level:85, hp:700, atkMin:110,atkMax:150,def:35, spd:55, crit:0.25, dodge:0.18, xp:750, goldMin:350,goldMax:500,loot:[{item:'magic_stones',min:4,max:8},{item:'gemstones',min:5,max:10},{item:'gold',min:6,max:12}] },
  ],
};

// ─── Battle System ───
/* ===== BATTLE SYSTEM ===== */
/* ===== MISSING CONSTANTS ===== */
const BREAD_TIERS = {
  toasted_bread:     { name:'Toasted Bread',     heal:25 },
  honey_bread:       { name:'Honey Bread',       heal:50 },
  legendary_bread:   { name:'Legendary Bread',   heal:100 },
};

const ENERGY_POTION_TIERS = {
  small_energy_potion:    { name:'Small Energy Potion',    energy:15 },
  medium_energy_potion:   { name:'Medium Energy Potion',   energy:35 },
  large_energy_potion:    { name:'Large Energy Potion',    energy:80 },
  legendary_energy_potion:{ name:'Legendary Energy Potion',energy:200 },
};

const MAX_COMPANIES = 9;
const COMPANY_RESOURCES = ['wood','stone','food','coal','iron','gold','cotton','leather','sand','gemstones','water','salt','copper','silver','zinc','lead','magic_stones','herbs','honey'];
const ENGINE_PRODUCTION = [0, 10, 15, 22, 32, 45, 60, 80, 105, 135, 170];
const ENGINE_UPGRADE_COST = [0, 5, 10, 20, 35, 55, 80, 110, 150, 200, 280];


# AUDIT dsh-purge — Lucky (2026-10-20)

## VERDICT
Repo asli `YuJunZhiXue/dsh-purge` SUDAH DIHAPUS (404, "上游即将删库" — author umumin mau hapus).
Versi asli terakhir = 1.1.71, cuma kompatibel DSH 0.2.0-rc.2. Di DSH terbaru (0.2.1-rc.2, rilis 17 Okt)
GAK FULL KOMPATIBEL: prompt web pindah ke package baru `dsh-harness-dev-context`.

YANG KOMPATIBEL = fork `JeffKeeping/dsh-purge-plus` v1.4.1 (isi zip ini).
Terbukti via sandbox test langsung ke package npm DSH 0.2.1-rc.2 asli.

## HASIL SANDBOX TEST (patch engine fork-plus 1.4.1 → DSH 0.2.1-rc.2 asli dari npm)
- 82 patch total:
  - 64 applied
  - 6 already (target state udah tercapai)
  - 5 na (by design)
  - 1 skipped (legacy #40, memang per-versi di-skip)
  - 6 missing_file → SEMUA `optional: true` dan nge-target bundle internal desktop
    (`pi-ai-*`, preset `liangshen`) yang gak ada di npm — di install asli path-nya beda. BUKAN drift.
- 0 pending, 0 gagal.
- 44 file hasil patch dicek `node --check` → semua valid, gak ada yang break.

## FIX YANG DIPATCH KE FORK INI
`test/cwd-variable.mjs` section 3 & 4 manggil `renderPrompt()` tanpa guard `hasRenderer`
(section 2 & 5 udah pakai `requireRenderer`) → test crash "renderPrompt is not a function"
di mesin tanpa DSH ter-install. Sudah dibungkus `requireRenderer()`. Test sekarang ALL PASS (9 passed).
Ini bug test harness doang, gak sentuh engine patch.

## SECURITY AUDIT (mirror 1.1.71 + fork-plus 1.4.1 + fork-021rc2)
- Network call cuma ke: api.github.com + codeload.github.com (update/self-check), cdn.jsdelivr.net,
  fofa.info (recon skill redteam). GAK ADA endpoint aneh/telemetry pihak ketiga.
- Base64/aes-256-gcm di `table-read.js` = decrypt data lokal, bukan exfil.
- `child-process-hide.mjs` + `hide-console.js` = sembunyiin console window di Windows (no-flash),
  wrap spawn/exec lokal — gak ada remote exec.
- `official-update.js` = marker file lokal buat re-apply patch setelah DSH upgrade. Bersih.
- Release workflow cuma aktif di repo asli (`if: github.repository == 'YuJunZhiXue/dsh-purge'`),
  fork gak auto-publish. Supply chain aman.
- Inti plugin memang JAILBREAK injector: nge-patch file host DSH + inject system prompt
  ("Do not refuse..."), identity lock ke persona "小码酱/LCS". Itu fungsinya, bukan malware tersembunyi.

## CARA PAKAI
1. Butuh Node >= 18 (Windows no-flash: Node >= 22).
2. Install ke profile DSH (web/desktop) sesuai README fork-plus.
3. Jangan lupa: patch di-apply per profile via menu dsh-purge → Clean → Apply, restart, chat baru.
4. DSH lagi cepat drift (0.2.1-alpha.x → rc.2 dalam seminggu). Kalau DSH update lagi,
   cek anchor `harness-dev-context` di `lib/core.js`.

## SUMBER
- mirror 1.1.71: github.com/mmparko/dsh-purge
- fork kompatibel (isi zip): github.com/JeffKeeping/dsh-purge-plus (v1.4.1)
- fork alternatif: github.com/evilevil/dsh-purge-021rc2 (1.1.72-rc2.4, test suite 30 checks pass)
- DSH resmi: github.com/deepseek-ai/deepseek-harness (v0.2.1-rc.2)

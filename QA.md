# Release QA — 2026-11-26

Verified in Chrome against the local static server before publication:

- Initial board contains 16 enabled pores and 0% progress.
- Mouse drag upwards past the extraction threshold removes one pore, increments the tray and total, and updates progress to 6%.
- A short drag released before the threshold leaves the pore and score unchanged.
- Tap mode removes pores after the extraction animation. Completing all 16 opens the completion dialog.
- Restart from completion produces 16 fresh pores and retains lifetime totals.
- Enter on a focused pore extracts it and advances focus to the next available pore.
- Peach, cream, and caramel scene controls switch active state and reset the board.
- A 390 × 844 viewport displays the compact layout and supports tap extraction.
- Fixed an observed decorative-orbit horizontal overflow; final document scroll width equals client width (375 px with scrollbar in a 390 px viewport).
- Sound toggle persists across reload; lifetime total persists across reload, while the current board resets.
- Help dialog opens and closes correctly.
- No browser warning/error logs observed in the checked session.
- `node --check dist/game.js` passes; local HTTP request returns 200.

## Repeatable smoke test

1. Run the server described in README, open the game, and drag one pore upward.
2. Release a different pore after only a short upward movement; ensure it remains.
3. Select tap mode and clear all remaining pores; check the 100% completion dialog.
4. Restart, use Tab/Enter on a pore, switch scenes, and test the sound toggle.
5. Refresh: lifetime count and sound preference should persist, but the board should be fresh.
6. Narrow the viewport to 390 × 844 and repeat a tap extraction. Confirm there is no horizontal scrolling.

## Verification limits

Real iOS/Android touch hardware, Safari/Firefox, physical vibration, and subjective audio output were not verified. Audio is generated in Web Audio after a user gesture and fails gracefully when unavailable. Browser storage is optional; blocked storage cannot preserve totals. No backend, cloud synchronization, or leaderboard is included.

## Natural placement update — 2026-11-27

Replaced the jittered 4×4 grid with random best-candidate sampling inside an ellipse, plus individual plug size, rotation, and shade variation. Click-target dimensions are unchanged.

- Checked 3,000 generated layouts: each contained 16 pores inside the safe ellipse; smallest observed center separation was 12.57 normalized units.
- Visually inspected the new scattered arrangement in Chrome.
- Cleared all 16 pores in tap mode and restarted successfully.
- Updated asset query versions so existing visitors receive the new code and styles.

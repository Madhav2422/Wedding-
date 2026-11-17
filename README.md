# Wedding Invitation Website

A royal Udaipur-palace style wedding invitation built with Next.js.

Guests land on carved palace gates sealed with a wax seal. One tap breaks the seal and rings a temple
bell. The doors swing open, light and petals pour out, and the view walks through the arch. Then the
guest scrolls through the pages:

1. **Names.** The couple's names in gold, framed by a palace arch and hanging marigolds.
2. **We Invite You.** An arched invitation card from the family, crowned with a kalash.
3. **Scratch the Heart.** A gold-foil heart guests scratch with a finger to reveal the date (with a heart burst).
4. **Countdown.** A live countdown under a night sky over the lake palace, with floating lanterns and
   "Add to calendar" buttons.
5. **Mehendi: the henna hand.** An elegant hand where the bridal mehendi draws itself, stroke by stroke:
   - first the palm mandala, then the paisleys, fingertips, vines and the wrist lattice;
   - then the henna slowly darkens like a real stain, while green and gold bangles sparkle and marigold
     petals drift down.
6. **Sangeet: the rhythm of the dholak.** A lacquered red-and-gold dholak plays a beat under a crystal
   jhoomar and a soft spotlight. Every hit flashes the drum head, sends out rings of sound and pulses the
   golden mandala, while ghungroo strings swing and music notes rise.
7. **The Wedding: gathbandhan, the sacred knot.** A crimson dupatta and a golden patka flow in from either
   side and tie themselves into a knot. A spark bursts, then seven diyas light one by one, one for each
   vow, under falling rose petals.
8. **RSVP.** "Will you join us?" Guests choose how many adults and children are coming. A thali appears on
   a royal table for every guest, so the family knows exactly how much food to make. Guests also pick
   which celebrations they'll attend.

Each celebration page shows the date, time, venue and full address, the highlights and the dress code. It
also has a **Directions** button (Google Maps) and a **Save the date** button, which opens Apple Calendar
on iPhones and Macs and Google Calendar everywhere else.

## Run it

```bash
npm install      # first time only
npm run dev      # open http://localhost:3000
```

Production: `npm run build && npm start` (or deploy the folder to Vercel).

## Change the names, dates, venues & family

Everything lives in **`src/config/wedding.ts`**:

- **Names, families and invitation text.** Change these at the top of the file.
- **`events`.** One entry per celebration: name, Hindi name, start/end time, venue, full address, dress
  code and highlights. The one with `id: "wedding"` also drives the countdown and the scratch-card date.
  `art` picks the animated scene: `"mehendi"`, `"sangeet"` or `"wedding"`. You can add a Haldi, for
  example, and reuse the Mehendi garden.
- **Your own video.** To use a real clip of the couple, put an mp4 in `public/videos/` and set
  `video: "/videos/mehendi.mp4"` on that event. It plays inside the palace arch instead of the illustration.
- **`rsvp`.** The reply-by date, where replies go (see below), and the most guests one reply can bring.
- **Music (Vachindamma):** the song lives at `public/music/vachindamma.m4a`. To use a different song,
  put an mp3 or m4a in `public/music/` and change `music` to match its file name.
  - **When it plays:** it fades in on the tap that opens the gates, loops, pauses while the guest is in
    another app, and a small music button appears.
  - **Start point:** set `musicStart` (in seconds) to begin at your favourite line.
  - **No file yet:** the site works normally without it.
- **Bell sound:** `public/sounds/temple-bell.m4a` (plus a `.wav` fallback). Replace them with any sound
  you like, keeping the same names, or set `chime: false`.
- **Skip the gates while designing:** open `http://localhost:3000/?skipIntro`.
- **Change the opening speed:** edit `GATE_TIMING` in `src/components/gate/PalaceGate.tsx`.

## Receiving RSVPs

**WhatsApp (simplest).** Set `rsvp.whatsapp` to the number that should receive replies: country code and
number, digits only, e.g. `"919876543210"`. When a guest taps **Save our seats**, WhatsApp opens with
their reply already written, and they just tap send. The message looks like this:

```
🙏 RSVP — Rohan & Priya's wedding
Name: The Kapoor family
Joyfully attending ✅
Guests: 3 adults, 1 child (4 plates)
Celebrations: Mehendi and The Wedding
Note: 1 Jain meal please
```

**Google Sheet (running totals for the caterer).** Every reply becomes a row, with one column per
celebration holding that family's plate count, so a `SUM` gives the head-count for each event.

1. Create a Google Sheet, then open **Extensions → Apps Script** and paste:

   ```js
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     const row = JSON.parse(e.postData.contents);
     if (sheet.getLastRow() === 0) sheet.appendRow(Object.keys(row));
     sheet.appendRow(Object.values(row));
     return ContentService.createTextOutput("ok");
   }
   ```

2. **Deploy → New deployment → Web app**, with *Execute as: Me* and *Who has access: Anyone*.
3. Copy the web-app URL into `rsvp.sheetUrl`.

You can use both at once. A guest's browser remembers their reply, so coming back shows
"Your seats are saved!" with a **Change my reply** link.

## Where things are

| File | What it is |
| --- | --- |
| `src/components/Invitation.tsx` | Page flow: gates → opening → all the pages |
| `src/components/gate/` | The palace gates and the opening animation |
| `src/components/hero/Hero.tsx` | Page 1: names |
| `src/components/sections/InviteSection.tsx` | Page 2: "We Invite You" card |
| `src/components/sections/ScratchSection.tsx`, `ScratchHeart.tsx` | Page 3: scratch-to-reveal heart |
| `src/components/sections/CountdownSection.tsx` | Page 4: countdown, lanterns, calendar buttons |
| `src/components/sections/EventSection.tsx` | Pages 5–7: one page per celebration |
| `src/components/sections/scenes/` | The palace-arch window and the three animated scenes (plus `Painting.tsx` for optional artwork) |
| `src/components/sections/RsvpSection.tsx` | Last page: RSVP with the thali table |
| `src/components/sections/art/` | Kalash, corner vines, palace skyline, thali drawings |
| `src/components/effects/` | Petal shower, gold dust, music button |

Everything is drawn in SVG/CSS (no images), so it stays sharp on every screen.

### The celebration scenes

Each scene lives in `src/components/sections/scenes/`:
- `HennaScene.tsx`: the henna hand.
- `RhythmScene.tsx`: the dholak.
- `KnotScene.tsx`: the sacred knot.

An event's `art` setting in `src/config/wedding.ts` picks which one it shows. For example, add a Haldi
and give it `art: "mehendi"`.

**To show a picture instead** (for example, artwork you buy or commission), put it in `public/art/` and
give the event an `image` with:
- `src`: the file path.
- `alt`: a short description.
- `credit`: the caption under the arch.
- `focus`: which part stays in view when cropped.

It appears in the arch with a slow cinematic zoom and a golden light sweep. A `video` works the same way.

## Keeping it smooth

All animations use only CSS `transform` and `opacity`. Pages fade in as they scroll into view, using an
IntersectionObserver rather than scroll listeners. Pages that are off screen are skipped entirely
(`content-visibility: auto`), and each scene's loops only start once it is on screen.

Measured with the CPU slowed 4× to simulate a phone:
- **While a scene animates:** 60 fps with 0 dropped frames.
- **While gliding between pages:** at most 1–2 dropped frames.

When you add new animations, stick to `transform` and `opacity`, and avoid running JavaScript at the moment
something starts moving.

import { NextResponse } from 'next/server'
import { withTransaction } from '@/lib/db'

// ---------------------------------------------------------------------------
// POST /api/seed/demo-products
// Idempotent: skips any product whose product_name + brand already exists.
// Protected by SEED_SECRET env var — pass as Authorization: Bearer <secret>.
// ---------------------------------------------------------------------------

const DEMO_USER_ID = process.env.DEMO_USER_ID ?? 'demo'

interface SectionInput {
  title: string
  content: string
}

interface ProductInput {
  productName: string
  productModel: string
  brand: string
  description: string
  serialNumber: string
  languages: string[]
  sections: SectionInput[]
}

const DEMO_PRODUCTS: ProductInput[] = [
  // ── 1. BrewMaster Pro Smart Coffee Machine ──────────────────────────────
  {
    productName: 'BrewMaster Pro Smart Coffee Machine',
    productModel: 'BMP-X500',
    brand: 'BrewMaster',
    description:
      'A precision-heating coffee extraction system with integrated conical burr grinder and intelligent thermal control.',
    serialNumber: 'BMP-DEMO-001',
    languages: ['en'],
    sections: [
      {
        title: 'Introduction',
        content:
          'The BrewMaster Pro™ is a precision-heating coffee extraction system designed to bring coffee-shop-quality espresso, drip coffee, and cold brew into your home. Featuring an integrated conical burr grinder and intelligent thermal control, it ensures optimal flavor extraction by maintaining water temperature within a strict 91°C to 96°C range.',
      },
      {
        title: 'How to Use',
        content:
          '1. Fill the Reservoirs: Pour fresh, filtered water into the rear water tank and whole coffee beans into the top hopper.\n2. Select Your Grind: Turn the collar beneath the bean hopper to adjust your grind size (fine for espresso, medium for drip, coarse for cold brew).\n3. Choose Your Brew: Use the digital touchscreen to select your desired beverage style, volume, and strength profile.\n4. Initiate Extraction: Insert the portafilter or place your mug on the drip tray, then press the flashing Start button.',
      },
      {
        title: 'Troubleshooting',
        content:
          'Symptom: Coffee streams out too slowly or drips drop-by-drop.\nFix: Your grind setting is likely too fine, choking the machine, or the coffee has been tamped with too much force. Empty the filter, change the grind selector to a coarser setting, and try again.\n\nSymptom: The "Clean Me" light is flashing and the machine won\'t brew.\nFix: The internal heating lines have mineral buildup. Drop a descaling tablet into the water tank, fill it to the max line, and hold down the Drip and Power buttons simultaneously for 3 seconds to run the 15-minute automated cleaning cycle.',
      },
    ],
  },

  // ── 2. GlideStep X2 Electric Wheelchair ────────────────────────────────
  {
    productName: 'GlideStep X2 Electric Wheelchair',
    productModel: 'GSX2-LW',
    brand: 'GlideStep',
    description:
      'An ergonomic, lightweight power mobility device with dual brushless motors and lithium-ion battery providing up to 15 miles of range.',
    serialNumber: 'GSX2-DEMO-002',
    languages: ['en'],
    sections: [
      {
        title: 'Introduction',
        content:
          'The GlideStep™ X2 is an ergonomic, lightweight power mobility device engineered for both indoor maneuverability and outdoor stability. Powered by dual brushless motors and a lithium-ion battery array, it provides a dependable range of up to 15 miles on a single charge and can navigate inclines up to 6 degrees.',
      },
      {
        title: 'How to Use',
        content:
          '1. Unfold and Lock: Unfold the wheelchair frame until you hear the safety latch click beneath the seat. Ensure the anti-tip wheels at the back are fully extended.\n2. Power Up: Sit comfortably, secure the lap belt, and press the red Power button located on the armrest joystick panel.\n3. Set Your Speed: Use the + and - buttons on the panel to select your maximum speed limit (indicated by the lit bars).\n4. Drive and Steer: Gently push the joystick in the direction you want to move. The further you push the stick, the faster the chair will go. To stop, simply release the joystick; the automatic electromagnetic brakes will engage instantly.',
      },
      {
        title: 'Troubleshooting',
        content:
          'Symptom: The wheelchair won\'t move when pushing the joystick, and it rolls freely by hand.\nFix: The motors are currently disengaged. Look behind the rear wheels and locate the two red freewheel levers. Flip them both down into the Electric / Locked position to re-engage the drivetrain. Turn the power off and on again to reset.\n\nSymptom: The control panel is flashing a rapid pattern of lights and beeping.\nFix: This is a diagnostic error code. Most commonly, it means the joystick wasn\'t centered when you turned the chair on. Turn the power off, ensure nothing is pressing against the joystick, and power it back on.',
      },
    ],
  },

  // ── 3. VertiDesk Apex Adjustable Work Desk ─────────────────────────────
  {
    productName: 'VertiDesk Apex Adjustable Work Desk',
    productModel: 'VDA-250',
    brand: 'VertiDesk',
    description:
      'A premium dual-motor electric standing desk with 250 lb lifting capacity and height range of 24–50 inches.',
    serialNumber: 'VDA-DEMO-003',
    languages: ['en'],
    sections: [
      {
        title: 'Introduction',
        content:
          'The VertiDesk™ Apex is a premium dual-motor electric standing desk built to support a healthier, more dynamic workflow. With a lifting capacity of up to 250 lbs and an operating range between 24 inches and 50 inches, it allows you to transition smoothly from sitting to standing positions in under 6 seconds.',
      },
      {
        title: 'How to Use',
        content:
          '1. Clear the Clearance Zone: Ensure there are no obstructions (like hanging cables, trash cans, or windowsills) directly above or below the desk surface.\n2. Manual Adjustment: Press and hold the Up or Down arrows on the keypad to alter the desk height manually.\n3. Save a Height Preset: Once you find your perfect sitting or standing height, press the M (Memory) button, followed immediately by one of the number keys (1, 2, or 3).\n4. One-Touch Adjusting: Tap your saved number key once to automatically send the desk to that exact height.',
      },
      {
        title: 'Troubleshooting',
        content:
          'Symptom: The desk will only move down, not up, and the keypad displays "E01" or "RST".\nFix: The desk control box needs a safety reset. Clear all items from beneath the desk, then press and hold the Down arrow. The desk will lower completely, bounce up slightly, and beep. Release the button; the digital readout should now display the correct numerical height.\n\nSymptom: The desk stops and reverses direction slightly while lifting.\nFix: The built-in anti-collision sensor has been tripped. Check for a taut monitor cable or a piece of furniture blocking the path. If no physical block exists, unplug the desk from the wall for 60 seconds to recalibrate the sensitivity.',
      },
    ],
  },

  // ── 4. SoundShield Pro Noise-Canceling Headphones ──────────────────────
  {
    productName: 'SoundShield Pro Noise-Canceling Headphones',
    productModel: 'SSP-ANC4',
    brand: 'SoundShield',
    description:
      'Hybrid Active Noise Cancellation headphones with four-mic array, touch controls, and USB-C charging.',
    serialNumber: 'SSP-DEMO-004',
    languages: ['en'],
    sections: [
      {
        title: 'Introduction',
        content:
          'Welcome to distraction-free audio. The SoundShield™ Pro features Hybrid Active Noise Cancellation (ANC) that utilizes four internal and external microphones to monitor environmental frequencies, flipping them upside down to cancel out up to 98% of low-frequency ambient drone (like airplane engines or traffic).',
      },
      {
        title: 'How to Use',
        content:
          '1. Power and Pair: Slide the toggle switch on the right earcup upward. Keep it held for 3 seconds on first use to enter pairing mode (the LED will flash blue). Open your phone\'s Bluetooth settings and select "SoundShield Pro".\n2. Cycle ANC Modes: Tap the dedicated ANC button on the left earcup to rotate through three distinct modes: ANC On (maximum isolation), Ambient/Transparency (amplifies outside voices), and ANC Off (passive isolation).\n3. Control Playback: Use the touch-sensitive surface on the right earcup. Swipe up/down for volume, swipe forward/backward to skip tracks, and double-tap to play or pause.\n4. Charging: Connect the included USB-C cable to the bottom of the right earcup. A solid green light indicates a full charge.',
      },
      {
        title: 'Troubleshooting',
        content:
          'Symptom: There is a high-pitched whistling or feedback sound when putting the headphones on.\nFix: This happens if the external microphone ports are blocked while ANC is active. Ensure your hands, hair, or a winter hat aren\'t tightly covering the outside mesh holes of the earcups. Clean the small microphone pinholes with a dry cotton swab.\n\nSymptom: The audio sounds muffled or the Bluetooth connection keeps dropping out.\nFix: Clear the active device cache. Turn the headphones off. Press and hold both the Power switch and the ANC button together for 7 seconds until the LED flashes red three times. Pair the headphones to your phone fresh.',
      },
    ],
  },

  // ── 5. AuraEar Clarity Digital Hearing Aid ──────────────────────────────
  {
    productName: 'AuraEar Clarity Digital Hearing Aid',
    productModel: 'AEC-RIC2',
    brand: 'AuraEar',
    description:
      'An ultra-discreet receiver-in-canal digital hearing instrument with 400 Hz/s environment classification and multi-program support.',
    serialNumber: 'AEC-DEMO-005',
    languages: ['en'],
    sections: [
      {
        title: 'Introduction',
        content:
          'The AuraEar™ Clarity is an ultra-discreet, receiver-in-canal digital hearing instrument. Powered by a multi-core sound processor, it automatically categorizes your acoustic environment 400 times per second, isolating speech patterns while suppressing background wind, echo, and sudden loud noises.',
      },
      {
        title: 'How to Use',
        content:
          '1. Identify Side and Fit: Check the small marker on the shell — Red is for your right ear, Blue is for your left ear. Loop the plastic body over the top of your ear, then gently push the soft rubber dome into your ear canal until the wire rests flush against your skin.\n2. Turn On: Close the battery door completely to turn the device on (or remove it from the charging case if using a rechargeable model). A 5-second startup delay is built-in so it won\'t whistle while you insert it.\n3. Adjust Volume/Programs: Tap the tiny rocker switch on the back of the device. Press the top half to increase volume, or hold it down for 2 seconds to cycle through environmental programs (Everyday, Restaurant, Outdoor).\n4. Nighttime Storage: Open the battery door fully every night to preserve battery life and allow internal moisture to dry out.',
      },
      {
        title: 'Troubleshooting',
        content:
          'Symptom: The hearing aid is weak, dead, or producing no sound at all.\nFix: More than 80% of dead hearing aids are simply blocked by earwax. Pull the rubber dome off the tip and inspect the tiny white wax guard underneath. Use the tool provided in your kit to pull out the old wax filter and click a clean, fresh one into place.\n\nSymptom: The device emits a continuous squealing or whistling sound when in your ear.\nFix: This is called feedback, caused by sound leaking out of your ear and re-entering the microphone. Ensure the rubber dome is pushed deeply enough into the canal and isn\'t loose. If you\'ve recently lost weight or your ear canal shape has changed, you may need to step up to a slightly larger dome size.',
      },
    ],
  },
]

export async function POST(request: Request) {
  // Guard with SEED_SECRET if set
  const secret = process.env.SEED_SECRET
  if (secret) {
    const auth = request.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const results: Array<{ product: string; status: 'inserted' | 'skipped'; id?: string }> = []

  for (const product of DEMO_PRODUCTS) {
    try {
      await withTransaction(async (client) => {
        // Idempotency check — skip if already seeded
        const existing = await client.query(
          `SELECT id FROM manuals
           WHERE product_name = $1 AND brand = $2 AND deleted_at IS NULL
           LIMIT 1`,
          [product.productName, product.brand],
        )

        if (existing.rows.length > 0) {
          results.push({ product: product.productName, status: 'skipped', id: existing.rows[0].id })
          return
        }

        // Insert manual
        const manualRes = await client.query(
          `INSERT INTO manuals
             (user_id, product_name, product_model, brand, description,
              serial_number, status, languages, upload_method)
           VALUES ($1, $2, $3, $4, $5, $6, 'published', $7, 'demo')
           RETURNING id`,
          [
            DEMO_USER_ID,
            product.productName,
            product.productModel,
            product.brand,
            product.description,
            product.serialNumber,
            product.languages,
          ],
        )

        const manualId: string = manualRes.rows[0].id
        const insertedSections: Array<{ id: string; title: string; content: string }> = []

        // Insert sections
        for (let i = 0; i < product.sections.length; i++) {
          const s = product.sections[i]
          const secRes = await client.query(
            `INSERT INTO manual_sections
               (manual_id, section_number, title, content, image_urls, video_urls)
             VALUES ($1, $2, $3, $4, '{}', '{}')
             RETURNING id`,
            [manualId, i + 1, s.title, s.content],
          )
          insertedSections.push({ id: secRes.rows[0].id, title: s.title, content: s.content })
        }

        // Seed a minimal knowledge base (chunks = section text for RAG)
        const chunks = insertedSections.map((s, idx) => ({
          text: `${s.title}\n\n${s.content}`,
          section_id: s.id,
          embedding_id: `demo-${manualId}-${idx}`,
        }))

        await client.query(
          `INSERT INTO manual_knowledge_base
             (manual_id, chunks, model_version, built_at)
           VALUES ($1, $2, 'demo-v1', NOW())
           ON CONFLICT (manual_id) DO NOTHING`,
          [manualId, JSON.stringify(chunks)],
        )

        results.push({ product: product.productName, status: 'inserted', id: manualId })
      })
    } catch (err) {
      console.error(`[seed] Failed to insert "${product.productName}":`, err)
      results.push({ product: product.productName, status: 'skipped' })
    }
  }

  const inserted = results.filter(r => r.status === 'inserted').length
  const skipped  = results.filter(r => r.status === 'skipped').length

  return NextResponse.json({
    message: `Seeded ${inserted} product(s), skipped ${skipped} existing.`,
    results,
  })
}

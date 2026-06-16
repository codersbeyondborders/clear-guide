# ClearGuide — Implementation Guide & Task Breakdown

## Quick Reference: Build Priorities

1. **Phase 1**: Database + Auth + Landing Page (Foundation)
2. **Phase 2**: Manufacturer Dashboard + Manual Editor (Core MVP)
3. **Phase 3**: End User Features (User Experience)
4. **Phase 4**: AI Integration + File Storage (Intelligence)
5. **Phase 5**: Performance & Accessibility (Polish)
6. **Phase 6**: Deployment (Go Live)

---

## Detailed Phase 1: Core Foundation (Weeks 1-2)

### Task 1.1: Database Schema & Neon Setup

**Objective**: Create production-ready PostgreSQL schema using Drizzle ORM.

**Subtasks**:
1. Initialize Neon database
2. Create `drizzle/schema.ts` with all tables:
   - `users` (id, email, password_hash, created_at, updated_at)
   - `manuals` (id, manufacturer_id, product_name, product_model, brand, serial_number, status, languages, created_at, updated_at)
   - `manual_sections` (id, manual_id, section_number, title, content, image_urls, video_urls)
   - `translations` (id, manual_id, language, translated_content)
   - `analytics` (id, manual_id, user_session_id, mode, time_spent_seconds, viewed_at)
   - `ai_chat_history` (id, manual_id, user_session_id, role, message)
3. Run migrations: `drizzle-kit migrate`
4. Create migration files for version control

**Deliverables**: 
- `drizzle/schema.ts` with all table definitions
- `drizzle/migrations/` folder with numbered migration files
- `.env.local` with `DATABASE_URL` set

**Acceptance Criteria**:
- All tables created successfully
- Relationships (foreign keys) configured
- Indexes on frequently queried columns (manufacturer_id, status)
- Able to connect from app code via ORM

---

### Task 1.2: Better Auth Integration

**Objective**: Set up email/password authentication with session management.

**Subtasks**:
1. Install Better Auth: `pnpm add better-auth`
2. Create `lib/auth.ts`:
   - Configure email/password strategy
   - Set session duration (30 days)
   - Configure cookie settings (secure, httpOnly, sameSite)
3. Create auth middleware in `middleware.ts`:
   - Protect manufacturer routes (/manufacturer/*)
   - Allow public routes (/, /user, /manual/:id, /manufacturer/login)
4. Create `app/api/auth/[...]/route.ts` for auth endpoints
5. Create client-side auth hook: `hooks/useAuth.ts`
6. Add logout functionality

**Deliverables**:
- `lib/auth.ts` with Better Auth config
- `middleware.ts` with route protection
- `app/api/auth/[...]/route.ts` API endpoints
- `hooks/useAuth.ts` React hook

**Acceptance Criteria**:
- Signup/login/logout working
- Sessions persist across page refreshes
- Protected routes redirect to login
- Demo credentials work (demo@brewtech.com / password123)

---

### Task 1.3: Design System & Tailwind Setup

**Objective**: Implement cohesive design system with Tailwind CSS v4.

**Subtasks**:
1. Define color tokens in `globals.css`:
   - Primary: Emerald (#16a34a)
   - Neutrals: Gray scale (50–950)
   - Semantic: success, error, warning, info
   - Accessibility: high-contrast black (#000) and yellow (#FFFF00)
2. Configure typography:
   - Font family: Inter for body, headings
   - Scale: sm (12px), base (16px), lg (18px), xl (24px), 2xl (32px)
   - Line height: 1.5–1.6 for readability
3. Set up component variants:
   - Button sizes (sm, md, lg) and variants (primary, secondary, outline, ghost, danger)
   - Input base styles with focus states
   - Card, Badge, Modal base styles
4. Create global styles for:
   - Focus indicators (ring on all interactive elements)
   - High-contrast mode activation
   - Print styles

**Deliverables**:
- `app/globals.css` with all design tokens
- `tailwind.config.ts` with custom configuration
- `postcss.config.js` with Tailwind plugin

**Acceptance Criteria**:
- Color variables accessible in all components
- Focus ring visible on Tab navigation
- High-contrast mode applies correctly
- Responsive scales work (sm:, md:, lg:)

---

### Task 1.4: Reusable UI Component Library

**Objective**: Build foundational UI components used across the app.

**Create Components**:
- `components/ui/Button.tsx` (primary, secondary, danger, outline)
- `components/ui/Input.tsx` (text, email, password with validation states)
- `components/ui/Textarea.tsx` (resizable, with character count)
- `components/ui/Select.tsx` (dropdown with keyboard support)
- `components/ui/Checkbox.tsx` & `Radio.tsx`
- `components/ui/Badge.tsx` (for status, tags)
- `components/ui/Card.tsx` (container with variants)
- `components/ui/Modal.tsx` (dialog with backdrop)
- `components/ui/Toast.tsx` (notifications)
- `components/ui/Spinner.tsx` (loading indicator)
- `components/ui/Skeleton.tsx` (loading placeholder)

**Key Features**:
- ARIA labels and roles
- Keyboard navigation support
- Disabled states
- Loading states
- Error states with messaging
- TypeScript props interface for each

**Deliverables**:
- All components in `components/ui/` with TypeScript
- Storybook setup (optional, for development)
- Usage examples in code comments

**Acceptance Criteria**:
- All components render without errors
- Props interface clear and typed
- Accessibility props present (aria-label, role, aria-describedby)
- Keyboard navigation working for interactive elements

---

### Task 1.5: Landing Page (`/`)

**Objective**: Create high-converting, responsive landing page.

**Sections**:
1. **Header/Navigation**
   - Logo
   - Links: "Find a Guide" (→ /user), "Dashboard" (→ /manufacturer/dashboard if logged in, else /manufacturer/login)
   - "Get Started" CTA button (→ /manufacturer/login)
   - Auth status (if logged in, show user email + logout button)

2. **Hero Section**
   - Headline: "Your Manuals, Simplified"
   - Subheading: "Create accessible, AI-powered product guides in minutes"
   - Hero image (illustration or product mockup)
   - Two CTAs: "Get Started Free" (primary), "View Demo" (secondary)

3. **Trust Section (Stats)**
   - "10,000+ manuals published"
   - "98% accessibility score"
   - "300+ manufacturers"
   - "50+ languages supported"

4. **Feature Cards**
   - **Dashboard**: "Manage all your manuals in one place"
   - **AI Chat**: "Users get instant answers via chat"
   - **QR Integration**: "Print QR codes for instant access"
   - **Analytics**: "Track user engagement and improve content"

5. **Workflow Section**
   - Visual flow: Upload → AI Process → Publish
   - Copy emphasizing ease and speed

6. **Pricing Section**
   - Three tiers: Free, Pro, Enterprise
   - CTA buttons for each

7. **Footer**
   - Links (About, Docs, Privacy, Terms)
   - Copyright

**Technical Requirements**:
- Fully responsive (mobile, tablet, desktop)
- Fast (LCP < 2.5s, CLS < 0.1)
- SEO optimized (meta tags, schema.org)
- No third-party script bloat

**Deliverables**:
- `app/page.tsx` with all sections
- Image assets optimized (WebP, srcset)
- Meta tags in layout

**Acceptance Criteria**:
- Page loads in < 2.5s (LCP)
- Mobile: all sections readable without horizontal scroll
- Tablet/Desktop: multi-column layouts work
- Links route to correct pages
- CTAs visible and prominent

---

### Task 1.6: 404 & Error Pages

**Objective**: Professional error handling pages.

**Create**:
- `app/not-found.tsx` (404 page)
- `app/error.tsx` (500 error boundary)

**Features**:
- Helpful messaging
- Link back to home or previous page
- Consistent design

**Deliverables**:
- Both error pages
- Global error boundary

---

## Detailed Phase 2: Manufacturer Features (Weeks 3-4)

### Task 2.1: Authentication Pages

#### Task 2.1a: Login Page (`/manufacturer/login`)

**Objective**: Secure, user-friendly login with demo credentials hint.

**Components**:
- Email input with validation (required, valid email)
- Password input (required, min 8 chars)
- "Remember me" checkbox (optional)
- Submit button (shows loading spinner during request)
- "Forgot password?" link (placeholder)
- Demo credentials hint box:
  - Shows: demo@brewtech.com / password123
  - Clicking email or password auto-fills the form

**Flow**:
1. User enters credentials
2. Submit → call `/api/auth/sign-in` endpoint
3. On success → store session → redirect to `/manufacturer/dashboard`
4. On error → show error toast

**Deliverables**:
- `app/manufacturer/login/page.tsx`
- `app/api/auth/sign-in/route.ts` (if not handled by Better Auth)
- Form validation logic

**Acceptance Criteria**:
- Form submits and logs in successfully
- Demo credentials work
- Error messages display on failure
- Auto-fill on demo credential click works

---

#### Task 2.1b: Signup Page (Optional for MVP)

**Skip for Phase 1**; prioritize dashboard first.

---

### Task 2.2: Manufacturer Dashboard (`/manufacturer/dashboard`)

**Objective**: Central hub for viewing and managing manuals.

**Layout**:
- **Header**: "My Manuals" + "Create New Manual" CTA button
- **Sidebar** (mobile: hamburger):
  - User profile (email, logout link)
  - Nav items (Dashboard, Analytics, Settings—optional)
- **Main Content**:
  - Grid of manual cards (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
  - Empty state message + CTA if no manuals

**Manual Card**:
- Product name (heading, semibold)
- Status badge (Published [green] / Draft [gray])
- "Last updated: X days ago"
- Three action buttons: Edit, Analytics, Delete
- Hover effect (shadow lift)

**Card Actions**:
- **Edit** → navigate to `/manufacturer/edit/:id`
- **Analytics** → navigate to `/manufacturer/analytics/:id`
- **Delete** → show confirmation modal, then soft-delete from DB

**Data Fetching**:
- Fetch user's manuals via SWR: `GET /api/manuals?status=all`
- Auto-refresh every 30s
- Show loading skeleton while fetching

**Deliverables**:
- `app/manufacturer/dashboard/page.tsx`
- `app/api/manuals/route.ts` (GET endpoint)
- `components/ManualCard.tsx`
- `hooks/useManuals.ts` (SWR hook)

**Acceptance Criteria**:
- Manuals load and display correctly
- Cards are responsive
- Empty state displays
- Edit/Analytics/Delete actions work
- User can create new manual via button

---

### Task 2.3: Manual Editor (`/manufacturer/new` & `/manufacturer/edit/:id`)

#### Architecture: Multi-Step Form

**State Management**:
- Use React Context (`ManualEditorContext`) to manage multi-step form state
- State shape:
  ```typescript
  {
    step: 1 | 2 | 3 | 4,
    formData: {
      productName: string,
      productModel: string,
      brand: string,
      serialNumber: string,
      languages: string[],
      uploadMethod: 'upload' | 'sections',
      uploadedFile?: File,
      sections?: Section[],
      status: 'draft' | 'published'
    }
  }
  ```
- Auto-save to localStorage every change
- Restore from localStorage on page load

---

#### Step 1: Basic Information

**Form Fields**:
- Product Name (required, text)
- Product Model (required, text)
- Brand / Make (required, text)
- Serial Number (optional, text)

**UI**:
- Simple card layout with 4 inputs
- "Next" button (enabled only if all required fields filled)
- "Save as Draft" link (saves to DB, doesn't progress)

**Deliverables**:
- `app/manufacturer/new/page.tsx`
- `app/manufacturer/new/_components/Step1.tsx`

---

#### Step 2: Language Selection

**UI**:
- Grid of 16 language flags + names
- English always pre-selected and disabled
- Checkmark overlay on selected languages
- Counter badge: "X languages selected"
- AI info box: "The following languages will be auto-translated via AI: [list]"

**Deliverables**:
- `app/manufacturer/new/_components/Step2.tsx`
- `components/LanguagePicker.tsx`

---

#### Step 3: Upload or Build Content

**Option A: Upload Manual**
- Drag-and-drop zone or click-to-upload
- Accepted: PDF, Word (doc/docx)
- Max 50 MB
- Progress bar during upload
- File preview with name, size, remove button

**Option B: Build Sections**
- Add/remove/reorder sections
- For each section:
  - Title input
  - Content textarea (resizable)
  - Image uploads (drag-and-drop, grid preview)
  - Video uploads (drag-and-drop, file list)
- "Change method" link to switch to Upload

**Deliverables**:
- `app/manufacturer/new/_components/Step3.tsx`
- `components/FileUpload.tsx` (drag-and-drop)
- `components/ImageGallery.tsx` (thumbnail grid)
- `components/SectionBuilder.tsx` (section management)

---

#### Step 4: Save & Publish

**UI**:
- Status dropdown: "Draft" or "Published"
- "Save Manual" button (primary)
- "Cancel" link (go back to dashboard)

**On Save**:
1. Send POST to `/api/manuals` with form data
2. Show AI Processing overlay:
   - Step 1: Parsing document structure... [spinner]
   - Step 2: Extracting sections and headings... [spinner]
   - Step 3: Generating accessibility metadata... [spinner]
   - Step 4: Building AI knowledge base... [spinner]
   - Step 5: Optimizing for multimodal delivery... [spinner]
   - Step 6: Finalizing and publishing... [spinner]
3. Progress bar at top (0–100%)
4. On complete: Show "Manual Ready!" success message
5. After 2s: Redirect to `/manufacturer/dashboard`

**AI Processing** (handled by backend API):
- Extract sections from uploaded file (using Google Genai API)
- Generate alt text for images
- Generate captions for videos
- Create translation layer for 16 languages
- Build AI knowledge base from manual content

**Deliverables**:
- `app/manufacturer/new/_components/Step4.tsx`
- `app/api/manuals/route.ts` (POST endpoint)
- `components/AIProcessingOverlay.tsx`

**Acceptance Criteria**:
- Form submits and manual saves
- AI processing overlay displays all 6 steps
- Progress bar animates
- Redirect works on success
- Error handling shows toast on failure

---

### Task 2.4: Edit Manual (`/manufacturer/edit/:id`)

**Objective**: Allow manufacturers to update manual content.

**Implementation**:
- Reuse editor steps from `/manufacturer/new`
- On page load: fetch existing manual data via `GET /api/manuals/:id`
- Pre-populate form with existing data
- On save: PUT to `/api/manuals/:id` instead of POST
- Same AI Processing overlay on save

**Deliverables**:
- `app/manufacturer/edit/[id]/page.tsx`
- Route handler `PUT /api/manuals/:id`

---

### Task 2.5: Analytics Page (`/manufacturer/analytics/:id`)

**Objective**: Provide insights into manual usage.

**Components**:
1. **Header**: Manual name + back link
2. **KPI Cards** (grid, responsive):
   - Total Views (large number)
   - Active Users (30 days)
   - Average Time Spent (in minutes)
   - Each card shows trend (↑ +12% from last month)

3. **Charts**:
   - **Views Over Time** (line chart):
     - X-axis: dates (last 7 days)
     - Y-axis: views
     - Emerald line
     - Hover tooltip shows exact count and date
   - **Top AI Support Queries** (horizontal bar chart):
     - Y-axis: query text (truncated if long)
     - X-axis: count
     - Top 5 queries

4. **Download**: "Export as CSV" button (optional enhancement)

**Data Fetching**:
- GET `/api/manuals/:id/analytics` → returns KPI + chart data
- SWR hook for auto-refresh

**Deliverables**:
- `app/manufacturer/analytics/[id]/page.tsx`
- `app/api/manuals/[id]/analytics/route.ts`
- `components/KPICard.tsx`
- `components/LineChart.tsx` (using Recharts)
- `components/BarChart.tsx` (using Recharts)

**Acceptance Criteria**:
- KPI cards display with correct numbers
- Charts render with data
- Responsive on mobile/tablet/desktop
- Hover tooltips work on charts

---

## Detailed Phase 3: End User Features (Weeks 5-6)

### Task 3.1: End User Portal (`/user`)

**Objective**: Entry point for end users to search for manuals.

**Sections**:
1. **Header**: "Find Your Guide"
2. **QR Code Demo**:
   - Large QR code image (static, linked to demo manual)
   - Below: "Simulate QR Scan" button
   - Button action: navigate to `/manual/demo-qr-123`

3. **Divider**: Horizontal line

4. **Search Form**:
   - "Or search manually:"
   - Make dropdown (manufacturer names, searchable)
   - Model text input
   - Serial Number text input
   - Search button (disabled until all 3 filled)
   - On submit: navigate to `/manual/:id` with matching manual

**Deliverables**:
- `app/user/page.tsx`
- `components/QRCodeDisplay.tsx`
- `components/ManualSearchForm.tsx`

**Acceptance Criteria**:
- QR image displays
- "Simulate QR Scan" navigates to demo manual
- Search form validation works
- Search submits and loads manual

---

### Task 3.2: Manual Welcome Screen (`/manual/:id`)

**Objective**: Landing screen before viewing manual content.

**Layout**:
- Centered card with:
  - Badge: "Product Manual"
  - Product name (h1)
  - Manufacturer name
  - Language picker (16 languages, flags)

- **Mode Selection** (4 cards below):
  1. **Text with Images**: "Step-by-step text with inline images"
  2. **Infographic**: "Full-screen visual overview"
  3. **Video**: "Guided video walkthroughs"
  4. **AI Chat**: "Ask questions, get instant answers"

- **Download Button** (below cards):
  - Dropdown: PDF / DOCX
  - On select: trigger download

**State**:
- Clicking a mode → navigate to `/manual/:id?mode=text|infographic|video|chat`
- Language picker → stay on welcome screen, update selected language state

**Deliverables**:
- `app/manual/[id]/page.tsx` (welcome screen)
- `components/ModeSelector.tsx`
- `components/LanguagePicker.tsx` (reused, adjusted)

---

### Task 3.3: Text with Images Mode

**Objective**: Side-by-side text and images reading experience.

**Layout**:
- **Desktop** (md+): Sidebar (left, 250px) + Content (right, flex-1)
- **Mobile**: Hamburger menu → offcanvas sidebar

**Sidebar**:
- Section list (all sections clickable)
- Active section highlighted (emerald background)
- Section titles truncated if long
- Collapse/expand on mobile

**Content Area**:
- Section title (h2)
- Section image (max 45vh height, responsive width, object-cover)
- Section text (justified, line-height 1.6)
- Previous / Next section buttons at bottom
- Font size controls (A−/A+): 12px–32px
- TTS toggle in header

**Header Controls**:
- Language picker
- TTS toggle
- Font size (A−/A+)
- Contrast (toggle)
- Download button

**TTS Implementation**:
- Use Web Speech API (`SpeechSynthesisUtterance`)
- Play button in header when on text mode
- Icon changes (speaker icon → muted icon)
- Stop button when playing
- Auto-speak when toggled on

**Deliverables**:
- `app/manual/[id]/layout.tsx` (wrapper with header controls)
- `app/manual/[id]/text/page.tsx`
- `components/ManualSidebar.tsx`
- `components/AccessibilityControls.tsx`
- `hooks/useTTS.ts` (TTS logic)
- `hooks/useFontSize.ts` (font size state)

**Acceptance Criteria**:
- Sidebar displays all sections
- Clicking section updates content
- Images display correctly
- Text is readable with adjustable font size
- TTS plays audio correctly
- Previous/Next navigation works

---

### Task 3.4: Infographic Mode

**Objective**: Full-screen immersive infographic viewing.

**Layout**:
- Slim title bar: "Product name" + "Visual product overview"
- Full infographic image below (object-contain, fills available height)
- No sidebar (immersive)
- Responsive: scales on mobile, tablet, desktop

**Controls**:
- Header controls still visible:
  - Language picker
  - Font size (A−/A+) — affects title/labels only
  - Contrast (toggle)
  - Download button

**Image Optimization**:
- Large image, lazy load with blur placeholder
- Responsive srcset for different screen sizes

**Deliverables**:
- `app/manual/[id]/infographic/page.tsx`
- Image optimization in layout

**Acceptance Criteria**:
- Infographic displays fullscreen
- Scales responsive on all devices
- No horizontal scrolling needed

---

### Task 3.5: Video Mode

**Objective**: Video-based guide with section navigation.

**Layout**:
- **Desktop**: Video player (left, flex-1) + Section thumbnails (right, 200px, scrollable)
- **Mobile**: Video player (full width) + Section thumbnails (horizontal scroll below)

**Video Player**:
- HTML5 `<video>` element or use Vercel Blob optimized player
- Controls: play, pause, volume, fullscreen, progress bar
- Autoplay on section switch
- Audio description transcript below player (in emerald callout)

**Section Thumbnails**:
- Each thumbnail shows:
  - Video frame preview image
  - Section title
  - Play icon overlay (triangle)
  - Click to switch main player to that video
- Active thumbnail: emerald border + ▶ badge

**Responsive**:
- Desktop: side-by-side layout
- Mobile: stacked with horizontal scroll for thumbnails

**Deliverables**:
- `app/manual/[id]/video/page.tsx`
- `components/VideoPlayer.tsx`
- `components/SectionThumbnails.tsx`

**Acceptance Criteria**:
- Video plays correctly
- Clicking thumbnail switches video
- Audio description displays
- Responsive layout works on mobile/desktop
- Autoplay on mode entry

---

### Task 3.6: AI Chat Mode

**Objective**: Interactive Q&A with AI, voice input/output support.

**Layout**:
- Chat header:
  - AI assistant name ("ClearGuide Assistant")
  - Live status ("Ready", "Listening…", "Processing…")
  - Audio toggle (🔊/🔇)
- Chat message list (scrollable):
  - User messages (right-aligned, blue bubble)
  - AI messages (left-aligned, gray bubble)
  - Typing animation while AI responds
- Input bar:
  - Mic button (left): toggles red while listening
  - Text input (middle): placeholder "Ask a question…"
  - Send button (right)
- During voice recording: "Listening — tap mic to stop" pill in message list

**Voice Implementation**:
- **Voice Input**: Web Speech API (`webkitSpeechRecognition` with fallback)
  - Mic button pressed → start recording
  - Mic button pressed again or auto-stop after silence → stop recording and submit
  - Red color while listening, normal color when idle
- **Voice Output**: Web Speech API (`SpeechSynthesisUtterance`)
  - If audio toggle ON → speak AI response aloud
  - Respect audio toggle state

**Chat Logic**:
- User submits (text or voice) → POST to `/api/chat`
- AI response streams back (use streaming if supported)
- Show typing animation while waiting
- Append AI message to chat
- If audio ON → speak response

**Session Persistence**:
- Store chat history in localStorage per manual_id
- Persist across page refreshes
- (Optional: sync to DB for analytics)

**Deliverables**:
- `app/manual/[id]/chat/page.tsx`
- `components/ChatContainer.tsx`
- `components/ChatMessage.tsx`
- `components/ChatInput.tsx`
- `app/api/chat/route.ts` (POST endpoint)
- `hooks/useVoiceInput.ts` (Web Speech API wrapper)
- `hooks/useTTS.ts` (already created, reuse)

**Acceptance Criteria**:
- Chat messages display correctly
- Voice input works (mic button records and stops)
- Voice output plays if audio toggle ON
- Text input submits and displays in chat
- AI responses appear with typing animation
- Chat persists on page reload

---

### Task 3.7: Accessibility Controls (Header, all modes)

**Objective**: Persistent header with accessibility options.

**Controls** (all modes):
1. **Language Picker**: 16 languages (flags + names)
   - Current language highlighted
   - On select: reload manual in that language
   - Banner appears: "Showing AI-translated content in 🇫🇷 French"
   - "Switch to English" quick link

2. **TTS Toggle** (text mode only):
   - Speaker icon
   - Click: toggle text-to-speech on/off

3. **Font Size** (A−/A+):
   - Decrease: 12px
   - Current: 16px–32px (configurable)
   - Increase: 32px

4. **Contrast Toggle**:
   - Toggle between normal and high-contrast (black/yellow)
   - High-contrast: entire UI inverted (background black, text yellow, borders/accents yellow)

5. **Download**:
   - Button with dropdown: PDF / DOCX
   - On select: fetch/generate and download

**Implementation**:
- Context or localStorage to persist accessibility preferences across modes
- Apply font size via CSS custom property: `--font-size`
- Apply contrast via class: `high-contrast` on `<html>`

**Deliverables**:
- `components/AccessibilityControls.tsx`
- Context: `AccessibilityContext.ts`
- Hooks: `useAccessibility.ts`
- Styles for high-contrast mode in `globals.css`

**Acceptance Criteria**:
- Language picker works, banner shows on switch
- TTS toggle works (text mode)
- Font size controls adjust text size
- Contrast toggle inverts UI correctly
- Preferences persist across modes and refreshes
- Download generates file

---

## Detailed Phase 4: Advanced Features (Week 7)

### Task 4.1: AI Integration

**Objective**: Google Genai API for document parsing, translation, chat.

**Endpoints**:
1. **POST `/api/manuals`**: On save, call AI to:
   - Parse PDF/document structure (extract sections)
   - Generate alt text for images
   - Create captions for videos
   - Build knowledge base from manual content
   - Translate to 16 languages

2. **POST `/api/chat`**: User message → AI context (manual knowledge base) → AI response

**Implementation**:
```typescript
// lib/ai.ts
import { generateText } from '@ai-sdk/genai';

export async function parseManualContent(file: File) {
  // Extract text, structure, images, videos
}

export async function translateContent(text: string, language: string) {
  // Translate text to target language
}

export async function answerQuestion(question: string, manualContext: string) {
  // Answer based on manual knowledge
}
```

**Error Handling**:
- Rate limiting: show user message "Please try again later"
- API errors: log and return user-friendly error
- Fallback: pre-written responses if API unavailable

**Deliverables**:
- `lib/ai.ts` with AI functions
- API endpoints (`/api/manuals`, `/api/chat`) with AI calls

---

### Task 4.2: File Storage via Vercel Blob

**Objective**: Store PDF, images, videos securely.

**Implementation**:
```typescript
// lib/blob.ts
import { put } from '@vercel/blob';

export async function uploadFile(file: File, folder: string) {
  const blob = await put(`${folder}/${file.name}`, file, {
    access: 'public', // or 'private' depending on use case
  });
  return blob.url;
}
```

**Use Cases**:
- Uploaded PDFs for manuals
- Section images
- Section videos
- Downloaded exports (PDF/DOCX)

**Deliverables**:
- `lib/blob.ts` with upload/download functions
- Integration in manual editor (file uploads)

---

### Task 4.3: Email Notifications (Optional, Phase 2)

**Skip for Phase 1**; implement later if needed.

---

## Detailed Phase 5: Polish & Optimization (Week 8)

### Task 5.1: Performance Optimization

**Target Metrics**:
- LCP: < 2.5s
- FCP: < 1.5s
- CLS: < 0.1
- INP: < 200ms

**Optimizations**:
1. **Image Optimization**:
   - Use `next/image` for all images
   - Generate WebP and srcset for responsive sizing
   - Lazy load below-the-fold images

2. **Code Splitting**:
   - Dynamic imports for heavy components (charts, video player)
   - Route-based code splitting (already done by Next.js)

3. **Caching**:
   - ISR for manual pages (revalidate every 1 hour)
   - SWR for dashboard/analytics (30s stale-while-revalidate)
   - Browser caching headers for static assets

4. **Database Queries**:
   - Add indexes on `manufacturer_id`, `status`, `manual_id`
   - Use selective queries (only fetch needed columns)
   - Pagination for large lists

5. **Bundle Size**:
   - Tree-shake unused dependencies
   - Check bundle size: `next/stats`

**Deliverables**:
- `next.config.ts` with optimization settings
- Database indexes
- Performance monitoring setup

---

### Task 5.2: Accessibility Audit (WCAG 2.1 AA)

**Checklist**:
- [ ] Semantic HTML (header, main, section, article, nav)
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Focus indicators visible (outline or ring)
- [ ] Color contrast > 4.5:1 for text (use axe DevTools)
- [ ] High-contrast mode works
- [ ] Form labels linked to inputs (htmlFor)
- [ ] Error messages associated (aria-describedby)
- [ ] Screen reader announcements (aria-live)
- [ ] Alt text on all images
- [ ] Video captions and audio descriptions
- [ ] Mobile touch targets ≥ 44×44px

**Tools**:
- axe DevTools (browser extension)
- WAVE (browser extension)
- Lighthouse (in Chrome DevTools)
- Manual testing with screen reader (NVDA, JAWS, VoiceOver)

**Deliverables**:
- Accessibility test report
- Fixes for any issues found

---

### Task 5.3: Responsive Design Testing

**Devices to Test**:
- Mobile: 375px (iPhone SE), 390px (iPhone 14), 411px (Android)
- Tablet: 768px (iPad), 820px (iPad Pro)
- Desktop: 1024px, 1280px, 1920px

**Testing**:
- [ ] No horizontal scrolling on mobile
- [ ] Text readable without zoom
- [ ] Touch targets appropriately sized
- [ ] Orientation changes (portrait ↔ landscape)
- [ ] Images scale correctly
- [ ] Navigation accessible on mobile (hamburger menu works)

**Tools**:
- Chrome DevTools (device emulation)
- Physical devices
- BrowserStack (if needed)

---

### Task 5.4: Error Handling & Validation

**Form Validation**:
- Client-side validation (immediate feedback)
- Server-side validation (security)
- Clear error messages per field

**API Error Handling**:
- 4xx errors: user-friendly toast
- 5xx errors: generic "Something went wrong" + error ID for support

**Fallback States**:
- Loading state (skeleton or spinner)
- Error state (retry button)
- Empty state (helpful message + CTA)

**Deliverables**:
- Validation utilities
- Error boundary components

---

### Task 5.5: Security

**Measures**:
- CSRF tokens on forms (Better Auth handles)
- Input sanitization (sanitize-html for user content)
- SQL injection prevention (ORM parameterizes queries)
- Rate limiting on API endpoints (optional, via Upstash)
- Environment variable security (no secrets in client code)

**Deliverables**:
- Security audit checklist
- Rate limiting setup (if applicable)

---

## Detailed Phase 6: Deployment & DevOps (Week 8)

### Task 6.1: Vercel Deployment

**Setup**:
1. Connect GitHub repo to Vercel
2. Configure environment variables:
   - `DATABASE_URL` (Neon)
   - `GOOGLE_GENAI_API_KEY` (AI)
   - `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
   - Others as needed
3. Set build command: `pnpm run build`
4. Set start command: `pnpm start`
5. Enable Preview Deployments (PRs)
6. Custom domain configuration

**Deliverables**:
- Vercel project linked
- All env vars configured
- Automatic deployments on push

---

### Task 6.2: Monitoring & Analytics

**Error Tracking**:
- Sentry integration (optional, for error monitoring)

**User Analytics**:
- PostHog (optional, for engagement metrics)

**Performance Monitoring**:
- Web Vitals via Vercel Analytics
- Lighthouse CI (optional)

**Deliverables**:
- Error tracking dashboard
- Analytics dashboard

---

### Task 6.3: Documentation

**README**:
- Project overview
- Tech stack
- Setup instructions
- Environment variables
- Development commands

**API Documentation**:
- List of endpoints
- Request/response formats
- Example requests

**Component Documentation**:
- Component library overview
- Usage examples (JSDoc comments)

**Deployment Guide**:
- Vercel setup steps
- Environment variables
- Custom domain setup

**Deliverables**:
- README.md updated
- API_DOCS.md
- DEPLOYMENT.md

---

## Quick Prioritization Guide

**MVP (Must-Have) for Launch**:
1. Landing page (landing)
2. Login & authentication
3. Manufacturer dashboard
4. Manual editor (basic)
5. Manual welcome screen
6. Text with Images mode
7. Analytics page (basic)

**Phase 2 Enhancements**:
- AI chat mode
- Video mode
- Infographic mode
- Advanced analytics
- Email notifications

**Phase 3 (Future)**:
- Mobile app (React Native)
- Multi-user teams
- Advanced analytics dashboard
- Community features

---

## Success Metrics

- **Launch**: All MVP features working
- **Performance**: LCP < 2.5s, CLS < 0.1 on all pages
- **Accessibility**: WCAG 2.1 AA compliance
- **Mobile**: Perfect responsiveness on 375px–1920px
- **User Engagement**: >80% mode completion rate
- **AI Quality**: Translation accuracy >95%, chat relevance >85%
- **Uptime**: 99.5%+ availability

---

*Document Last Updated: June 2026*

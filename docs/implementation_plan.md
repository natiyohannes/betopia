# Implementation Plan - Betoch Property Listing Platform

This plan outlines the steps to build a premium property listing platform with Telebirr integration, user dashboards, and an admin panel.

## Proposed Changes

### Database & Backend (Supabase)

#### [MODIFY] [schema.sql](file:///Users/macbookpro2015/test.py/betoch/supabase/schema.sql)
- Ensure all required columns (from user request) are present.
- Added `pending_payment` and `pending_approval` to `listing_status`.
- Added `property_type` enum.

#### [MODIFY] [seed_data.sql](file:///Users/macbookpro2015/test.py/betoch/supabase/seed_data.sql)
- Update plans to match Telebirr pricing requirements.

---

### Frontend - Property Management

#### [MODIFY] [create-listing/page.tsx](file:///Users/macbookpro2015/test.py/betoch/app/dashboard/create-listing/page.tsx)
- Enhance the form to include all fields: Size (sqm), Floor number, Furnished status, Street, and detailed description.
- Implement draft saving vs publishing flow.

#### [MODIFY] [listings/[id]/page.tsx](file:///Users/macbookpro2015/test.py/betoch/app/listings/%5Bid%5D/page.tsx)
- Ensure all property details are displayed beautifully.
- Add contact owner button/modal.

---

### Frontend - Payment (Telebirr Integration)

#### [NEW] [telebirr.ts](file:///Users/macbookpro2015/test.py/betoch/lib/telebirr.ts)
- Helper for Telebirr payment simulation/integration.

#### [MODIFY] [payment/page.tsx](file:///Users/macbookpro2015/test.py/betoch/app/dashboard/payment/page.tsx)
- Implement plan selection.
- Implement "Redirect to Telebirr" flow (simulated if no keys).
- Handle payment confirmation and auto-publishing.

---

### Dashboard & Admin

#### [MODIFY] [dashboard/page.tsx](file:///Users/macbookpro2015/test.py/betoch/app/dashboard/page.tsx)
- Organize into "Active", "Drafts", "Expired".
- Add payment history section.

#### [MODIFY] [admin/page.tsx](file:///Users/macbookpro2015/test.py/betoch/app/admin/page.tsx)
- Implement listing approval queue.
- User management table.

## Verification Plan

### Automated Tests
- Terminal SQL execution to verify schema integrity.
- Manual testing of the "Create -> Pay -> Publish" flow.

### Manual Verification
- Verify search filters work as expected.
- Check mobile responsiveness of the listing cards and dashboard.
- Verify that a non-paid listing is NOT visible on the public home page.

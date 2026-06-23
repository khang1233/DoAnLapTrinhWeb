# Slidify Coding Instructions

This repository contains `Slidify`, a slide-design web application inspired by Canva.

## Actual Project Root
The actual ASP.NET Core MVC app is in:
- `DoAnLtWeb/`

If the workspace root contains both a solution file and a nested project folder with the same name, always treat the nested `DoAnLtWeb/` folder as the application root for code changes.

## Product Goal
Build a Canva-like slide design app where users can:
- choose ready-made templates
- edit text directly
- replace images inside existing layouts
- add many kinds of design components
- upgrade to VIP for premium templates and advanced components

## Required Tech Stack
- ASP.NET Core MVC
- Entity Framework Core
- ASP.NET Core Identity
- Google Authentication
- Fabric.js for the slide editor

## Existing Context
- The project was originally using custom auth and is being migrated to ASP.NET Core Identity
- The `Users` table is intended to be reused with Identity
- Identity and Google login wiring has already started
- The editor already has template support and built-in templates inspired by `hugohe3/ppt-master`
- The editor must keep templates editable, not flattened into static images

## Current Priority
Continue implementing the unfinished product with these features:

### 1. VIP Templates
- Premium templates must be visible to free users but locked
- Templates with more than 10 slides should be VIP
- Some especially polished templates should also be VIP
- Backend must enforce VIP restrictions, not just frontend

### 2. Canva-like Component Library
Expand the editor with a rich component library:
- shapes
- badges
- quote blocks
- timelines
- stat cards
- CTA blocks
- social/logo chips
- tables
- infographic blocks
- chart/info blocks
- dividers
- image frames
- layout grids
- mockup blocks
- icon cards
- decorative stickers

Requirements:
- components must be insertable into Fabric canvas
- components must remain editable after insertion
- some advanced components should be VIP-only
- organize the UI clearly by category

### 3. VIP Upgrade Experience
Create a polished pricing/upgrade experience with:
- Free plan
- VIP plan
- clear benefits list
- premium-looking pricing cards
- CTA to upgrade when users click a locked feature

### 4. VietQR Payment Flow
Implement a VIP payment flow using VietQR:
- Bank: MBBank
- Account number: `1111122005`
- Account name: `Tran Minh Khang`

Requirements:
- every payment must have a unique transfer content code
- create and store payment records in database
- show a QR payment screen
- if no real bank webhook/API exists, do NOT fake automatic bank confirmation
- instead implement the most honest complete flow possible:
  - pending payment status
  - payment instructions
  - status page / polling
  - internal confirmation path for admin or manual confirmation
- once payment is confirmed, user becomes VIP

### 5. Data / Backend
Implement or complete:
- VIP fields on user:
  - `IsVip`
  - `VipExpiresAt`
  - `VipPlanName`
- `PaymentTransaction` entity and database storage
- backend authorization checks for VIP templates and VIP components
- proper migrations when needed

## Working Style
- Read the codebase first before editing
- Continue the existing implementation instead of replacing it blindly
- Prefer direct code changes over long analysis
- Preserve existing work unless there is a strong reason to refactor
- After changes, build and validate main flows if possible
- If environment limitations prevent full validation, explain that clearly

## Important Files To Read First
- `DoAnLtWeb/Program.cs`
- `DoAnLtWeb/Data/AppDbContext.cs`
- `DoAnLtWeb/Data/DbInitializer.cs`
- `DoAnLtWeb/Controllers/AccountController.cs`
- `DoAnLtWeb/Controllers/SlideController.cs`
- `DoAnLtWeb/Models/User.cs`
- `DoAnLtWeb/Models/Presentation.cs`
- `DoAnLtWeb/Views/Slide/Edit.cshtml`
- `DoAnLtWeb/wwwroot/js/slide-editor.js`

## Task Execution Rule
Do not stop at analysis. Implement the requested features directly in code:
1. VIP templates
2. VIP components
3. pricing and upgrade UI
4. VietQR payment flow
5. payment transaction persistence
6. VIP upgrade state on users
7. expanded Canva-like component library
8. migrations if required
9. build/verification if possible
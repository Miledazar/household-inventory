# Household Inventory Tracker

Keeping track of what's actually in your pantry, what it cost, and what's about to go bad is easy to say and annoying to do consistently. Most people either don't bother, or keep a spreadsheet that's accurate for about a week before it drifts from reality. This is a full-stack app that tracks it properly.

## Who it's for

Built around household use, but it works just as well for a small office breakroom - coffee, water, cleaning supplies, printer paper. Same problem either way: someone needs to know what's running low and what to buy next, without manually checking a shelf.

## What it actually does

- Add items with a category, brand (optional), and a unit of measure - and units know whether they're allowed to be fractional. You can have 2.5kg of rice. You can't have 2.5 cans of Coke.
- Log Purchases, Consumption, Adjustments, and Waste as real transactions, not just edits to a number
- Every purchase creates its own "batch" with its own price and expiry date, and consuming pulls from the oldest batch first automatically - or you can pick a specific one yourself
- Grocery lists that build themselves from whatever's below its threshold, and turn straight into a real transaction once you're done shopping
- A dashboard: what's low, what's expiring or already expired, and where your money's actually going by category

## How stock tracking works

The first version stored a single `CurrentQuantity` field on each item, incremented on purchase and decremented on use. It broke down quickly: buying the same item twice at two different prices, or with two different expiry dates, can't be represented by one number.

Stock is instead **derived**, not stored directly. Every purchase creates a batch — a record of exactly how much was bought, at what price, and when it expires:

- Buying 5 cans of tomatoes creates one batch: 5 remaining, at that price, with that expiry date.
- Consuming stock draws from the oldest batch first (FIFO) by default, or from a specific batch if the user selects one explicitly.
- Once a batch reaches zero remaining, it stops counting as available stock — but the record isn't deleted, so historical cost and expiry data are preserved.

This adds more moving parts than a single counter, but it removes an entire class of bug: stock can never silently drift out of sync with what actually happened, because there's nothing to drift — the number is always recalculated from the transaction record itself. Cost-per-unit tracking and expiry alerts fall out of this model at no extra cost, since the data they need is already there.

## Stack

**Backend:** ASP.NET Core Web API, Dapper, SQL Server, JWT auth
**Frontend:** React, TypeScript, MUI, Recharts

## What's next

- **Receipt scanning** - photograph a receipt, have it pull out the item names/prices, and pre-fill a transaction instead of typing everything by hand.

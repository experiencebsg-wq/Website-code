
# Enhance Shop Page with Full Product Categories and Improved Filters

## Overview

Based on your business questionnaire responses, I'll add more products to match your complete product offerings, enhance the shop page with better filtering options including subcategory filters for Home Fragrances, and ensure all product images load correctly.

---

## Changes Summary

### 1. Expand Mock Product Data

Add more products to cover all your product categories:

| Category | Current Products | Products to Add |
|----------|-----------------|-----------------|
| Body Fragrance (Male) | 2 | +3 more (5 total) |
| Body Fragrance (Female) | 2 | +3 more (5 total) |
| Home & Space Fragrances | 4 | +4 more (8 total) |

**New Products to Add:**

**Male Fragrances:**
- Sovereign Oud - Rich oud with leather and spices
- Azure Coast - Fresh marine with citrus notes  
- Noble Sage - Aromatic sage with woody undertones

**Female Fragrances:**
- Rose Velours - Romantic rose with velvet musk
- Orchid Mystique - Exotic orchid with vanilla
- Golden Amber - Warm amber with floral notes

**Home Fragrances:**
- Lavender Dreams (Diffuser) - Calming lavender blend
- Cedar & Moss (Candle) - Earthy forest scent
- Fresh Linen (Fabric Fragrance) - Clean cotton scent
- Citrus Grove (Auto Freshener) - Energizing citrus

### 2. Add Subcategory Filter for Home Fragrances

Add a dedicated filter to let customers browse by product type:

```text
Current Filters:
[Category] [Price] [Sort]

Enhanced Filters:
[Category] [Product Type] [Price] [Sort]
```

**Product Type options (shown when Home Fragrance selected):**
- All Types
- Diffusers
- Scented Candles
- Auto Fresheners
- Fabric Fragrances

### 3. Update Product Type in API

Extend the Product interface to properly use subcategory:

```text
subcategory options:
- 'diffuser'
- 'candle' 
- 'auto-freshener'
- 'fabric-fragrance'
```

### 4. Improve Image Loading

Ensure images load correctly by:
- Using the existing images in `public/assets/products/`
- Adding fallback to placeholder for new products
- Reusing existing product images for new mock products until real images are uploaded

### 5. Add "Stock Status" Filter

Add filter option for in-stock items only:
- Show All
- In Stock Only

### 6. Active Filter Tags

Show small tags below the filter bar indicating which filters are active with ability to remove individual filters.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/services/api.ts` | Add 10 new mock products with variety |
| `src/pages/Shop.tsx` | Add subcategory filter, stock filter, and active filter tags |

---

## Implementation Details

### New Products Structure

```text
Male Fragrances (5):
1. Midnight Velvet (existing)
2. Royal Noir (existing)
3. Sovereign Oud (NEW)
4. Azure Coast (NEW)
5. Noble Sage (NEW)

Female Fragrances (5):
1. Lumiere D'Or (existing)
2. Fleur Eternelle (existing)
3. Rose Velours (NEW)
4. Orchid Mystique (NEW)
5. Golden Amber (NEW)

Home Fragrances (8):
Diffusers:
- Casa Serena (existing)
- Lavender Dreams (NEW)

Candles:
- Ambre Noir Candle (existing)
- Cedar & Moss (NEW)

Auto Fresheners:
- Ocean Breeze Auto (existing)
- Citrus Grove (NEW)

Fabric Fragrances:
- Silk Dreams (existing)
- Fresh Linen (NEW)
```

### Enhanced Filter UI Layout

```text
+----------------------------------------------------------+
| [Search Input........................] [Filters Button]   |
+----------------------------------------------------------+

Desktop:
+----------------------------------------------------------+
| [Category v] [Product Type v] [Price v] [Stock v] [Sort v] [Clear]
+----------------------------------------------------------+

Active Filters (shown when filters applied):
+----------------------------------------------------------+
| Home Fragrance [x]  |  Candles [x]  |  In Stock [x]      |
+----------------------------------------------------------+
```

### Subcategory Filter Logic

- Only shows "Product Type" dropdown when "Home & Space Fragrances" category is selected
- Automatically clears product type when switching to a different category
- URL-based filter state preservation (e.g., `/shop?category=home-fragrance&type=candle`)

---

## Technical Implementation

### API Service Updates
- Add 10 new products with proper pricing in NGN and USD
- Assign appropriate subcategories to all Home Fragrance products
- Set variety of stock statuses (some low stock, some out of stock)
- Mark some new products as "featured" and "new"

### Shop Page Filter Enhancements
- Add `subcategory` state from URL params
- Add `stockStatus` filter ('all' | 'inStock')
- Create subcategory dropdown that appears conditionally
- Add filter tags component for active filters
- Update filtering logic in useMemo

### Responsive Design
- All new filters work on both desktop and mobile
- Mobile filter panel updated to include new options
- Filter tags wrap properly on smaller screens

# ProductLookupService - Angular Service Guide

## Overview

An efficient Angular service for **O(1) product lookup** with **enriched criteria data**. Returns complete addon tree information, including all labels and configuration options.

## Setup

### 1. Install Service in Module

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import ProductLookupService from './services/productLookup';

@NgModule({
  providers: [ProductLookupService]
})
export class AppModule {}
```

### 2. Initialize in Component

```typescript
import { Component, OnInit } from '@angular/core';
import ProductLookupService from './services/productLookup';
import * as jsonData from './json.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(private productLookup: ProductLookupService) {}

  ngOnInit(): void {
    this.productLookup.initialize(jsonData);
  }
}
```

## API Methods

### 1. `getProductIdByCriteria(criteria)` - O(1)

Get product ID from selection criteria.

```typescript
const criteria = {
  vendor: 'fortigate',
  cpu: '4-cpu',
  license: 'utp'
};

const productId = this.productLookup.getProductIdByCriteria(criteria);
// Returns: "8800190627841"
```

### 2. `getCriteriaByProductId(productId)` - O(log n) - **ENRICHED**

Get complete product details with full tree information.

```typescript
const enriched = this.productLookup.getCriteriaByProductId('8800190627841');

console.log(enriched);
// Returns:
// {
//   productId: "8800190627841",
//   addonType: "firewall",
//   matchCriteria: {
//     vendor: "fortigate",
//     cpu: "4-cpu",
//     license: "utp"
//   },
//   selectedOptions: {
//     vendor: {
//       value: "fortigate",
//       label: "Fortigate",
//       labelAr: "فورتيجيت",
//       children: { ... } // Full tree structure
//     },
//     cpu: {
//       value: "4-cpu",
//       label: "4 CPU",
//       labelAr: "4 معالج",
//       children: { ... }
//     },
//     license: {
//       value: "utp",
//       label: "UTP (Unified Threat Protection)",
//       labelAr: "UTP (الحماية الموحدة من التهديدات)",
//       children: undefined
//     }
//   },
//   addon: {
//     id: "firewall",
//     name: "Firewall",
//     nameAr: "جدار الحماية",
//     maxInstances: 4,
//     itemChoiceKey: "firewall",
//     pricingKey: "VF_VM_FIREWALL",
//     tree: { ... } // Complete tree configuration
//   }
// }
```

### 3. `searchByPartialCriteria(partial)` - O(n) - **ENRICHED**

Search products with incomplete criteria. Returns enriched results.

```typescript
// Find all products for Fortigate vendor
const results = this.productLookup.searchByPartialCriteria({
  vendor: 'fortigate'
});

// Returns array of EnrichedCriteria objects
results.forEach(product => {
  console.log(`Product ID: ${product.productId}`);
  console.log(`Selected Options:`, product.selectedOptions);
  console.log(`Addon Details:`, product.addon);
});
```

### 4. `getAllProducts()` - O(n)

Get all products with criteria.

```typescript
const all = this.productLookup.getAllProducts();
console.log(all);
// Returns: [{id: "...", criteria: {...}}, ...]
```

## Component Example

```typescript
import { Component, OnInit } from '@angular/core';
import ProductLookupService from './services/productLookup';
import * as jsonData from './json.json';

@Component({
  selector: 'app-firewall-config',
  template: `
    <div>
      <label>Vendor:
        <select [(ngModel)]="selectedCriteria.vendor" (change)="updateProduct()">
          <option value="fortigate">Fortigate</option>
          <option value="palo-alto">Palo Alto</option>
        </select>
      </label>

      <label>CPU:
        <select [(ngModel)]="selectedCriteria.cpu" (change)="updateProduct()">
          <option value="2-cpu">2 CPU</option>
          <option value="4-cpu">4 CPU</option>
          <option value="8-cpu">8 CPU</option>
        </select>
      </label>

      <label>License:
        <select [(ngModel)]="selectedCriteria.license" (change)="updateProduct()">
          <option value="atp">ATP</option>
          <option value="utp">UTP</option>
        </select>
      </label>

      <div *ngIf="enrichedProduct" class="product-details">
        <h3>Selected Product</h3>
        <p><strong>Product ID:</strong> {{ enrichedProduct.productId }}</p>
        <p><strong>Addon:</strong> {{ enrichedProduct.addon.name }}</p>

        <h4>Selected Configuration:</h4>
        <ul>
          <li *ngFor="let option of selectedOptionsList">
            <strong>{{ option.label }}</strong> ({{ option.labelAr }})
            <span *ngIf="option.children">
              → {{ option.children.label }}
            </span>
          </li>
        </ul>

        <h4>Pricing Key:</h4>
        <p>{{ enrichedProduct.addon.pricingKey }}</p>
      </div>
    </div>
  `
})
export class FirewallConfigComponent implements OnInit {
  selectedCriteria = {
    vendor: 'fortigate',
    cpu: '2-cpu',
    license: 'atp'
  };

  enrichedProduct: any;
  selectedOptionsList: any[] = [];

  constructor(private productLookup: ProductLookupService) {}

  ngOnInit(): void {
    this.productLookup.initialize(jsonData);
    this.updateProduct();
  }

  updateProduct(): void {
    const productId = this.productLookup.getProductIdByCriteria(
      this.selectedCriteria
    );

    if (productId) {
      this.enrichedProduct =
        this.productLookup.getCriteriaByProductId(productId);

      // Extract selected options for display
      this.selectedOptionsList = Object.values(
        this.enrichedProduct.selectedOptions
      );
    } else {
      this.enrichedProduct = null;
      this.selectedOptionsList = [];
    }
  }
}
```

## Return Type: EnrichedCriteria

```typescript
interface EnrichedCriteria {
  productId: string;              // Product ID
  addonType: string;              // Type of addon (firewall, waf, etc.)
  matchCriteria: MatchCriteria;   // Original criteria {vendor, cpu, license}
  selectedOptions: {              // Full tree option details for each criterion
    [key: string]: TreeOption;    // Includes labels, labelAr, and children
  };
  addon: Addon;                   // Complete addon configuration with tree
}
```

## Key Features

✅ **O(1) Product Lookup** - Instant product ID retrieval  
✅ **Enriched Data** - Returns full tree structure with all details  
✅ **Bilingual Support** - Both English (`label`) and Arabic (`labelAr`)  
✅ **Tree Traversal** - Complete option details including children  
✅ **Partial Search** - Find products with incomplete criteria  
✅ **Angular Injectable** - Dependency injection ready  
✅ **TypeScript Typed** - Full type safety

## Performance

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| `getProductIdByCriteria()` | **O(1)** | Hash map lookup |
| `getCriteriaByProductId()` | **O(log n)** | Tree traversal to leaf |
| `searchByPartialCriteria()` | **O(n)** | Linear scan with matching |
| Initialize | O(n) | One-time setup |

---

## Migration from Previous Version

```typescript
// OLD - Returns only simple criteria
const criteria = this.productLookup.getCriteriaByProductId(productId);
// Returns: {vendor: "fortigate", cpu: "4-cpu", license: "utp"}

// NEW - Returns enriched data with full details
const enriched = this.productLookup.getCriteriaByProductId(productId);
// Returns: {
//   productId: "...",
//   addonType: "firewall",
//   matchCriteria: {...},
//   selectedOptions: {...},  // ← Full tree option details
//   addon: {...}              // ← Complete addon configuration
// }
```

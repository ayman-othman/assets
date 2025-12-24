# ProductLookupService - O(1) Product Lookup

## Overview
Provides efficient **O(1) constant-time** lookups for:
- Finding product IDs by selection criteria
- Finding criteria by product ID

## Installation

### JavaScript
```javascript
const ProductLookupService = require('./productLookup.js');
```

### TypeScript
```typescript
import ProductLookupService from './productLookup.ts';
```

## Usage Examples

### Initialize the Service
```javascript
import jsonData from './json.json';

const lookup = new ProductLookupService(jsonData);
```

### 1. Get Product ID by Criteria (O(1))
```javascript
// Example: Find product ID for Fortigate, 4 CPU, UTP license
const criteria = {
  vendor: "fortigate",
  cpu: "4-cpu",
  license: "utp"
};

const productId = lookup.getProductIdByCriteria(criteria);
console.log(productId); // "8800190627841"
```

### 2. Get Criteria by Product ID (O(1))
```javascript
const productId = "8800190627841";

const criteria = lookup.getCriteriaByProductId(productId);
console.log(criteria);
// Output: { vendor: "fortigate", cpu: "4-cpu", license: "utp" }
```

### 3. Search by Partial Criteria (O(n))
```javascript
// Find all products with Fortigate vendor
const partial = { vendor: "fortigate" };

const results = lookup.searchByPartialCriteria(partial);
console.log(results);
// Returns all Fortigate products
```

### 4. Get All Products
```javascript
const allProducts = lookup.getAllProducts();
console.log(allProducts);
// Output: [
//   { id: "01HE1D78EC698B5C41F4A889", criteria: {...} },
//   { id: "8796158984193", criteria: {...} },
//   { id: "8800190627841", criteria: {...} }
// ]
```

## Time Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| `getProductIdByCriteria()` | **O(1)** | Hash map lookup |
| `getCriteriaByProductId()` | **O(1)** | Hash map lookup |
| `getAllProducts()` | O(n) | n = number of products |
| `searchByPartialCriteria()` | O(n) | Linear scan with matching |
| Initialize | O(n) | One-time setup |

## How It Works

### Internal Structure
```
criteriaToProductId Map:
  Key: "cpu:4-cpu|license:utp|vendor:fortigate"
  Value: "8800190627841"

productIdToCriteria Map:
  Key: "8800190627841"
  Value: {vendor: "fortigate", cpu: "4-cpu", license: "utp"}
```

### Key Generation
- Criteria object is converted to a sorted composite key
- Keys are normalized for consistent lookup
- Format: `"key1:value1|key2:value2|..."`

## React Example

```jsx
import ProductLookupService from './productLookup.ts';
import jsonData from './json.json';

const MyComponent = () => {
  const lookup = useMemo(() => new ProductLookupService(jsonData), []);

  const handleSelectionChange = (selectedCriteria) => {
    // Instant O(1) lookup
    const productId = lookup.getProductIdByCriteria(selectedCriteria);
    
    if (productId) {
      console.log(`Selected product: ${productId}`);
      // Update pricing, availability, etc.
    } else {
      console.log('No product found for this configuration');
    }
  };

  return (
    // Your component JSX
  );
};
```

## Performance Benefits

### Before (Linear Search)
```javascript
// O(n) - must loop through all products
const productId = jsonData.attributes.products.find(p => 
  p.matchCriteria.vendor === criteria.vendor &&
  p.matchCriteria.cpu === criteria.cpu &&
  p.matchCriteria.license === criteria.license
)?.id;
```

### After (Hash Map Lookup)
```javascript
// O(1) - instant lookup
const productId = lookup.getProductIdByCriteria(criteria);
```

**100+ products?** Difference becomes massive! ⚡

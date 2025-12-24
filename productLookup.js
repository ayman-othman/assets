/**
 * Efficient O(1) lookup system for products and criteria
 * Builds maps for quick bidirectional access
 */

class ProductLookupService {
  constructor(jsonData) {
    this.data = jsonData;
    // Map: criteria key -> product ID
    // Key format: "vendor:cpu:license" (concatenated criteria)
    this.criteriaToProductId = new Map();
    
    // Map: product ID -> matchCriteria object
    this.productIdToCriteria = new Map();
    
    this.initialize();
  }

  /**
   * Initialize the lookup maps from products array
   */
  initialize() {
    if (!this.data.attributes.products) return;

    this.data.attributes.products.forEach((product) => {
      const { id, matchCriteria } = product;

      // Store product ID -> criteria mapping
      this.productIdToCriteria.set(id, matchCriteria);

      // Create composite key from criteria
      const criteriaKey = this.generateCriteriaKey(matchCriteria);
      this.criteriaToProductId.set(criteriaKey, id);
    });
  }

  /**
   * Generate a unique key from criteria object
   * @param {Object} criteria - The matchCriteria object
   * @returns {string} - Composite key
   */
  generateCriteriaKey(criteria) {
    // Sort keys for consistent key generation
    const keys = Object.keys(criteria).sort();
    return keys.map((key) => `${key}:${criteria[key]}`).join("|");
  }

  /**
   * Get product ID from criteria
   * O(1) lookup
   * @param {Object} criteria - Selection criteria {vendor, cpu, license, etc.}
   * @returns {string|undefined} - Product ID or undefined if not found
   */
  getProductIdByCriteria(criteria) {
    const key = this.generateCriteriaKey(criteria);
    return this.criteriaToProductId.get(key);
  }

  /**
   * Get criteria object from product ID
   * O(1) lookup
   * @param {string} productId - Product ID
   * @returns {Object|undefined} - matchCriteria object or undefined if not found
   */
  getCriteriaByProductId(productId) {
    return this.productIdToCriteria.get(productId);
  }

  /**
   * Get all products with their IDs and criteria
   * @returns {Array} - Array of {id, criteria}
   */
  getAllProducts() {
    const products = [];
    this.productIdToCriteria.forEach((criteria, id) => {
      products.push({ id, criteria });
    });
    return products;
  }

  /**
   * Search products by partial criteria
   * O(n) - useful when you don't have all criteria
   * @param {Object} partialCriteria - Partial criteria to match
   * @returns {Array} - Array of matching products
   */
  searchByPartialCriteria(partialCriteria) {
    const results = [];
    
    this.productIdToCriteria.forEach((criteria, id) => {
      let matches = true;
      
      // Check if all provided criteria match
      for (const [key, value] of Object.entries(partialCriteria)) {
        if (criteria[key] !== value) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        results.push({ id, criteria });
      }
    });
    
    return results;
  }
}

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductLookupService;
}

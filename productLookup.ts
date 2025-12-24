import { Injectable } from '@angular/core';

interface MatchCriteria {
  [key: string]: string;
}

interface TreeOption {
  value: string;
  label: string;
  labelAr: string;
  children?: TreeNode;
}

interface TreeNode {
  id: string;
  label: string;
  labelAr: string;
  type: string;
  required: boolean;
  options: TreeOption[];
}

interface Addon {
  id: string;
  name: string;
  nameAr: string;
  maxInstances: number;
  itemChoiceKey: string;
  pricingKey: string;
  tree: TreeNode;
}

interface Product {
  id: string;
  addonType: string;
  matchCriteria: MatchCriteria;
}

interface ProductData {
  attributes: {
    controlType: string;
    configGroupName: string;
    addons: Addon[];
    products: Product[];
  };
}

interface EnrichedCriteria {
  productId: string;
  addonType: string;
  matchCriteria: MatchCriteria;
  selectedOptions: {
    [key: string]: TreeOption;
  };
  addon: Addon;
}

@Injectable({
  providedIn: 'root'
})
class ProductLookupService {
  private criteriaToProductId: Map<string, string>;
  private productIdToCriteria: Map<string, MatchCriteria>;
  private addonsMap: Map<string, Addon>;
  private data: ProductData;

  constructor() {
    this.criteriaToProductId = new Map();
    this.productIdToCriteria = new Map();
    this.addonsMap = new Map();
    this.data = null as any;
  }

  initialize(jsonData: ProductData): void {
    this.data = jsonData;

    if (this.data.attributes.addons) {
      this.data.attributes.addons.forEach((addon: Addon) => {
        this.addonsMap.set(addon.id, addon);
      });
    }

    if (this.data.attributes.products) {
      this.data.attributes.products.forEach((product: Product) => {
        const { id, matchCriteria } = product;
        this.productIdToCriteria.set(id, matchCriteria);

        const criteriaKey = this.generateCriteriaKey(matchCriteria);
        this.criteriaToProductId.set(criteriaKey, id);
      });
    }
  }

  private generateCriteriaKey(criteria: MatchCriteria): string {
    const keys = Object.keys(criteria).sort();
    return keys.map((key) => `${key}:${criteria[key]}`).join("|");
  }

  private traverseTree(
    node: TreeNode,
    criteria: MatchCriteria,
    selectedOptions: { [key: string]: TreeOption }
  ): void {
    const criteriaValue = criteria[node.id];
    if (!criteriaValue) return;

    const option = node.options.find((opt) => opt.value === criteriaValue);
    if (option) {
      selectedOptions[node.id] = option;
      if (option.children) {
        this.traverseTree(option.children, criteria, selectedOptions);
      }
    }
  }

  getProductIdByCriteria(criteria: MatchCriteria): string | undefined {
    const key = this.generateCriteriaKey(criteria);
    return this.criteriaToProductId.get(key);
  }

  getCriteriaByProductId(productId: string): EnrichedCriteria | undefined {
    const matchCriteria = this.productIdToCriteria.get(productId);
    if (!matchCriteria) return undefined;

    const product = this.data.attributes.products.find((p) => p.id === productId);
    if (!product) return undefined;

    const addon = this.addonsMap.get(product.addonType);
    if (!addon) return undefined;

    const selectedOptions: { [key: string]: TreeOption } = {};
    this.traverseTree(addon.tree, matchCriteria, selectedOptions);

    return {
      productId,
      addonType: product.addonType,
      matchCriteria,
      selectedOptions,
      addon
    };
  }
}

export default ProductLookupService;
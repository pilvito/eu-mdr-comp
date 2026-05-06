import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface SoftwareItem {
  id: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  softwareItemIds: string[];
}

interface ProductContextType {
  products: Product[];
  softwareItems: SoftwareItem[];
  activeProductId: string | null;
  addProduct: (product: Omit<Product, 'id' | 'softwareItemIds'>) => void;
  addSoftwareItem: (item: Omit<SoftwareItem, 'id'>) => void;
  linkSoftwareItemToProduct: (productId: string, softwareItemId: string) => void;
  unlinkSoftwareItemFromProduct: (productId: string, softwareItemId: string) => void;
  setActiveProduct: (productId: string | null) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('eumdr_products');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [softwareItems, setSoftwareItems] = useState<SoftwareItem[]>(() => {
    const saved = localStorage.getItem('eumdr_softwareItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeProductId, setActiveProductId] = useState<string | null>(() => {
    const saved = localStorage.getItem('eumdr_activeProductId');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('eumdr_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('eumdr_softwareItems', JSON.stringify(softwareItems));
  }, [softwareItems]);

  useEffect(() => {
    localStorage.setItem('eumdr_activeProductId', JSON.stringify(activeProductId));
  }, [activeProductId]);

  const addProduct = (productData: Omit<Product, 'id' | 'softwareItemIds'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      softwareItemIds: [],
    };
    setProducts((prev) => [...prev, newProduct]);
    if (!activeProductId) {
      setActiveProductId(newProduct.id);
    }
  };

  const addSoftwareItem = (itemData: Omit<SoftwareItem, 'id'>) => {
    const newItem: SoftwareItem = {
      ...itemData,
      id: Date.now().toString(),
    };
    setSoftwareItems((prev) => [...prev, newItem]);
  };

  const linkSoftwareItemToProduct = (productId: string, softwareItemId: string) => {
    setProducts((prev) => prev.map((p) => {
      if (p.id === productId && !p.softwareItemIds.includes(softwareItemId)) {
        return { ...p, softwareItemIds: [...p.softwareItemIds, softwareItemId] };
      }
      return p;
    }));
  };

  const unlinkSoftwareItemFromProduct = (productId: string, softwareItemId: string) => {
    setProducts((prev) => prev.map((p) => {
      if (p.id === productId) {
        return { ...p, softwareItemIds: p.softwareItemIds.filter(id => id !== softwareItemId) };
      }
      return p;
    }));
  };

  const setActiveProduct = (productId: string | null) => {
    setActiveProductId(productId);
  };

  return (
    <ProductContext.Provider value={{
      products,
      softwareItems,
      activeProductId,
      addProduct,
      addSoftwareItem,
      linkSoftwareItemToProduct,
      unlinkSoftwareItemFromProduct,
      setActiveProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
};

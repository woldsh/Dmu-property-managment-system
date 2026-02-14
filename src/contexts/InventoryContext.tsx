'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export interface Material {
    id: string;
    materialName: string;
    materialCode: string;
    image: string;
    quantity: number;
    condition: string;
    category: string;
    unit: string;
    materialType: string;
    description?: string;
    remarks?: string;
    storeLocation?: string;
    tags?: string;
    shelfNumber?: string;
}

interface InventoryContextType {
    materials: Material[];
    loading: boolean;
    error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'materials'), orderBy('materialName', 'asc'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const materialList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Material[];

                setMaterials(materialList);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching inventory:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <InventoryContext.Provider value={{ materials, loading, error }}>
            {children}
        </InventoryContext.Provider>
    );
}

export function useInventory() {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
}

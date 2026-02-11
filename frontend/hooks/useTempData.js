// frontend/hooks/useTempData.js
import { create } from 'zustand';

// Store for temporary OCR/Voice data
export const useTempDataStore = create((set) => ({
    pendingTransaction: null,
    setPendingTransaction: (data) => set({ pendingTransaction: data }),
    clearPendingTransaction: () => set({ pendingTransaction: null })
}));

// In TransactionForm component
import { useTempDataStore } from '@/hooks/useTempData';

function TransactionForm() {
    const pendingData = useTempDataStore(state => state.pendingTransaction);
    const clearPendingData = useTempDataStore(state => state.clearPendingTransaction);
    
    useEffect(() => {
        if (pendingData) {
            // Prefill form with OCR/Voice data
            setFormData(pendingData);
            // Keep data even on refresh using localStorage
            localStorage.setItem('pending_transaction', JSON.stringify(pendingData));
            clearPendingData();
        }
    }, [pendingData]);
    
    // On mount, check localStorage
    useEffect(() => {
        const saved = localStorage.getItem('pending_transaction');
        if (saved) {
            setFormData(JSON.parse(saved));
        }
    }, []);
}
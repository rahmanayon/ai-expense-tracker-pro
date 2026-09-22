// __tests__/DashboardFilters.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardFilters from '@/components/Dashboard/DashboardFilters';
import { useTransactions } from '@/hooks/useTransactions';

jest.mock('@/hooks/useTransactions');

describe('DashboardFilters', () => {
    const mockOnFilterChange = jest.fn();
    
    beforeEach(() => {
        useTransactions.mockReturnValue({
            categories: [
                { id: 1, name: 'Groceries', emoji: '🛒' },
                { id: 2, name: 'Transportation', emoji: '🚗' }
            ]
        });
    });

    it('applies date and category filters', async () => {
        render(<DashboardFilters onFilterChange={mockOnFilterChange} />);
        
        // Select a category
        const categorySelect = screen.getByRole('listbox');
        fireEvent.click(categorySelect);
        fireEvent.click(screen.getByText('🛒 Groceries'));
        
        // Click apply
        fireEvent.click(screen.getByText('Apply Filters'));
        
        await waitFor(() => {
            expect(mockOnFilterChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    categories: ['1']
                })
            );
        });
    });
});
// components/Dashboard/DashboardFilters.js
'use client';
import { useState, useEffect } from 'react';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

export default function DashboardFilters({ onFilterChange }) {
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
    };

    const handleApplyFilters = () => {
        onFilterChange({
            startDate: dateRange[0].startDate.toISOString().split('T')[0],
            endDate: dateRange[0].endDate.toISOString().split('T')[0],
            categories: selectedCategories
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Date Range</label>
                    <DateRangePicker
                        ranges={dateRange}
                        onChange={item => setDateRange([item.selection])}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Categories</label>
                    <select 
                        multiple
                        value={selectedCategories}
                        onChange={(e) => setSelectedCategories([...e.target.selectedOptions].map(o => o.value))}
                        className="w-full h-32 border rounded-md p-2"
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.emoji} {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={handleApplyFilters}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
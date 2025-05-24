import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import Header from './Header';

interface Product {
  _id: string;
  itemCode: string;
  itemDescription: string;
  unit: string;
  mrp: number;
  dp: number;
  nlc: number;
  percentage: number;
}

const UserLayout = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [uniqueUnits, setUniqueUnits] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const units = [...new Set(products.map(product => product.unit))];
      setUniqueUnits(units.sort());
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://balajii-electronices.onrender.com/api/products');
      setProducts(response.data.data);
      setError('');
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleUnitFilter = (unit: string) => {
    setSelectedUnit(unit);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.itemDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit === 'all' || product.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  const getUnitCount = (unit: string) => {
    return products.filter(product => product.unit === unit).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-3 sm:p-6 border-b border-gray-200">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4">Products List</h1>

            {/* Search Section */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by item code or description..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Unit Filter Buttons */}
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  onClick={() => handleUnitFilter('all')}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                    selectedUnit === 'all' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({products.length})
                </button>
                {uniqueUnits.map(unit => (
                  <button
                    key={unit}
                    onClick={() => handleUnitFilter(unit)}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      selectedUnit === unit 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {unit} ({getUnitCount(unit)})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className="mx-3 sm:mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mx-3 sm:mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <>
              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Code
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        MRP
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DP
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NLC
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                          {product.itemCode}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                          <div className="max-w-[120px] sm:max-w-[200px] lg:max-w-xs truncate" title={product.itemDescription}>
                            {product.itemDescription}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                          {product.unit}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                          ₹{product.mrp}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                          ₹{product.dp}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                          ₹{product.nlc}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-green-600 whitespace-nowrap">
                          {product.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* No Results */}
              {filteredProducts.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;

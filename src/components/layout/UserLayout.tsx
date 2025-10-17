import { useState, useEffect, ChangeEvent } from 'react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const units = [...new Set(products.map(product => product.unit))];
      setUniqueUnits(units.sort());
    }
  }, [products]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
    setIsDropdownOpen(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* iPhone-style Liquid Glass Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/30 to-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-300/25 to-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-r from-indigo-300/15 to-purple-300/15 rounded-full blur-3xl"></div>
      </div>
      
      <Header isAdmin={false} />
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative z-10">
        <div className="bg-white/25 backdrop-blur-3xl backdrop-saturate-200 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header Section */}
          <div className="p-3 sm:p-6 border-b border-white/10 bg-white/5">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-4">Products List</h1>

            {/* Search Section */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by item code or description..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-3 py-2.5 pl-10 text-sm bg-white/20 backdrop-blur-3xl backdrop-saturate-200 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-400/20 focus:border-white/30 focus:bg-white/30 shadow-sm transition-all placeholder:text-gray-600"
                />
                {/* <svg className="absolute left-3 top-3 h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg> */}
              </div>

              {/* Category Dropdown */}
              <div className="relative dropdown-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full sm:w-64 px-4 py-2.5 text-left bg-white/20 backdrop-blur-3xl backdrop-saturate-200 border border-white/20 rounded-2xl shadow-sm hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-white/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {selectedUnit === 'all' 
                        ? `All Categories (${products.length})` 
                        : `${selectedUnit} (${getUnitCount(selectedUnit)})`
                      }
                    </span>
                    <svg 
                      className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full sm:w-64 mt-2 bg-white/25 backdrop-blur-3xl backdrop-saturate-200 border border-white/20 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                    <button
                      onClick={() => handleUnitFilter('all')}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/30 transition-all rounded-xl ${
                        selectedUnit === 'all' 
                          ? 'bg-white/20 text-gray-900 font-medium' 
                          : 'text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>All Categories</span>
                        <span className="text-xs text-gray-600">({products.length})</span>
                      </div>
                    </button>
                    <div className="border-t border-white/15 mx-2"></div>
                    {uniqueUnits.map(unit => (
                      <button
                        key={unit}
                        onClick={() => handleUnitFilter(unit)}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/30 transition-all rounded-xl ${
                          selectedUnit === unit 
                            ? 'bg-white/20 text-gray-900 font-medium' 
                            : 'text-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{unit}</span>
                          <span className="text-xs text-gray-600">({getUnitCount(unit)})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/10 backdrop-blur-2xl backdrop-saturate-200">
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

import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import './ProductList.css';

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

interface FormData {
  itemCode: string;
  itemDescription: string;
  unit: string;
  mrp: number;
  dp: number;
  nlc: number;
  percentage: number;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    itemCode: '',
    itemDescription: '',
    unit: '',
    mrp: 0,
    dp: 0,
    nlc: 0,
    percentage: 0
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [uniqueUnits, setUniqueUnits] = useState<string[]>([]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Extract unique units from products
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

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'mrp' || name === 'dp' || name === 'nlc' || name === 'percentage' 
        ? parseFloat(value) || 0 
        : value
    });
  };

  // Start editing a product
  const handleEdit = (product: Product) => {
    setEditingProduct(product._id);
    setFormData({
      itemCode: product.itemCode,
      itemDescription: product.itemDescription,
      unit: product.unit,
      mrp: product.mrp,
      dp: product.dp,
      nlc: product.nlc,
      percentage: product.percentage
    });
    setMessage('');
    setError('');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      itemCode: '',
      itemDescription: '',
      unit: '',
      mrp: 0,
      dp: 0,
      nlc: 0,
      percentage: 0
    });
  };

  // Save edited product
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`https://balajii-electronices.onrender.com/api/products/${editingProduct}`, formData);
      
      // Update the product in the local state
      setProducts(products.map(product => 
        product._id === editingProduct ? response.data.data : product
      ));
      
      setMessage('Product updated successfully!');
      setEditingProduct(null);
      setFormData({
        itemCode: '',
        itemDescription: '',
        unit: '',
        mrp: 0,
        dp: 0,
        nlc: 0,
        percentage: 0
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error updating product:', error);
      setError(apiError.response?.data?.error || 'Error updating product');
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = (productId: string) => {
    setDeleteConfirm(productId);
    setMessage('');
    setError('');
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Delete product
  const handleDelete = async (productId: string) => {
    try {
      setLoading(true);
      await axios.delete(`https://balajii-electronices.onrender.com/api/products/${productId}`);
      
      // Remove the product from the local state
      setProducts(products.filter(product => product._id !== productId));
      
      setMessage('Product deleted successfully!');
      setDeleteConfirm(null);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error deleting product:', error);
      setError(apiError.response?.data?.error || 'Error deleting product');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle unit filter selection
  const handleUnitFilter = (unit: string) => {
    setSelectedUnit(unit);
  };

  // Filter products based on search term and selected unit
  const filteredProducts = products.filter(product => {
    // First filter by search term
    const matchesSearch = 
      product.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.itemDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Then filter by unit if a specific unit is selected
    const matchesUnit = selectedUnit === 'all' || product.unit === selectedUnit;
    
    return matchesSearch && matchesUnit;
  });

  // Count products by unit for the filter buttons
  const getUnitCount = (unit: string) => {
    return products.filter(product => product.unit === unit).length;
  };

  // Get row class based on state
  const getRowClass = (productId: string) => {
    if (editingProduct === productId) return 'editing-row';
    if (deleteConfirm === productId) return 'delete-confirm-row';
    return '';
  };

  return (
    <div className="product-list-container">
      <h1>Products List</h1>
      
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by item code or description..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="product-count">
          Total Products: <span>{filteredProducts.length}</span>
          {selectedUnit !== 'all' && (
            <span className="filter-info"> (Filtered by {selectedUnit})</span>
          )}
        </div>
      </div>
      
      {/* Unit filter buttons */}
      <div className="filter-buttons-container">
        <div className="filter-label">Filter by Unit:</div>
        <div className="filter-buttons">
          <button 
            className={`filter-button ${selectedUnit === 'all' ? 'active' : ''}`}
            onClick={() => handleUnitFilter('all')}
          >
            All Units
            <span className="unit-count">{products.length}</span>
          </button>
          
          {uniqueUnits.map(unit => (
            <button 
              key={unit}
              className={`filter-button ${selectedUnit === unit ? 'active' : ''}`}
              onClick={() => handleUnitFilter(unit)}
            >
              {unit}
              <span className="unit-count">{getUnitCount(unit)}</span>
            </button>
          ))}
        </div>
      </div>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {loading && !editingProduct && !deleteConfirm ? (
        <div className="loading">Loading products...</div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              {searchTerm || selectedUnit !== 'all' ? 
                'No products match your search criteria.' :
                'No products found. Add some products to see them here.'}
            </div>
          ) : (
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Description</th>
                    <th>Unit</th>
                    <th>MRP (₹)</th>
                    <th>DP (₹)</th>
                    <th>NLC (₹)</th>
                    <th>Percentage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product._id} className={getRowClass(product._id)}>
                      {editingProduct === product._id ? (
                        // Edit mode
                        <>
                          <td>
                            <input
                              type="text"
                              name="itemCode"
                              value={formData.itemCode}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="itemDescription"
                              value={formData.itemDescription}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="unit"
                              value={formData.unit}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="mrp"
                              value={formData.mrp}
                              onChange={handleInputChange}
                              className="edit-input"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="dp"
                              value={formData.dp}
                              onChange={handleInputChange}
                              className="edit-input"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="nlc"
                              value={formData.nlc}
                              onChange={handleInputChange}
                              className="edit-input"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              name="percentage"
                              value={formData.percentage}
                              onChange={handleInputChange}
                              className="edit-input"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </td>
                          <td className="action-buttons">
                            <button 
                              className="save-button"
                              onClick={handleSaveEdit}
                              disabled={loading}
                            >
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              className="cancel-button"
                              onClick={handleCancelEdit}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : deleteConfirm === product._id ? (
                        // Delete confirmation mode
                        <>
                          <td colSpan={7} className="delete-confirm-message">
                            Are you sure you want to delete product with item code <strong>{product.itemCode}</strong>?
                          </td>
                          <td className="action-buttons">
                            <button 
                              className="delete-confirm-button"
                              onClick={() => handleDelete(product._id)}
                              disabled={loading}
                            >
                              {loading ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                            <button 
                              className="cancel-button"
                              onClick={handleCancelDelete}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        // View mode
                        <>
                          <td>{product.itemCode}</td>
                          <td>{product.itemDescription}</td>
                          <td>{product.unit}</td>
                          <td>{product.mrp.toFixed(2)}</td>
                          <td>{product.dp.toFixed(2)}</td>
                          <td>{product.nlc.toFixed(2)}</td>
                          <td>{product.percentage}%</td>
                          <td className="action-buttons">
                            <button 
                              className="edit-button"
                              onClick={() => handleEdit(product)}
                            >
                              Edit
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => handleDeleteConfirm(product._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList; 
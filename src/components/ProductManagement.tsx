import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FiPackage, FiUpload, FiPlus, FiX, FiCheck, FiAlertCircle, 
  FiDownload, FiSearch, FiFilter, FiRefreshCw, FiInfo
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductManagement.css';

const ProductManagement = () => {
  // States for product form
  const [formData, setFormData] = useState({
    itemCode: '',
    itemDescription: '',
    unit: '',
    mrp: '',
    dp: '',
    nlc: '',
    percentage: ''
  });

  // States for Excel import
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('register');
  const [skippedProducts, setSkippedProducts] = useState([]);
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showProductList, setShowProductList] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products when search term changes
  useEffect(() => {
    if (products.length > 0) {
      const filtered = products.filter(product => 
        product.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.itemDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get('https://balajii-electronices.onrender.com/api/products');
      setProducts(response.data.data);
      setFilteredProducts(response.data.data);
      setIsRefreshing(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
      setIsRefreshing(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle single product registration
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await axios.post('https://balajii-electronices.onrender.com/api/products', formData);
      
      // Success animation and message
      setMessage('Product registered successfully!');
      
      // Reset form
      setFormData({
        itemCode: '',
        itemDescription: '',
        unit: '',
        mrp: '',
        dp: '',
        nlc: '',
        percentage: ''
      });
      
      // Refresh the product list
      fetchProducts();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error registering product:', error);
      setError(error.response?.data?.error || 'Error registering product');
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('Selected file:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });
      setFile(selectedFile);
      setMessage('');
      setError('');
    }
  };

  // Handle Excel file import
  const handleExcelSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an Excel file');
      return;
    }
    
    const formData = new FormData();
    formData.append('excelFile', file);
    
    setLoading(true);
    setMessage('');
    setError('');
    setSkippedProducts([]);
    
    try {
      const response = await axios.post('https://balajii-electronices.onrender.com/api/products/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      let successMessage = `Successfully imported ${response.data.count} products`;
      
      // Handle skipped products if any
      if (response.data.skipped > 0) {
        successMessage += `, skipped ${response.data.skipped} duplicate products`;
        setSkippedProducts(response.data.skippedDetails || []);
        setShowSkippedModal(true);
      }
      
      // Handle validation warnings if some products were imported but others had errors
      if (response.data.errors && response.data.errors.length > 0) {
        setError(`Warning: ${response.data.errors.length} rows had validation errors and were skipped.`);
      }
      
      setMessage(successMessage);
      setFile(null);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh the product list
      fetchProducts();
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error importing products:', error);
      
      // Handle different types of errors
      if (error.response?.data?.error === 'Error processing Excel file' && 
          error.response?.data?.details?.includes('duplicate key error')) {
        // Extract the duplicate item code from the error message
        const match = error.response.data.details.match(/dup key: \{ itemCode: "(.+?)" \}/);
        const itemCode = match ? match[1] : 'unknown';
        
        setError(`Duplicate product with item code "${itemCode}" found. This product was skipped.`);
        
        // Still refresh the products list as some products might have been imported
        fetchProducts();
      } else if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        // Handle validation errors
        setError(`${error.response.data.error}: ${error.response.data.details.join(', ')}`);
      } else {
        // Generic error handling
        setError(error.response?.data?.error || 'Error importing products');
      }
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Sort products
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredProducts(sortedProducts);
  };

  // Download template
  const downloadTemplate = () => {
    const headers = "itemCode,itemDescription,unit,mrp,dp,nlc,percentage\n";
    const sampleData = [
      "PROD001,Product Description 1,PCS,100,80,70,20",
      "PROD002,Product Description 2,BOX,200,160,140,30",
      "PROD003,Product Description 3,KG,150,120,100,25"
    ].join("\n");
    
    const csvContent = headers + sampleData;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'product_import_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setShowTemplateModal(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      className="product-management-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="header-section">
        <motion.h1 variants={itemVariants}>
          <FiPackage className="header-icon" /> Product Management
        </motion.h1>
        <motion.div className="header-actions" variants={itemVariants}>
          <button 
            className="action-button refresh-button" 
            onClick={fetchProducts}
            disabled={isRefreshing}
          >
            <FiRefreshCw className={isRefreshing ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            className="action-button list-toggle-button"
            onClick={() => setShowProductList(!showProductList)}
          >
            {showProductList ? 'Hide Products' : 'Show Products'}
          </button>
        </motion.div>
      </div>

      <motion.div className="tabs" variants={itemVariants}>
        <button
          className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          <FiPlus /> Register Single Product
        </button>
        <button
          className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          <FiUpload /> Import from Excel
        </button>
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.div 
            className="success-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FiCheck className="message-icon" />
            <span>{message}</span>
            <button 
              className="close-message" 
              onClick={() => setMessage('')}
            >
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FiAlertCircle className="message-icon" />
            <span>{error}</span>
            <button 
              className="close-message" 
              onClick={() => setError('')}
            >
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="tab-content"
        variants={itemVariants}
        key={activeTab}
        initial={{ opacity: 0, x: activeTab === 'register' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'register' ? (
          <div className="register-form card">
            <h2>Register New Product</h2>
            <form ref={formRef} onSubmit={handleProductSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="itemCode">Item Code *</label>
                  <input
                    type="text"
                    id="itemCode"
                    name="itemCode"
                    value={formData.itemCode}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. PROD001"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="itemDescription">Item Description *</label>
                  <input
                    type="text"
                    id="itemDescription"
                    name="itemDescription"
                    value={formData.itemDescription}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Premium Product"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="unit">Unit *</label>
                  <input
                    type="text"
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. PCS, KG, BOX"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mrp">MRP *</label>
                  <div className="input-with-icon">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      id="mrp"
                      name="mrp"
                      value={formData.mrp}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="dp">DP *</label>
                  <div className="input-with-icon">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      id="dp"
                      name="dp"
                      value={formData.dp}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="nlc">NLC *</label>
                  <div className="input-with-icon">
                    <span className="currency-symbol">₹</span>
                    <input
                      type="number"
                      id="nlc"
                      name="nlc"
                      value={formData.nlc}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="percentage">Percentage *</label>
                  <div className="input-with-icon">
                    <input
                      type="number"
                      id="percentage"
                      name="percentage"
                      value={formData.percentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                    <span className="percentage-symbol">%</span>
                  </div>
                </div>
              </div>
              <motion.button
                type="submit"
                className="submit-button"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span >Registering...</span>
                  </>
                ) : (
                  <>
                    <FiPlus />
                    <span>Register Product</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        ) : (
          <div className="import-form card">
            <h2>Import Products from Excel</h2>
            <div className="template-info">
              <FiInfo className="info-icon" />
              <p>
                Need a template? 
                <button 
                  className="template-link" 
                  onClick={() => setShowTemplateModal(true)}
                >
                  Download sample template
                </button>
              </p>
            </div>
            <form onSubmit={handleExcelSubmit}>
              <div className="file-upload-container">
                <div 
                  className={`file-drop-area ${file ? 'has-file' : ''}`}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    id="excelFile"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <div className="file-icon-container">
                    {file ? (
                      <FiCheck className="file-selected-icon" />
                    ) : (
                      <FiUpload className="file-upload-icon" />
                    )}
                  </div>
                  <div className="file-text">
                    {file ? (
                      <>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                      </>
                    ) : (
                      <>
                        <span className="drop-text">Drag & drop your Excel file here</span>
                        <span className="or-text">- OR -</span>
                        <span className="browse-text">Browse files</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="file-help">Supported formats: .xlsx, .xls, .csv</p>
              </div>
              <motion.button
                type="submit"
                className="submit-button"
                disabled={!file || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <FiUpload />
                    <span>Import Products</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showProductList && (
          <motion.div 
            className="products-list card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="list-header">
              <h2>Products List ({filteredProducts.length})</h2>
              <div className="list-actions">
                <div className="search-container">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search" 
                      onClick={() => setSearchTerm('')}
                    >
                      <FiX />
                    </button>
                  )}
                </div>
                <button className="filter-button">
                  <FiFilter />
                  <span>Filter</span>
                </button>
              </div>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th onClick={() => requestSort('itemCode')}>
                        Item Code
                        {sortConfig.key === 'itemCode' && (
                          <span className={`sort-indicator ${sortConfig.direction}`}>
                            {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort('itemDescription')}>
                        Description
                        {sortConfig.key === 'itemDescription' && (
                          <span className={`sort-indicator ${sortConfig.direction}`}>
                            {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort('unit')}>
                        Unit
                        {sortConfig.key === 'unit' && (
                          <span className={`sort-indicator ${sortConfig.direction}`}>
                            {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort('mrp')}>
                        MRP
                        {sortConfig.key === 'mrp' && (
                          <span className={`sort-indicator ${sortConfig.direction}`}>
                            {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort('dp')}>
                        DP
                        {sortConfig.key === 'dp' && (
                          <span className={`sort-indicator ${sortConfig.direction}`}>
                            {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort('nlc')}>
                        NLC
                        {sortConfig.key === 'nlc' && (
                          <span className={`sort-indicator ${sortConfig.direction}`}>
                            {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                      <th onClick={() => requestSort('percentage')}>
                        Percentage
                        {sortConfig.key === 'percentage' && (
                          <span className={`sort-indicator ${sortConfig.direction}`}>
                            {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                          </span>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <motion.tr 
                        key={product._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                      >
                        <td>{product.itemCode}</td>
                        <td>{product.itemDescription}</td>
                        <td>{product.unit}</td>
                        <td>₹{product.mrp.toFixed(2)}</td>
                        <td>₹{product.dp.toFixed(2)}</td>
                        <td>₹{product.nlc.toFixed(2)}</td>
                        <td>{product.percentage}%</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-products">
                <FiPackage className="no-data-icon" />
                <p>No products found. Add some products to see them here.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skipped Products Modal */}
      <AnimatePresence>
        {showSkippedModal && (
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>Skipped Products ({skippedProducts.length})</h3>
                <button 
                  className="close-modal" 
                  onClick={() => setShowSkippedModal(false)}
                >
                  <FiX />
                </button>
              </div>
              <div className="modal-body">
                {skippedProducts.length > 0 ? (
                  <div className="table-container">
                    <table className="skipped-table">
                      <thead>
                        <tr>
                          <th>Item Code</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skippedProducts.map((product, index) => (
                          <tr key={index}>
                            <td>{product.itemCode}</td>
                            <td>{product.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No products were skipped during import.</p>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="modal-button"
                  onClick={() => setShowSkippedModal(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div 
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content template-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>Download Template</h3>
                <button 
                  className="close-modal" 
                  onClick={() => setShowTemplateModal(false)}
                >
                  <FiX />
                </button>
              </div>
              <div className="modal-body">
                <p>The template contains the following columns:</p>
                <ul className="template-columns">
                  <li><strong>itemCode</strong> - Unique identifier for the product (required)</li>
                  <li><strong>itemDescription</strong> - Description of the product (required)</li>
                  <li><strong>unit</strong> - Unit of measurement (required)</li>
                  <li><strong>mrp</strong> - Maximum Retail Price (required)</li>
                  <li><strong>dp</strong> - Dealer Price (required)</li>
                  <li><strong>nlc</strong> - Net Landing Cost (required)</li>
                  <li><strong>percentage</strong> - Percentage value (required)</li>
                </ul>
                <div className="template-preview">
                  <h4>Sample Data:</h4>
                  <div className="code-block">
                    <code>
                      itemCode,itemDescription,unit,mrp,dp,nlc,percentage<br/>
                      PROD001,Product Description 1,PCS,100,80,70,20<br/>
                      PROD002,Product Description 2,BOX,200,160,140,30<br/>
                      PROD003,Product Description 3,KG,150,120,100,25
                    </code>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="modal-button secondary"
                  onClick={() => setShowTemplateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="modal-button primary"
                  onClick={downloadTemplate}
                >
                  <FiDownload />
                  <span>Download Template</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductManagement;

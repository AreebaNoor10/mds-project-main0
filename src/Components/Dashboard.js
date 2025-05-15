'use client'
import { Box, Typography, Button, Paper, TextField, Stepper, Step, StepLabel, Snackbar, Alert, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import StepIcon from '@mui/material/StepIcon';
import LoopIcon from '@mui/icons-material/Loop';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DescriptionIcon from '@mui/icons-material/Description';
import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { setupPdfWorker } from '../utils/pdfjs-worker';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RemoveIcon from '@mui/icons-material/Remove';
import FinalReportTable from './FinalReportTable';

export default function Dashboard() {
  const [addmtr, setaddMtr] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showUploadError, setShowUploadError] = useState(false);
  const uploadInputRef = useRef();
  const [mdsName, setMdsName] = useState('');
  const [mdsNameError, setMdsNameError] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [materialType, setMaterialType] = useState('');
  const [typeValue, setTypeValue] = useState('');
  const [showApiError, setShowApiError] = useState(true);
  const [mtrMode, setMtrMode] = useState('data+pdf');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [historyData, setHistoryData] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedSpecId, setSelectedSpecId] = useState(null);
  const [totalCounts, setTotalCounts] = useState({
    inprogress: 0,
    completed: 0,
    review: 0
  });
  
  // Add new state variables for storing API responses for each step
  const [step1Response, setStep1Response] = useState(null);
  const [step2Response, setStep2Response] = useState(null);
  const [step3Response, setStep3Response] = useState(null);
  const [step4Response, setStep4Response] = useState(null);

  // Add new state near the top with other state declarations
  const [showUnifiedFileError, setShowUnifiedFileError] = useState(false);
  const [showRecordViewError, setShowRecordViewError] = useState(false);
  const [recordViewError, setRecordViewError] = useState('');
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const [showUpdateError, setShowUpdateError] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Add this state near the top with other state declarations
  const [statusChanges, setStatusChanges] = useState({});
  const [editingStatusRow, setEditingStatusRow] = useState(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Editable state for Step 3 (MTR Data)
  const [editableMtrData, setEditableMtrData] = useState({});
  const [editingMtrCell, setEditingMtrCell] = useState(null); // {category, key}
  // Editable state for Step 4 (Unified Spec)
  const [editableUnifiedSpec, setEditableUnifiedSpec] = useState({});
  const [editingUnifiedCell, setEditingUnifiedCell] = useState(null); // {specId, rowIndex, field}
  const [mtrKeysId, setMtrKeysId] = useState(null); // Store mtr_keys_id from extract key API

 

  // Calculate total pages
  const totalItems = historyData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get current page items
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historyData.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const handleChangePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show pages 1, 2, 3
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis if needed
    if (totalPages > 3) {
      pageNumbers.push('...');
      
      // Add some pages near the end
      if (totalPages > 5) {
        pageNumbers.push(totalPages - 1);
        pageNumbers.push(totalPages);
      } else {
        // Add remaining pages for small total page counts
        for (let i = 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
  };

  const steps = [
    'Upload file',
    'Grade Detection',
    'MTR Data',
    'Unified Spec',
    'Comparison Agents',
    'Quality Check AI',
    'QA Review',
  ];
  
  const stats = [
    { title: 'Draft', count: totalCounts.review || '0', icon: <DescriptionOutlinedIcon sx={{ fontSize: 20 }} /> },
    { title: 'Pending', count: totalCounts.inprogress || '0', icon: <AccessTimeIcon sx={{ fontSize: 20 }} /> },
    { title: 'Completed', count: totalCounts.completed || '0', icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} /> },
  ];

  // Helper to get visible steps for mobile
  const getVisibleSteps = () => {
    if (window.innerWidth >= 600) return steps.map((label, idx) => ({ label, idx })); // show all on desktop
    if (activeStep <= 1) return steps.slice(0, 4).map((label, idx) => ({ label, idx }));
    if (activeStep >= steps.length - 2) return steps.slice(-4).map((label, idx) => ({ label, idx: steps.length - 4 + idx }));
    return steps.slice(activeStep - 1, activeStep + 3).map((label, idx) => ({ label, idx: activeStep - 1 + idx }));
  };

  useEffect(() => {
    if (apiResponse && apiResponse.error) {
      setShowApiError(true);
    }
  }, [apiResponse && apiResponse.error]);

  useEffect(() => {
    setupPdfWorker();
  }, []);

  // Reset PDF zoom when switching to data+pdf mode
  useEffect(() => {
    if (mtrMode === 'data+pdf') {
      setScale(1.0);
    }
  }, [mtrMode]);

  // Sync editableMtrData with apiResponse when it changes (Step 3)
  useEffect(() => {
    if (activeStep === 2 && apiResponse) {
      const newData = {};
      Object.entries(apiResponse).forEach(([category, data]) => {
        newData[category] = { ...data };
      });
      setEditableMtrData(newData);
    }
  }, [apiResponse, activeStep]);

  // Sync editableUnifiedSpec with apiResponse when it changes (Step 4)
  useEffect(() => {
    if (activeStep === 3 && apiResponse) {
      const newSpec = {};
      Object.entries(apiResponse).forEach(([specId, specData]) => {
        const response = specData.response || {};
        const rows = [];
        Object.entries(response).forEach(([parentKey, value]) => {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            Object.entries(value).forEach(([childKey, childValue]) => {
              rows.push({ field: `${parentKey}.${childKey}`, value: childValue });
            });
          } else {
            rows.push({ field: parentKey, value: value });
          }
        });
        newSpec[specId] = rows;
      });
      setEditableUnifiedSpec(newSpec);
    }
  }, [apiResponse, activeStep]);

  // Add useEffect for fetching history data
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setHistoryLoading(true);
        const response = await fetch('/api/proxy/history');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.errorMessage || data.errorType || 'Failed to fetch history data');
        }

        if (data.history_response) {
          setHistoryData(data.history_response);
        } else {
          setHistoryData([]);
        }
        
        if (data.total_counts) {
          setTotalCounts(data.total_counts);
        }
        
        setHistoryError(null);
      } catch (err) {
        setHistoryError(err.message);
        setHistoryData([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  // Calculate total pages for history
  const totalHistoryItems = historyData.length;
  const totalHistoryPages = Math.ceil(totalHistoryItems / itemsPerPage);
  
  // Get current page items for history
  const indexOfLastHistoryItem = page * itemsPerPage;
  const indexOfFirstHistoryItem = indexOfLastHistoryItem - itemsPerPage;
  const currentHistoryItems = historyData.slice(indexOfFirstHistoryItem, indexOfLastHistoryItem);

  const handleUnifiedOutput = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('mds_name', mdsName);
      formData.append('grade_label', typeValue);
      if (mtrKeysId) {
        formData.append('mtr_id', mtrKeysId);
      }
      console.log('Sending request to unified output API with:', {
        mds_name: mdsName,
        grade_label: typeValue,
        mtr_id: mtrKeysId
      });
      const response = await fetch('/api/proxy/getunifiedoutput', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      console.log('Unified Output API Response:', data);
      
      if (!response.ok) {
        const errorMessage = data.errorMessage || data.error || 'Failed to get unified output';
        throw new Error(errorMessage);
      }
      
      if (data.errorType) {
        throw new Error(data.errorMessage || 'An error occurred while processing the request');
      }
      
      setApiResponse(data);
      setApiError(null);
    } catch (error) {
      console.error('Unified output error:', error);
      setApiError(error.message || 'An error occurred while fetching unified output');
      setApiResponse(null);
      // Show error to user
      setShowRecordViewError(true);
      setRecordViewError(error.message || 'Failed to get unified output. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // PDF navigation and zoom handlers
  const goToPrevPage = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };
  const goToNextPage = () => {
    if (numPages && pageNumber < numPages) setPageNumber(pageNumber + 1);
  };
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 1.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  useEffect(() => {
    // Check if we have data from History page
    const mtrResponse = localStorage.getItem('mtrResponse');
    const mtrMdsName = localStorage.getItem('mtrMdsName');
    const mtrType = localStorage.getItem('mtrType');
    const activeStep = localStorage.getItem('activeStep');

    if (mtrResponse) {
      const parsedResponse = JSON.parse(mtrResponse);
      setApiResponse(parsedResponse);
      setStep1Response(parsedResponse);
      setMdsName(mtrMdsName || '');
      setTypeValue(mtrType || '');
      setaddMtr(true);
      
      // If activeStep is set, use it, otherwise default to step 1
      setActiveStep(activeStep ? parseInt(activeStep) : 1);

      // Clear the localStorage data
      localStorage.removeItem('mtrResponse');
      localStorage.removeItem('mtrMdsName');
      localStorage.removeItem('mtrType');
      localStorage.removeItem('activeStep');
    }
  }, []);

  // Add this where step 7 is rendered
  const renderStep7 = () => {
    const finalReportData = JSON.parse(localStorage.getItem('finalReportData') || '{}');
    
    if (Object.keys(finalReportData).length > 0) {
      return (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Step 7: Final Report Review</Typography>
          <FinalReportTable />
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      p: { xs: 2, sm: 3 }
    }}>
      {addmtr === false ? (
          <>
          {/* Stats Cards */}
          <Box sx={{ 
            display: 'flex', 
            width: '100%', 
            mb: 3, 
            gap: { xs: 2, sm: 3 }
          }}>
            {stats.map((stat, index) => (
              <Box 
                key={index}
                sx={{ 
                  flex: 1, 
                  p: { xs: 2, sm: 3 }, 
                  display: 'flex',
                  bgcolor: 'white',
                  borderRight: { 
                    xs: 'none', 
                    sm: index < stats.length - 1 ? '1px solid #f0f0f0' : 'none' 
                  },
                  mr: { 
                    xs: 0, 
                    sm: index < stats.length - 1 ? 3 : 0 
                  },
                  boxShadow: { xs: '0 1px 3px rgba(0,0,0,0.1)', sm: 'none' },
                  borderRadius: '10px'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  width: '100%' 
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    mb: 1.5
                  }}>
                    <Typography sx={{ 
                      color: '#5f6368', 
                      fontSize: '14px', 
                      fontWeight: 400
                    }}>
                      {stat.title}
                    </Typography>
                    <Box sx={{ 
                      color: index === 0 ? '#5f6368' : index === 1 ? '#5f6368' : '#34a853',
                      mr: -0.5
                    }}>
                      {stat.icon}
                    </Box>
                  </Box>
                  <Typography 
                    sx={{ 
                      fontSize: { xs: '24px', sm: '28px' }, 
                      fontWeight: 'bold',
                      color: '#202124',
                      lineHeight: 1
                    }}
                  >
                    {stat.count}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
    
          {/* MTR Review History */}
          <Box sx={{ 
            mb: 2, 
            display: 'flex', 
            flexDirection: 'row' ,
            justifyContent: 'space-between', 
            alignItems:  'center' ,
          }}>
            <Typography
              sx={{ fontSize: '16px', fontWeight: 700}}
            >
              MTR Review History
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setaddMtr(true)}
              sx={{
                bgcolor: '#4285f4',
                '&:hover': {
                  bgcolor: '#1a73e8',
                },
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                px: 2,
                py: 1,
                borderRadius: '10px'
              }}
            >
              Add MTR
            </Button>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
          }}>
            {historyLoading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading...</Typography>
              </Box>
            ) : historyError ? (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  '& .MuiAlert-message': {
                    fontSize: '14px'
                  }
                }}
              >
                {historyError}
              </Alert>
            ) : (
              <>
                {/* Table Container */}
                <div className="w-full rounded-lg bg-gray-50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-full table-auto">
                      <thead className="bg-gray-100">
                        <tr>
                          {historyData.length > 0 && Object.keys(historyData[0]).map((key) => (
                            <th key={key} className="py-4 px-6 text-left text-sm font-medium text-gray-700">
                              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </th>
                          ))}
                          <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {currentItems.map((row, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            {Object.entries(row).map(([key, value]) => (
                              <td key={key} className="py-4 px-6 text-sm text-gray-800 whitespace-nowrap">
                                {key === 'status' ? (
                                  value === 'completed' ? (
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                      background: '#e6f4ea', color: '#188038', fontWeight: 500, fontSize: 14, border: '1px solid #b7e1cd', verticalAlign: 'middle'
                                    }}>
                                      <span style={{ fontSize: 16, marginRight: 6 }}>✅</span> Completed
                                    </span>
                                  ) : value === 'inprogress' ? (
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                      background: '#e8f0fe', color: '#1a73e8', fontWeight: 500, fontSize: 14, border: '1px solid #c2d7f5', verticalAlign: 'middle'
                                    }}>
                                      <span style={{ fontSize: 16, marginRight: 6 }}>⏳</span> Processing
                                    </span>
                                  ) : value === 'review' ? (
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                      background: '#fff4e5', color: '#e58900', fontWeight: 500, fontSize: 14, border: '1px solid #ffe0b2', verticalAlign: 'middle'
                                    }}>
                                      <span style={{ fontSize: 16, marginRight: 6 }}>⚠️</span> Review
                                    </span>
                                  ) : value === 'draft' ? (
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                      background: '#f3f4f6', color: '#5f6368', fontWeight: 500, fontSize: 14, border: '1px solid #e0e0e0', verticalAlign: 'middle'
                                    }}>
                                      <span style={{ fontSize: 16, marginRight: 6 }}>📝</span> Draft
                                    </span>
                                  ) : value
                                ) : value}
                              </td>
                            ))}
                            <td className="py-4 px-6 text-sm text-gray-800 whitespace-nowrap">
                              <IconButton
                                size="small"
                                onClick={async () => {
                                  try {
                                    // Log status and ID based on status value
                                    if (row.status === 'review') {
                                      console.log('MTR ID:', row.id);
                                      console.log('Status:', row.status);
                                      
                                      const formData = new FormData();
                                      formData.append('mtr_id', row.id);
                                      
                                      const response = await fetch('/api/proxy/existingfinalreport', {
                                        method: 'POST',
                                        body: formData
                                      });
                                      
                                      const data = await response.json();
                                      console.log('Existing Final Report Response:', data);
                                      
                                      // Store the response in localStorage for FinalReportTable
                                      localStorage.setItem('finalReportData', JSON.stringify(data));
                                      // Store the MTR ID for later use
                                      localStorage.setItem('mtrId', row.id);
                                      
                                      // Navigate to step 7 (Final Report Review)
                                      setApiResponse(data);
                                      setaddMtr(true);
                                      setActiveStep(6);
                                      return;
                                    }
                                    
                                    console.log('PDF ID:', row.id);
                                    console.log('Status:', row.status);
                                    
                                    const formData = new FormData();
                                    formData.append('record_pdf_id', row.id);
                                    
                                    const response = await fetch('/api/proxy/recordview', {
                                      method: 'POST',
                                      body: formData
                                    });
                                    
                                    const data = await response.json();
                                    console.log('Record View API Response:', data);
                                    
                                    if (!response.ok) {
                                      throw new Error(data.error || data.errorMessage || data.errorType || 'Failed to fetch record view data');
                                    }
                                    
                                    // Format the API response to match the expected structure
                                    const formattedResponse = {
                                      decision: {
                                        heat_number: data.decision?.heat_number || '',
                                        lot_number: data.decision?.lot_number || '',
                                        raw_material_size: data.decision?.raw_material_size || '',
                                        strength: data.decision?.strength || '',
                                        type: data.decision?.type || ''
                                      },
                                      mds_name: data.mds_name || '',
                                      pdf_text: data.pdf_text || ''
                                    };
                                    
                                    // Set the formatted response and navigate to step 2
                                    setApiResponse(formattedResponse);
                                    setStep1Response(formattedResponse);
                                    setMdsName(data.mds_name || '');
                                    setTypeValue(data.decision?.type || '');
                                    setaddMtr(true);
                                    setActiveStep(1); // Navigate to Grade Detection step
                                  } catch (error) {
                                    console.error('API Error:', error);
                                    setRecordViewError(error.message);
                                    setShowRecordViewError(true);
                                  }
                                }}
                                sx={{
                                  color: '#5f6368',
                                  '&:hover': {
                                    color: '#4285f4',
                                    bgcolor: '#e8f0fe'
                                  }
                                }}
                              >
                                <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20 }} />
                              </IconButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Pagination */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 2,
                  px: 1
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Show {Math.min(currentItems.length, itemsPerPage)} out of {totalItems}
                  </Typography>
                  
                  <div className="flex items-center gap-1">
                    {/* Previous button */}
                    <button 
                      onClick={() => handleChangePage(page - 1)}
                      disabled={page === 1}
                      className="flex items-center justify-center h-6 w-6 rounded text-gray-600 bg-white hover:bg-gray-100"
                    >
                      <NavigateBeforeIcon sx={{ fontSize: 18 }} />
                    </button>
                    
                    {/* Page numbers */}
                    {getPageNumbers().map((pageNum, index) => (
                      <button 
                        key={index}
                        onClick={() => typeof pageNum === 'number' ? handleChangePage(pageNum) : null}
                        className={`flex items-center justify-center h-6 w-6 text-xs rounded-sm ${
                          pageNum === page 
                            ? 'bg-gray-800 text-white' 
                            : pageNum === '...' 
                              ? 'bg-transparent text-gray-600 cursor-default' 
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    {/* Next button */}
                    <button 
                      onClick={() => handleChangePage(page + 1)}
                      disabled={page === totalPages}
                      className="flex items-center justify-center h-6 w-6 rounded text-gray-600 bg-white hover:bg-gray-100"
                    >
                      <NavigateNextIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </Box>
              </>
            )}
          </Box>
          </> 
        ) : (
          <Box sx={{ width: '100%', maxWidth: 1100, mx: 'auto'}}>
            {/* Custom Stepper */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 1,
              mt: 0.5,
              overflow: { xs: 'hidden', sm: 'visible' },
              position: 'relative',
              width: '100%'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                width: '100%',
                transition: 'transform 0.3s ease-in-out'
              }}>
                {(typeof window !== 'undefined' && window.innerWidth < 600 ? getVisibleSteps() : steps.map((label, idx) => ({ label, idx }))).map(({ label, idx }, visibleIdx) => {
                  const isActive = idx === activeStep;
                  const isCompleted = idx < activeStep;
                  const isLoading = loading && idx === activeStep + 1;
                  return (
                    <Box key={`${label}-${idx}`} sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      flex: { xs: '0 0 20%', sm: '0 1 auto' },
                      minWidth: { xs: '20%', sm: 'auto' },
                      px: { xs: 0.2, sm: 0.5 }
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        width: '100%'
                      }}>
                        <Box
                          sx={{
                            width: { xs: 24, sm: 32 },
                            height: { xs: 24, sm: 32 },
                            borderRadius: '50%',
                            bgcolor: isActive ? '#e58900' : isCompleted ? '#34a853' : '#f5f5f5',
                            color: isActive || isCompleted ? '#fff' : '#bdbdbd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 0.3,
                            border: isActive ? '2px solid #e58900' : '2px solid #f5f5f5',
                            transition: 'all 0.2s',
                            fontSize: { xs: 13, sm: 17 },
                            fontWeight: 600,
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircleOutlineIcon sx={{ color: '#fff', fontSize: { xs: 16, sm: 20 } }} />
                          ) : isLoading ? (
                            <LoopIcon sx={{ color: '#e58900', fontSize: { xs: 16, sm: 20 }, animation: 'spin 1s linear infinite' }} />
                          ) : isActive ? (
                            <DescriptionIcon sx={{ color: '#fff', fontSize: { xs: 16, sm: 20 } }} />
                          ) : (
                            idx + 1
                          )}
                        </Box>
                        <Typography
                          sx={{
                            fontSize: { xs: 10, sm: 12 },
                            color: isActive ? '#222' : '#bdbdbd',
                            fontWeight: isActive ? 600 : 400,
                            textAlign: 'center',
                            lineHeight: 1.15,
                            whiteSpace: 'normal',
                            overflow: 'visible',
                            textOverflow: 'unset',
                            px: 0.5,
                          }}
                        >
                          {label}
                        </Typography>
                      </Box>
                      {visibleIdx < (typeof window !== 'undefined' && window.innerWidth < 600 ? 3 : steps.length - 1) && (
                        <Box sx={{ 
                          width: { xs: 10, sm: 24 },
                          height: 2, 
                          bgcolor: '#f0f0f0', 
                          mx: { xs: 0.2, sm: 0.5 },
                          mt: { xs: 8, sm: 10 }
                        }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Loading Card (centered) */}
            {loading && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 350,
                  width: '100%',
                  mt: 6,
                  mb: 6,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: '#fff',
                    minWidth: 320,
                    maxWidth: 400,
                    mx: 'auto',
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <CircularProgress sx={{ color: '#222', mb: 2 }} />
                  {activeStep === 0 && (
                    <>
                      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>
                        Extracted Text
                      </Typography>
                      <Typography sx={{ fontSize: 15, color: '#444', opacity: 0.8, textAlign: 'center', maxWidth: 350 }}>
                        Extracted text by Supervisor Agent (AI) to give us Material Type/Grade Detection
                      </Typography>
                    </>
                  )}
                  {activeStep === 1 && (
                    <>
                      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>
                        Data Extraction(MTR Data Extraction)
                      </Typography>
                      <Typography sx={{ fontSize: 15, color: '#444', opacity: 0.8, textAlign: 'center', maxWidth: 350 }}>
                        Extracted text has been passed to Agent to Extract Key Fields for 4140 Grade, Heat No., Composition, etc.
                      </Typography>
                    </>
                  )}
                  {activeStep === 2 && (
                    <>
                      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>
                        Run RAG AI Agent
                      </Typography>
                      <Typography sx={{ fontSize: 15, color: '#444', opacity: 0.8, textAlign: 'center', maxWidth: 350 }}>
                        By using extracted data to show Best matched Unified Spec file
                      </Typography>
                    </>
                  )}
                  {activeStep === 3 && (
                    <>
                      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>
                        OpenAI / Anthropic Agents
                      </Typography>
                      <Typography sx={{ fontSize: 15, color: '#444', opacity: 0.8, textAlign: 'center', maxWidth: 350 }}>
                        By giving Material data + Unified spec we can get Comparison Table
                      </Typography>
                    </>
                  )}
                  {activeStep === 4 && (
                    <>
                      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>
                        Final Quality AI Checking
                      </Typography>
                      <Typography sx={{ fontSize: 15, color: '#444', opacity: 0.8, textAlign: 'center', maxWidth: 350 }}>
                        Quality Check Agent by Combined comparison table, Modal preview: Material Cert, Unified Spec
                      </Typography>
                    </>
                  )}
                  {activeStep === 5 && (
                    <>
                      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>
                        Final QA Review
                      </Typography>
                      <Typography sx={{ fontSize: 15, color: '#444', opacity: 0.8, textAlign: 'center', maxWidth: 350 }}>
                        Final report overview with previous step output used by QA Agent
                      </Typography>
                    </>
                  )}
                </Paper>
              </Box>
            )}

            {/* Step Content and Buttons (hide when loading) */}
            {!loading && (
              <>
                {/* Step 1: Upload UI */}
                {activeStep === 0 && (
                  <Box
                    sx={{
                      mt: 4,
                      mb: 4,
                      width: '100%',
                      maxWidth: 600,
                      minHeight: 180,
                      bgcolor: '#fff6e6',
                      border: '2px dashed #e58900',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'border 0.2s',
                      mx: 'auto',
                      '&:hover': { borderColor: '#b36b00' },
                      position: 'relative'
                    }}
                    onClick={() => uploadInputRef.current && uploadInputRef.current.click()}
                  >
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      style={{ display: 'none' }}
                      ref={uploadInputRef}
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedFile(e.target.files[0]);
                          setShowUploadError(false);
                        }
                      }}
                    />
                    {!uploadedFile ? (
                      <>
                        <UploadFileIcon sx={{ fontSize: 30, color: '#222', mb: 1 }} />
                        <Box sx={{ fontWeight: 500, fontSize: 16, color: '#222', mb: 0.5 }}>
                          Click to upload or drag and drop
                        </Box>
                        <Box sx={{ fontSize: 15, color: '#444', opacity: 0.8 }}>
                          Upload PDF or Scanned image to proceed!
                        </Box>
                      </>
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          minHeight: 120,
                        }}
                      >
                        {uploadedFile.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(uploadedFile)}
                            alt={uploadedFile.name}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                          />
                        ) : (
                          <PictureAsPdfIcon sx={{ color: '#d32f2f', fontSize: 48, mb: 1 }} />
                        )}
                        <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#222', textAlign: 'center', mt: 1 }}>
                          {uploadedFile.name}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: '#888', textAlign: 'center' }}>
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                {/* MDS Name input for step 1 */}
                {activeStep === 0 && (
                  <Box sx={{ mt: 2, width: '100%', maxWidth: 400, mx: 'auto' }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>
                      MDS Name
                    </Typography>
                    <TextField
                      select
                      value={mdsName}
                      onChange={e => {
                        setMdsName(e.target.value);
                        setMdsNameError(false);
                      }}
                      error={mdsNameError}
                      helperText={mdsNameError ? 'MDS Name is required' : ''}
                      fullWidth
                      required
                      sx={{
                        bgcolor: '#fff',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          height: 36
                        }
                      }}
                    >
                      {['MDS-1', 'MDS-3', 'MDS-4', 'MDS-6', 'MDS-7', 'MDS-8', 'MDS-119', 'MDS-170', 'MDS-172', 'MDS-201', 'MDS-204'].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                )}
                {/* Step 2: Grade Detection UI */}
                {activeStep === 1 && (
                  <Paper elevation={0} sx={{
                    p: 3,
                    mb: 4,
                    bgcolor: '#f8f9fb',
                    borderRadius: 2,
                    maxWidth: 600,
                    mx: 'auto',
                  }}>
                    {apiResponse && apiResponse.error && showApiError && (
                      <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        action={
                          <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => setShowApiError(false)}
                          >
                            <CloseIcon fontSize="inherit" />
                          </IconButton>
                        }
                      >
                        {apiResponse.error}
                      </Alert>
                    )}
                    <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 3 }}>
                      Review and Confirm the Material Details
                    </Typography>
                    
                    {apiResponse && (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>
                            Type
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            value={typeValue}
                            onChange={e => setTypeValue(e.target.value)}
                            sx={{
                              bgcolor: '#fff',
                              borderRadius: 1,
                              '& .MuiOutlinedInput-root': {
                                height: 36
                              }
                            }}
                          >
                            {['4140', '4142', '4130','4145','41XX-95 KSI','4130 MOD -T95','4140- HEAT TREAT SPEC', 'API 5CT','L80 -1% Cr', 'L80 type 1','T-95, API 5CT'].map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </TextField>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>
                            Strength
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            value={apiResponse.decision?.strength || ''}
                            onChange={(e) => {
                              setApiResponse({
                                ...apiResponse,
                                decision: {
                                  ...apiResponse.decision,
                                  strength: e.target.value
                                }
                              });
                            }}
                            sx={{ 
                              bgcolor: '#fff', 
                              borderRadius: 1,
                              '& .MuiOutlinedInput-root': {
                                height: 36
                              }
                            }}
                          >
                            {['80', '95', '110', '125', '145'].map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>
                            Heat Number
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={apiResponse.decision?.heat_number || ''}
                            onChange={(e) => {
                              setApiResponse({
                                ...apiResponse,
                                decision: {
                                  ...apiResponse.decision,
                                  heat_number: e.target.value
                                }
                              });
                            }}
                            sx={{ 
                              bgcolor: '#fff', 
                              borderRadius: 1,
                              '& .MuiOutlinedInput-root': {
                                height: 36
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>
                            Lot Number
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={apiResponse.decision?.lot_number || ''}
                            onChange={(e) => {
                              setApiResponse({
                                ...apiResponse,
                                decision: {
                                  ...apiResponse.decision,
                                  lot_number: e.target.value
                                }
                              });
                            }}
                            sx={{ 
                              bgcolor: '#fff', 
                              borderRadius: 1,
                              '& .MuiOutlinedInput-root': {
                                height: 36
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>
                            Raw Material Size
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={apiResponse.decision?.raw_material_size || ''}
                            onChange={(e) => {
                              setApiResponse({
                                ...apiResponse,
                                decision: {
                                  ...apiResponse.decision,
                                  raw_material_size: e.target.value
                                }
                              });
                            }}
                            sx={{ 
                              bgcolor: '#fff', 
                              borderRadius: 1,
                              '& .MuiOutlinedInput-root': {
                                height: 36
                              }
                            }}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>
                            MDS Name
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            value={mdsName}
                            onChange={(e) => {
                              setMdsName(e.target.value);
                            }}
                            sx={{ 
                              bgcolor: '#fff', 
                              borderRadius: 1,
                              '& .MuiOutlinedInput-root': {
                                height: 36
                              }
                            }}
                          >
                            {['MDS-1', 'MDS-3', 'MDS-4', 'MDS-6', 'MDS-7', 'MDS-8', 'MDS-119', 'MDS-170', 'MDS-172', 'MDS-201', 'MDS-204'].map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </>
                    )}
                  </Paper>
                )}
                {/* Step 3: MTR Data Table UI */}
                {activeStep === 2 && (
                  <Paper elevation={0} sx={{
                    p: 3,
                    mb: 4,
                    bgcolor: '#f8f9fb',
                    borderRadius: 2,
                    maxWidth: 1000,
                    mx: 'auto',
                  }}>
                    {/* Card-like header with dropdown */}
                    <Paper
                      elevation={0}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        bgcolor: '#fff',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        mb: 2,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        gap: { xs: 1, sm: 0 },
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                        Material Certificate Details
                      </Typography>
                      <TextField
                        select
                        size="small"
                        value={mtrMode}
                        onChange={e => setMtrMode(e.target.value)}
                        sx={{
                          minWidth: 160,
                          bgcolor: '#f8f9fb',
                          borderRadius: 1,
                          fontSize: 14,
                          '& .MuiOutlinedInput-root': { height: 32 }
                        }}
                      >
                        <MenuItem value="data">Data Mode</MenuItem>
                        <MenuItem value="pdf">PDF Mode</MenuItem>
                        <MenuItem value="data+pdf">Data + PDF Mode</MenuItem>
                      </TextField>
                    </Paper>
                    {/* End card-like header */}
                    {/* Error Alert if any */}
                      {apiResponse && (apiResponse.error || apiResponse.errorMessage || apiResponse.errorType || apiResponse === 'Internal Server Error' || typeof apiResponse === 'string') ? (
                        <Alert 
                          severity="error" 
                          sx={{ 
                            mb: 2,
                            '& .MuiAlert-message': {
                              fontSize: '14px'
                            }
                          }}
                        >
                          {typeof apiResponse === 'string' ? apiResponse : (apiResponse.error || apiResponse.errorMessage || apiResponse.errorType || 'Unknown error')}
                        </Alert>
                    ) : (
                      <Box
                        sx={{
                          display: mtrMode === 'data+pdf' ? { xs: 'block', md: 'flex' } : 'block',
                          gap: mtrMode === 'data+pdf' ? 2 : 0,
                          alignItems: 'flex-start',
                        }}
                      >
                        {/* PDF Viewer */}
                        {(mtrMode === 'pdf' || mtrMode === 'data+pdf') && uploadedFile && uploadedFile.type === 'application/pdf' && (
                          <Box
                            sx={{
                              flex: mtrMode === 'data+pdf' ? 1 : 'unset',
                              width: mtrMode === 'data+pdf' ? { xs: '100%', md: '50%' } : '100%',
                              mb: mtrMode === 'data+pdf' ? { xs: 2, md: 0 } : 2,
                              minWidth: 0,
                              maxWidth: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              bgcolor: '#fff',
                              borderRadius: 2,
                              p: 2,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                              height: mtrMode === 'data+pdf' ? 700 : 'auto',
                              overflowY: mtrMode === 'data+pdf' ? 'auto' : 'visible',
                            }}
                          >
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexWrap: 'wrap',
                              gap: { xs: 1, sm: 2 },
                              mb: 2,
                              width: '100%',
                              px: { xs: 0.5, sm: 0 },
                            }}>
                              {/* Paging */}
                              <Button onClick={goToPrevPage} disabled={pageNumber <= 1} size="small" sx={{ minWidth: 32, p: 0, flexShrink: 0 }}>
                                <ArrowBackIosNewIcon fontSize="small" />
                              </Button>
                              <Typography sx={{ minWidth: { xs: 40, sm: 60 }, textAlign: 'center', fontSize: 16, flexShrink: 1, mx: { xs: 0.5, sm: 1 } }}>{pageNumber} of {numPages || 1}</Typography>
                              <Button onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)} size="small" sx={{ minWidth: 32, p: 0, flexShrink: 0 }}>
                                <ArrowForwardIosIcon fontSize="small" />
                              </Button>
                              {/* Zoom controls */}
                              {(mtrMode === 'pdf' || (mtrMode === 'data+pdf' && isSmallScreen)) && <>
                                <Button onClick={zoomOut} size="small" disabled={scale <= 0.5} sx={{ minWidth: 32, p: 0, flexShrink: 0 }}>
                                  <RemoveIcon fontSize="small" />
                                </Button>
                                <Typography sx={{ minWidth: 32, textAlign: 'center', fontSize: 16, flexShrink: 1, mx: { xs: 0.5, sm: 1 } }}>{Math.round(scale * 100)}%</Typography>
                                <Button onClick={zoomIn} size="small" disabled={scale >= 1.5} sx={{ minWidth: 32, p: 0, flexShrink: 0 }}>
                                  <AddIcon fontSize="small" />
                                </Button>
                              </>}
                            </Box>
                            <Box className="pdf-container" sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, overflow: 'auto' }}>
                              <Document
                                file={uploadedFile}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div>Loading PDF...</div>}
                                error={<div>Failed to load PDF!</div>}
                              >
                                <Page 
                                  pageNumber={pageNumber}
                                  scale={mtrMode === 'pdf' || (mtrMode === 'data+pdf' && isSmallScreen) ? scale : 1.0}
                                  width={mtrMode === 'data+pdf' && !isSmallScreen ? 400 : undefined}
                                  renderTextLayer={true}
                                  renderAnnotationLayer={true}
                                />
                              </Document>
                            </Box>
                          </Box>
                        )}
                        {/* Table */}
                        {(mtrMode === 'data' || mtrMode === 'data+pdf') && apiResponse && apiResponse.extracted_mtr_keys && apiResponse.extracted_mtr_keys.response && (
                          <Box
                            sx={{
                              flex: mtrMode === 'data+pdf' ? 1 : 'unset',
                              width: mtrMode === 'data+pdf' ? { xs: '100%', md: '50%' } : '100%',
                              minWidth: 0,
                              maxWidth: '100%',
                              bgcolor: '#fff',
                              borderRadius: 2,
                              p: 2,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                              display: 'block',
                              height: mtrMode === 'data+pdf' ? 700 : 'auto',
                              overflowY: mtrMode === 'data+pdf' ? 'auto' : 'visible',
                            }}
                          >
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
                              <thead style={{ background: '#f3f4f6' }}>
                                <tr>
                                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444', width: '50%' }}>Field</th>
                                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444', width: '50%' }}>Value</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(apiResponse.extracted_mtr_keys.response).flatMap(([category, fields]) =>
                                  Object.entries(fields).map(([key, value]) => {
                                    const isEditing = editingMtrCell && editingMtrCell.category === category && editingMtrCell.key === key;
                                    let localValue =
                                      editableMtrData[category] && editableMtrData[category][key] !== undefined
                                        ? editableMtrData[category][key]
                                        : value === null || value === undefined ? '' : value.toString();
                                    if (typeof localValue === 'object' && localValue !== null) {
                                      localValue = JSON.stringify(localValue);
                                  }
                                  return (
                                      <tr key={category + '-' + key} className="border-t border-gray-200">
                                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#444', width: '50%' }}>
                                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                      </td>
                                        <td
                                          style={{ padding: '12px 16px', fontSize: 14, color: '#444', width: '50%', cursor: 'pointer' }}
                                          onClick={() => setEditingMtrCell({ category, key })}
                                        >
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={localValue}
                                              autoFocus
                                              style={{ fontSize: 14, width: '100%', padding: 4 }}
                                              onChange={e => {
                                                setEditableMtrData(prev => ({
                                                  ...prev,
                                                  [category]: {
                                                    ...prev[category],
                                                    [key]: e.target.value,
                                                  },
                                                }));
                                              }}
                                              onBlur={() => setEditingMtrCell(null)}
                                              onKeyDown={e => {
                                                if (e.key === 'Enter') setEditingMtrCell(null);
                                              }}
                                            />
                                          ) : (
                                            localValue
                                          )}
                                      </td>
                                    </tr>
                                  );
                                  })
                                )}
                              </tbody>
                            </table>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>
                )}
                {/* Step 4: Unified Spec Matching Table UI */}
                {activeStep === 3 && (
                  <Paper elevation={0} sx={{
                    p: 3,
                    mb: 4,
                    bgcolor: '#f8f9fb',
                    borderRadius: 2,
                    maxWidth: 1000,
                    mx: 'auto',
                  }}>
                    {/* Card-like header with dropdown */}
                    <Paper
                      elevation={0}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        bgcolor: '#fff',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        mb: 2,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        gap: { xs: 1, sm: 0 },
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                        Unified Spec Matching
                      </Typography>
                      <TextField
                        select
                        size="small"
                        value={mtrMode}
                        onChange={e => setMtrMode(e.target.value)}
                        sx={{
                          minWidth: 160,
                          bgcolor: '#f8f9fb',
                          borderRadius: 1,
                          fontSize: 14,
                          '& .MuiOutlinedInput-root': { height: 32 }
                        }}
                      >
                        <MenuItem value="data">Data Mode</MenuItem>
                        <MenuItem value="pdf">PDF Mode</MenuItem>
                        <MenuItem value="data+pdf">Data + PDF Mode</MenuItem>
                      </TextField>
                    </Paper>
                    {/* End card-like header */}
                    {/* Error Alert if any */}
                    {apiResponse && (apiResponse.error || apiResponse.errorMessage || apiResponse.errorType || apiResponse === 'Internal Server Error' || typeof apiResponse === 'string') ? (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 2,
                          '& .MuiAlert-message': {
                            fontSize: '14px'
                          }
                        }}
                      >
                        {typeof apiResponse === 'string' ? apiResponse : (apiResponse.error || apiResponse.errorMessage || apiResponse.errorType || 'Unknown error')}
                      </Alert>
                    ) : (
                      <Box
                        sx={{
                          display: mtrMode === 'data+pdf' ? { xs: 'block', md: 'flex' } : 'block',
                          gap: mtrMode === 'data+pdf' ? 2 : 0,
                          alignItems: 'flex-start',
                        }}
                      >
                        {/* PDF Viewer */}
                        {(mtrMode === 'pdf' || mtrMode === 'data+pdf') && uploadedFile && uploadedFile.type === 'application/pdf' && (
                          <Box
                            sx={{
                              flex: mtrMode === 'data+pdf' ? 1 : 'unset',
                              width: mtrMode === 'data+pdf' ? { xs: '100%', md: '50%' } : '100%',
                              mb: mtrMode === 'data+pdf' ? { xs: 2, md: 0 } : 2,
                              minWidth: 0,
                              maxWidth: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              bgcolor: '#fff',
                              borderRadius: 2,
                              p: 2,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                              height: mtrMode === 'data+pdf' ? 700 : 'auto',
                              overflowY: mtrMode === 'data+pdf' ? 'auto' : 'visible',
                            }}
                          >
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexWrap: 'wrap',
                              gap: { xs: 1, sm: 2 },
                              mb: 2,
                              width: '100%',
                              px: { xs: 0.5, sm: 0 },
                            }}>
                              {/* Paging */}
                              <Button onClick={goToPrevPage} disabled={pageNumber <= 1} size="small" sx={{ minWidth: 32, p: 0, flexShrink: 0 }}>
                                <ArrowBackIosNewIcon fontSize="small" />
                              </Button>
                              <Typography sx={{ minWidth: { xs: 40, sm: 60 }, textAlign: 'center', fontSize: 16, flexShrink: 1, mx: { xs: 0.5, sm: 1 } }}>{pageNumber} of {numPages || 1}</Typography>
                              <Button onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)} size="small" sx={{ minWidth: 32, p: 0, flexShrink: 0 }}>
                                <ArrowForwardIosIcon fontSize="small" />
                              </Button>
                              {/* Zoom controls */}
                              {(mtrMode === 'pdf' || (mtrMode === 'data+pdf' && isSmallScreen)) && <>
                                <Button onClick={zoomOut} size="small" disabled={scale <= 0.5} sx={{ minWidth: 32, p: 0, flexShrink: 0 }}>
                                  <RemoveIcon fontSize="small" />
                                </Button>
                                <Typography sx={{ minWidth: 32, textAlign: 'center', fontSize: 16, flexShrink: 1, mx: { xs: 0.5, sm: 1 } }}>{Math.round(scale * 100)}%</Typography>
                                <Button onClick={zoomIn} size="small" disabled={scale >= 1.5} sx={{ minWidth: 32, p: 0, flexShrink: 0 }}>
                                  <AddIcon fontSize="small" />
                                </Button>
                              </>}
                            </Box>
                            <Box className="pdf-container" sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, overflow: 'auto' }}>
                              <Document
                                file={uploadedFile}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div>Loading PDF...</div>}
                                error={<div>Failed to load PDF!</div>}
                              >
                                <Page 
                                  pageNumber={pageNumber}
                                  scale={mtrMode === 'pdf' || (mtrMode === 'data+pdf' && isSmallScreen) ? scale : 1.0}
                                  width={mtrMode === 'data+pdf' && !isSmallScreen ? 400 : undefined}
                                  renderTextLayer={true}
                                  renderAnnotationLayer={true}
                                />
                              </Document>
                            </Box>
                          </Box>
                        )}
                        {/* Table */}
                        {(mtrMode === 'data' || mtrMode === 'data+pdf') && apiResponse && (
                          <Box
                            sx={{
                              flex: mtrMode === 'data+pdf' ? 1 : 'unset',
                              width: mtrMode === 'data+pdf' ? { xs: '100%', md: '50%' } : '100%',
                              minWidth: 0,
                              maxWidth: '100%',
                              bgcolor: '#fff',
                              borderRadius: 2,
                              p: 2,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                              display: 'block',
                              height: mtrMode === 'data+pdf' ? 700 : 'auto',
                              overflowY: mtrMode === 'data+pdf' ? 'auto' : 'visible',
                            }}
                          >
                            {Object.entries(apiResponse).map(([specId, specData]) => {
                              const resultsArr = specData.unified_report || [];
                              return (
                                <Box key={specId} sx={{ mb: 4 }}>
                                  <Typography 
                                    sx={{ 
                                      fontWeight: 600, 
                                      fontSize: 16, 
                                      mb: 2, 
                                      color: '#222',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        color: '#4285f4'
                                      },
                                      bgcolor: selectedSpecId === specId ? '#e8f0fe' : 'transparent',
                                      p: 1,
                                      borderRadius: 1
                                    }}
                                    onClick={() => {
                                      setSelectedSpecId(specId);
                                      console.log('Selected Specification ID:', specId);
                                    }}
                                  >
                                    Specification ID: {specId}
                                  </Typography>
                                  <Box sx={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
                                      <thead style={{ background: '#f3f4f6' }}>
                                        <tr>
                                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Checkpoint</th>
                                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>MTR</th>
                                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Unified</th>
                                          <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Status</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {resultsArr.map((row, idx) => {
                                          const isEditingMtr = editingUnifiedCell && editingUnifiedCell.specId === specId && editingUnifiedCell.rowIndex === idx && editingUnifiedCell.field === 'mtr';
                                          const isEditingUnified = editingUnifiedCell && editingUnifiedCell.specId === specId && editingUnifiedCell.rowIndex === idx && editingUnifiedCell.field === 'unified';
                                          
                                          const formatValue = (val) => {
                                            if (val === null || val === undefined) return '';
                                            if (typeof val === 'object') {
                                              return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(', ');
                                            }
                                            return val;
                                          };

                                          const getLocalValue = (field) => {
                                            const key = `${specId}-${idx}-${field}`;
                                            return editableUnifiedSpec[key] !== undefined ? editableUnifiedSpec[key] : formatValue(row[field]);
                                          };

                                          return (
                                            <tr key={row.checkpoint + '-' + idx} className="border-t border-gray-200">
                                              <td style={{ padding: '12px 16px', fontSize: 14, color: '#444' }}>{row.checkpoint}</td>
                                              <td 
                                                style={{ padding: '12px 16px', fontSize: 14, color: '#444', cursor: 'pointer' }}
                                                onClick={() => setEditingUnifiedCell({ specId, rowIndex: idx, field: 'mtr' })}
                                              >
                                                {isEditingMtr ? (
                                                  <input
                                                    type="text"
                                                    value={getLocalValue('mtr')}
                                                    autoFocus
                                                    style={{ fontSize: 14, width: '100%', padding: 4 }}
                                                    onChange={e => {
                                                      setEditableUnifiedSpec(prev => ({
                                                        ...prev,
                                                        [`${specId}-${idx}-mtr`]: e.target.value,
                                                      }));
                                                    }}
                                                    onBlur={() => setEditingUnifiedCell(null)}
                                                    onKeyDown={e => {
                                                      if (e.key === 'Enter') setEditingUnifiedCell(null);
                                                    }}
                                                  />
                                                ) : (
                                                  getLocalValue('mtr')
                                                )}
                                              </td>
                                              <td 
                                                style={{ padding: '12px 16px', fontSize: 14, color: '#444', cursor: 'pointer' }}
                                                onClick={() => setEditingUnifiedCell({ specId, rowIndex: idx, field: 'unified' })}
                                              >
                                                {isEditingUnified ? (
                                                  <input
                                                    type="text"
                                                    value={getLocalValue('unified')}
                                                    autoFocus
                                                    style={{ fontSize: 14, width: '100%', padding: 4 }}
                                                    onChange={e => {
                                                      setEditableUnifiedSpec(prev => ({
                                                        ...prev,
                                                        [`${specId}-${idx}-unified`]: e.target.value,
                                                      }));
                                                    }}
                                                    onBlur={() => setEditingUnifiedCell(null)}
                                                    onKeyDown={e => {
                                                      if (e.key === 'Enter') setEditingUnifiedCell(null);
                                                    }}
                                                  />
                                                ) : (
                                                  getLocalValue('unified')
                                                )}
                                              </td>
                                              <td style={{ padding: '12px 16px', fontSize: 14 }}>
                                                {row.status === 'Pass' && (
                                                  <span style={{
                                                    display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                                    background: '#e6f4ea', color: '#188038', fontWeight: 500, fontSize: 14, border: '1px solid #b7e1cd', verticalAlign: 'middle'
                                                  }}>
                                                    <span style={{ fontSize: 16, marginRight: 6 }}>✅</span> Pass
                                                  </span>
                                                )}
                                                {row.status === 'Fail' && (
                                                  <span style={{
                                                    display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                                    background: '#fbeaea', color: '#d93025', fontWeight: 500, fontSize: 14, border: '1px solid #fbcaca', verticalAlign: 'middle'
                                                  }}>
                                                    <span style={{ fontSize: 16, marginRight: 6 }}>❌</span> Fail
                                                  </span>
                                                )}
                                                {(row.status === 'Review' || row.status === 'Warning') && (
                                                  <span style={{
                                                    display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                                    background: '#fff4e5', color: '#e58900', fontWeight: 500, fontSize: 14, border: '1px solid #ffe0b2', verticalAlign: 'middle'
                                                  }}>
                                                    <span style={{ fontSize: 16, marginRight: 6 }}>⚠️</span> {row.status}
                                                  </span>
                                                )}
                                                {!(row.status === 'Pass' || row.status === 'Fail' || row.status === 'Review' || row.status === 'Warning') && (
                                                  <span style={{ fontSize: 14, color: '#444' }}>{row.status}</span>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>
                )}
                {/* Step 5: Comparison Agents Table UI */}
                {activeStep === 4 && (
                  <Paper elevation={0} sx={{
                    p: 3,
                    mb: 4,
                    bgcolor: '#f8f9fb',
                    borderRadius: 2,
                    maxWidth: 1100,
                    mx: 'auto',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
                        Comparison Agents
                      </Typography>
                      <TextField
                        select
                        size="small"
                        value="Export as"
                        sx={{ minWidth: 120, bgcolor: '#fff', borderRadius: 1 }}
                        SelectProps={{ native: true }}
                      >
                        <option value="Export as">Export as</option>
                        <option value="PDF">PDF</option>
                        <option value="Excel">Excel</option>
                      </TextField>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <Button variant="contained" sx={{ bgcolor: '#4285f4', color: '#fff', fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 3, py: 1, fontSize: 15, boxShadow: 'none', '&:hover': { bgcolor: '#1a73e8' } }}>Open AI Agent</Button>
                      <Button variant="outlined" sx={{ color: '#222', borderColor: '#e0e0e0', fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 3, py: 1, fontSize: 15, bgcolor: '#fff', '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' } }}>Anthropic Comparison Agent</Button>
                    </Box>
                    <Box sx={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
                        <thead style={{ background: '#f3f4f6' }}>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Fields</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Type</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>MTR</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Unified Spec</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { field: 'Certificate ID', type: 'string', mtr: 'HT12086595F', spec: '85~95k', result: 'fail' },
                            { field: 'Material Grade', type: 'string', mtr: '4140 80KSI', spec: '100~110k', result: 'pass' },
                            { field: 'Heat/Lot Number', type: 'string', mtr: '20259782/122154150', spec: '>28%', result: 'fail' },
                            { field: 'Dimensions', type: 'string', mtr: '133.35 mm x 28.448 mm', spec: '<20', result: 'pass' },
                            { field: 'Delivery Condition', type: 'string', mtr: 'Quenched and Tempered', spec: '85~95k', result: 'pass' },
                            { field: 'Manufacturing Route', type: 'string', mtr: 'EAF + LF + RH+ VD + CC', spec: '100~110k', result: 'fail' },
                            { field: 'Reduction Ratio', type: 'float', mtr: '9.4', spec: '>28%', result: 'pass' },
                            { field: 'Chemical Composition', type: 'JSON', mtr: '{"C": "0.39%", "Mn": "0.93%"}', spec: '<20', result: 'pass' },
                            { field: 'Mechanical Props', type: 'JSON', mtr: '{"Yield": "80 KSI"}', spec: '85~95k', result: 'fail' },
                            { field: 'Hardness', type: 'float', mtr: '22.5 HRC', spec: '100~110k', result: 'pass' },
                            { field: 'Charpy Test', type: 'JSON', mtr: '{"Temp": "-10°C", "Energy": "42J"}', spec: '>28%', result: 'pass' },
                            { field: 'NDT Results', type: 'JSON', mtr: '{"UT": "ASTM A388"}', spec: '<20', result: 'pass' },
                          ].map(({ field, type, mtr, spec, result }) => (
                            <tr key={field}>
                              <td style={{ padding: '10px 16px' }}>{field}</td>
                              <td style={{ padding: '10px 16px' }}>{type}</td>
                              <td style={{ padding: '10px 16px' }}>{mtr}</td>
                              <td style={{ padding: '10px 16px' }}>{spec}</td>
                              <td style={{ padding: '10px 16px' }}>
                                {result === 'pass' && (
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                    background: '#e6f4ea', color: '#188038', fontWeight: 500, fontSize: 14, border: '1px solid #b7e1cd'
                                  }}>
                                    ✅ Pass
                                  </span>
                                )}
                                {result === 'fail' && (
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                    background: '#fbeaea', color: '#d93025', fontWeight: 500, fontSize: 14, border: '1px solid #fbcaca'
                                  }}>
                                    ❌ Fail
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </Paper>
                )}
                {/* Step 6: Quality Check AI Table UI */}
                {activeStep === 5 && (
                  <Paper elevation={0} sx={{
                    p: 0,
                    mb: 4,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    borderRadius: 2,
                    maxWidth: 1100,
                    mx: 'auto',
                  }}>
                    {/* Header Bar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f8f9fb', borderRadius: 2, px: 2, py: 1, mb: 2 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#222' }}>
                        Quality Check AI
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" sx={{ color: '#222', borderColor: '#e0e0e0', fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 2.5, py: 1, fontSize: 15, bgcolor: '#fff', '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' } }}>View Material Certificate</Button>
                        <Button variant="outlined" sx={{ color: '#222', borderColor: '#e0e0e0', fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 2.5, py: 1, fontSize: 15, bgcolor: '#fff', '&:hover': { borderColor: '#bdbdbd', bgcolor: '#f5f5f5' } }}>View Unified specification</Button>
                        <TextField
                          select
                          size="small"
                          value="Export as"
                          sx={{ minWidth: 120, bgcolor: '#fff', borderRadius: 1, '& .MuiSelect-icon': { display: 'none' } }}
                          SelectProps={{ native: true, IconComponent: () => <span style={{ marginLeft: 4, fontSize: 18 }}>⭳</span> }}
                          InputProps={{
                            endAdornment: (
                              <span style={{ marginLeft: 4, fontSize: 18, color: '#888' }}>⭳</span>
                            )
                          }}
                        >
                          <option value="Export as">Export as</option>
                          <option value="PDF">PDF</option>
                          <option value="Excel">Excel</option>
                        </TextField>
                      </Box>
                    </Box>
                    {/* Table */}
                    <Box sx={{ overflowX: 'auto', px: 2, pb: 2 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
                        <thead style={{ background: '#f3f4f6' }}>
                          <tr>
                            {apiResponse && Object.keys(Array.isArray(apiResponse.result) ? apiResponse.result[0] : apiResponse).map((key) => (
                              <th key={key} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>
                                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {apiResponse && (
                            Array.isArray(apiResponse.result) ? apiResponse.result : [apiResponse]
                          ).map((item, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              {Object.entries(item).map(([key, value]) => (
                                <td key={key} style={{ padding: '12px 16px', fontSize: 14, color: '#444' }}>
                                  {key === 'Status' ? (
                                    value === 'Pass' && (
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                        background: '#e6f4ea', color: '#188038', fontWeight: 500, fontSize: 14, border: '1px solid #b7e1cd', verticalAlign: 'middle'
                                      }}>
                                        <span style={{ fontSize: 16, marginRight: 6 }}>✅</span> Pass
                                      </span>
                                    ) || value === 'Fail' && (
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                        background: '#fbeaea', color: '#d93025', fontWeight: 500, fontSize: 14, border: '1px solid #fbcaca', verticalAlign: 'middle'
                                      }}>
                                        <span style={{ fontSize: 16, marginRight: 6 }}>❌</span> Fail
                                      </span>
                                    ) || value === 'Review' && (
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                        background: '#fff4e5', color: '#e58900', fontWeight: 500, fontSize: 14, border: '1px solid #ffe0b2', verticalAlign: 'middle'
                                      }}>
                                        <span style={{ fontSize: 16, marginRight: 6 }}>⚠️</span> Review
                                      </span>
                                    )
                                  ) : value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </Paper>
                )}
                {/* Step 7: Final Report Review Table UI */}
                {activeStep === 6 && (
                  <Paper elevation={0} sx={{
                    p: 0,
                    mb: 4,
                    bgcolor: 'transparent',
                    boxShadow: 'none',
                    borderRadius: 2,
                    maxWidth: 1100,
                    mx: 'auto',
                  }}>
                    {/* Header Bar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8f9fb', borderRadius: 2, px: 2, py: 1, mb: 2 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#222' }}>
                        Final Report Review
                      </Typography>
                    </Box>
                    {/* Table */}
                    <Box sx={{ overflowX: 'auto', px: 2, pb: 2 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
                        <thead style={{ background: '#f3f4f6' }}>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Checkpoint</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Category</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Field</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>MTR</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Unified</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 15, color: '#444' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                        {apiResponse && (
                            Array.isArray(apiResponse.openai_final_report) ? apiResponse.openai_final_report : [apiResponse]
                          ).map((item, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td style={{ padding: '12px 16px', fontSize: 14, color: '#444' }}>{item.checkpoint}</td>
                              <td style={{ padding: '12px 16px', fontSize: 14, color: '#444' }}>{item.category}</td>
                              <td style={{ padding: '12px 16px', fontSize: 14, color: '#444' }}>{item.field}</td>
                              <td style={{ padding: '12px 16px', fontSize: 14, color: '#444' }}>{item.MTR}</td>
                              <td style={{ padding: '12px 16px', fontSize: 14, color: '#444' }}>{item.Unified}</td>
                              <td style={{ padding: '12px 16px', fontSize: 14 }}>
                                {editingStatusRow === index ? (
                                  <select
                                    value={statusChanges[index] || item.Status}
                                    autoFocus
                                    onChange={e => {
                                      setStatusChanges(prev => ({ ...prev, [index]: e.target.value }));
                                      setEditingStatusRow(null);
                                    }}
                                    onBlur={() => setEditingStatusRow(null)}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '16px',
                                      border: '1px solid',
                                      fontSize: '14px',
                                      fontWeight: 500,
                                      cursor: 'pointer',
                                      ...(statusChanges[index] || item.Status) === 'Pass' ? {
                                        background: '#e6f4ea', color: '#188038', borderColor: '#b7e1cd'
                                      } : (statusChanges[index] || item.Status) === 'Fail' ? {
                                        background: '#fbeaea', color: '#d93025', borderColor: '#fbcaca'
                                      } : {
                                        background: '#fff4e5', color: '#e58900', borderColor: '#ffe0b2'
                                      }
                                    }}
                                  >
                                    <option value="Pass">✅ Pass</option>
                                    <option value="Fail">❌ Fail</option>
                                    <option value="Review">⚠️ Review</option>
                                  </select>
                                ) : (
                                  <span
                                    onClick={() => setEditingStatusRow(index)}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', padding: '2px 12px', borderRadius: 16,
                                      fontWeight: 500, fontSize: 14, border: '1px solid', cursor: 'pointer',
                                      ...(statusChanges[index] || item.Status) === 'Pass' ? {
                                        background: '#e6f4ea', color: '#188038', borderColor: '#b7e1cd'
                                      } : (statusChanges[index] || item.Status) === 'Fail' ? {
                                        background: '#fbeaea', color: '#d93025', borderColor: '#fbcaca'
                                      } : {
                                        background: '#fff4e5', color: '#e58900', borderColor: '#ffe0b2'
                                      }
                                    }}
                                  >
                                    {(statusChanges[index] || item.Status) === 'Pass' && <span style={{ fontSize: 16, marginRight: 6 }}>✅</span>}
                                    {(statusChanges[index] || item.Status) === 'Fail' && <span style={{ fontSize: 16, marginRight: 6 }}>❌</span>}
                                    {(statusChanges[index] || item.Status) === 'Review' && <span style={{ fontSize: 16, marginRight: 6 }}>⚠️</span>}
                                    {statusChanges[index] || item.Status}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </Paper>
                )}
                {/* Continue & Back Buttons */}
                {activeStep !== 6 ? (
                  <Box sx={{ position: 'relative', minHeight: 80, mt: 6, mb:4 }}>
                    {/* Show back button for all steps including step 1 */}
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        color: '#4285f4',
                        borderColor: '#4285f4',
                        px: 4,
                        py: 1.5,
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: 16,
                        textTransform: 'none',
                        '&:hover': { borderColor: '#1a73e8', bgcolor: '#e8f0fe' },
                        minWidth: 160,
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                      }}
                      onClick={() => {
                        if (activeStep === 0) {
                          // If we're in step 1, go back to dashboard
                          setaddMtr(false);
                          // Reset all states when going back to dashboard
                          setApiResponse(null);
                          setStep1Response(null);
                          setStep2Response(null);
                          setStep3Response(null);
                          setStep4Response(null);
                          setUploadedFile(null);
                          setMdsName('');
                          setTypeValue('');
                          setMaterialType('');
                          setMtrKeysId(null);
                          setActiveStep(0);
                        } else {
                          // For other steps, store current response before going back
                          if (activeStep === 2) {
                            setStep2Response(apiResponse);
                          } else if (activeStep === 3) {
                            setStep3Response(apiResponse);
                          } else if (activeStep === 4) {
                            setStep4Response(apiResponse);
                          }

                          // Restore previous response when going back
                          if (activeStep === 2) {
                            setApiResponse(step1Response);
                          } else if (activeStep === 3) {
                            setApiResponse(step2Response);
                          } else if (activeStep === 4) {
                            setApiResponse(step3Response);
                          } else if (activeStep === 5) {
                            setApiResponse(step4Response);
                          }

                          setActiveStep((prev) => prev - 1);
                        }
                      }}
                    >
                      Back
                    </Button>
                    {activeStep < steps.length - 1 && (
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: '#4285f4',
                          color: '#fff',
                          px: 4,
                          py: 1.5,
                          borderRadius: '10px',
                          fontWeight: 600,
                          fontSize: 16,
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#1a73e8' },
                          minWidth: 160,
                          position: 'absolute',
                          right: 0,
                          bottom: 0,
                        }}
                        disabled={loading}
                        onClick={() => {
                          if (activeStep === 0) {
                            if (!uploadedFile) {
                              setShowUploadError(true);
                              setLoading(false);
                              return;
                            }
                            if (!mdsName.trim()) {
                              setMdsNameError(true);
                              setLoading(false);
                              return;
                            }
                            
                            setLoading(true);
                            
                            const formData = new FormData();
                            formData.append('file', uploadedFile);
                            formData.append('mds_name', mdsName);

                            fetch('/api/proxy/supervisior', {
                              method: 'POST',
                              body: formData
                            })
                            .then(response => response.json())
                            .then(data => {
                              console.log('Supervisor Decision API Response:', data);
                              console.log('Type from API:', data?.decision?.type);
                              setApiResponse(data);
                              setStep1Response(data);
                              setTypeValue(data?.decision?.type);
                              setLoading(false);
                              setActiveStep((prev) => prev + 1);
                            })
                            .catch(error => {
                              console.error('Error calling supervisor decision API:', error);
                              setApiResponse(error);
                              setLoading(false);
                            });
                          } else if (activeStep === 1) {
                            setLoading(true);
                            
                            const formData = new FormData();
                            formData.append('pdf_text_id', apiResponse?.pdf_text || '');

                            console.log('Sending pdf_text_id to extract key API:', apiResponse?.pdf_text || '');

                            fetch('/api/proxy/extractkey', {
                              method: 'POST',
                              body: formData
                            })
                            .then(response => response.json())
                            .then(data => {
                              console.log('Extract Keys API Response:', data);
                              setApiResponse(data);
                              setStep2Response(data);
                              if (data?.material_identification?.material_grade) {
                                setMaterialType(data.material_identification.material_grade);
                              }
                              if (data?.mtr_keys_id) {
                                setMtrKeysId(data.mtr_keys_id);
                              }
                              setLoading(false);
                              setActiveStep((prev) => prev + 1);
                            })
                            .catch(error => {
                              console.error('Error calling extract keys API:', error);
                              setApiResponse(error);
                              setLoading(false);
                            });
                          } else if (activeStep === 2) {
                            setLoading(true);
                            const formData = new FormData();
                            formData.append('mds_name', mdsName);
                            formData.append('grade_label', typeValue);
                            if (mtrKeysId) {
                              formData.append('mtr_id', mtrKeysId);
                            }
                            console.log('Sending to unified output API:', { 
                              mds_name: mdsName, 
                              grade_label: typeValue,
                              mtr_id: mtrKeysId
                            });
                            fetch('/api/proxy/getunifiedoutput', {
                              method: 'POST',
                              body: formData
                            })
                            .then(response => response.json())
                            .then(data => {
                              console.log('Unified Output API Response:', data);
                              setApiResponse(data);
                              setStep3Response(data);
                              setLoading(false);
                              setActiveStep((prev) => prev + 1);
                            })
                            .catch(error => {
                              console.error('Error calling unified output API:', error);
                              setApiResponse(error);
                              setLoading(false);
                            });
                          } else if (activeStep === 3) {
                            setLoading(true);
                            
                            // Check if we have the required data
                            if (!mtrKeysId || !selectedSpecId) {
                              setShowUnifiedFileError(true);
                              setLoading(false);
                              return;
                            }

                            const formData = new FormData();
                            formData.append('mtr_id', mtrKeysId);
                            formData.append('unified_file', selectedSpecId);

                            console.log('Sending to final report API:', {
                              mtr_id: mtrKeysId,
                              unified_file: selectedSpecId
                            });

                            fetch('/api/proxy/final', {
                              method: 'POST',
                              body: formData
                            })
                            .then(response => response.json())
                            .then(data => {
                              console.log('Final Report API Response:', data);
                              setApiResponse(data);
                          
                              setLoading(false);
                              // Skip steps 5 and 6, go directly to step 7 (Final Report Review)
                              setActiveStep(6);
                            })
                            .catch(error => {
                              console.error('Error calling final report API:', error);
                              setApiResponse(error);
                              setLoading(false);
                            });
                          } else {
                            setLoading(true);
                            setTimeout(() => {
                              setLoading(false);
                              setActiveStep((prev) => prev + 1);
                            }, 1500);
                          }
                        }}
                      >
                        Continue
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ position: 'relative', minHeight: 80, mt: 6, mb:4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        color: '#4285f4',
                        borderColor: '#4285f4',
                        px: 4,
                        py: 1.5,
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: 16,
                        textTransform: 'none',
                        '&:hover': { borderColor: '#1a73e8', bgcolor: '#e8f0fe' },
                        minWidth: 160,
                        position: 'absolute',
                        left: 0,
                        bottom: 0,
                      }}
                      onClick={() => {
                        // Navigate to step 4 (Unified Spec) instead of step 6
                        setActiveStep(3);
                        // Restore the unified spec response
                        setApiResponse(step3Response);
                      }}
                    >
                      Back
                    </Button>
                    <Box sx={{ display: 'flex', gap: 2, position: 'absolute', right: 0, bottom: 0 }}>
                      <Button
                        variant="outlined"
                        sx={{
                          color: '#222',
                          borderColor: '#e0e0e0',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 2,
                          px: 5,
                          py: 1.5,
                          fontSize: 16,
                          bgcolor: '#f3f4f6',
                          '&:hover': { borderColor: '#bdbdbd', bgcolor: '#e0e0e0' }
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: '#4285f4',
                          color: '#fff',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: 2,
                          px: 5,
                          py: 1.5,
                          fontSize: 16,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#1a73e8' }
                        }}
                        onClick={async () => {
                          try {
                            // Get the MTR ID that was stored from History page
                            const mtrId = localStorage.getItem('mtrId');
                            console.log('Using MTR ID for update:', mtrId);
                            
                            if (!mtrId) {
                              throw new Error('No MTR ID found. Please try again from the History page.');
                            }

                            // Get the final report data
                            const finalReportData = JSON.parse(localStorage.getItem('finalReportData') || '{}');
                            
                            // Call the update-report API with the stored MTR ID
                            const response = await fetch(`/api/proxy/update-report?record_id=${mtrId}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'accept': 'application/json'
                              },
                              body: JSON.stringify(finalReportData)
                            });

                            const data = await response.json();

                            if (!response.ok) {
                              throw new Error(data.error || `Failed to update report: ${response.status}`);
                            }

                            console.log('Update Report API Response:', data);

                            // Show success message
                            setShowUpdateSuccess(true);
                            setUpdateMessage('Report updated successfully!');

                            // Clear localStorage data
                            localStorage.removeItem('mtrId');
                            localStorage.removeItem('finalReportData');

                            // Navigate back to dashboard after a short delay
                            setTimeout(() => {
                              setaddMtr(false);
                              setActiveStep(0);
                            }, 1500);

                          } catch (error) {
                            console.error('Error updating report:', error);
                            setShowUpdateError(true);
                            setUpdateMessage(error.message || 'Failed to update report. Please try again.');
                          }
                        }}
                      >
                        Approve
                      </Button>
                    </Box>
                  </Box>
                )}
              </>
            )}
            {/* Upload error Snackbar */}
            <Snackbar
              open={showUploadError}
              autoHideDuration={3000}
              onClose={() => setShowUploadError(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert severity="error" onClose={() => setShowUploadError(false)}>
                Please upload a PDF or image before continuing.
              </Alert>
            </Snackbar>
            {/* Unified File Selection Error Snackbar */}
            <Snackbar
              open={showUnifiedFileError}
              autoHideDuration={3000}
              onClose={() => setShowUnifiedFileError(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert 
                severity="error" 
                onClose={() => setShowUnifiedFileError(false)}
                sx={{ 
                  width: '100%',
                  '& .MuiAlert-message': {
                    fontSize: '14px'
                  }
                }}
              >
                Please select a unified file before continuing
              </Alert>
            </Snackbar>
            {/* Record View Error Snackbar */}
            <Snackbar
              open={showRecordViewError}
              autoHideDuration={3000}
              onClose={() => setShowRecordViewError(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert 
                severity="error" 
                onClose={() => setShowRecordViewError(false)}
                sx={{ 
                  width: '100%',
                  '& .MuiAlert-message': {
                    fontSize: '14px'
                  }
                }}
              >
                {recordViewError}
              </Alert>
            </Snackbar>
            {/* Update Success Snackbar */}
            <Snackbar
              open={showUpdateSuccess}
              autoHideDuration={3000}
              onClose={() => setShowUpdateSuccess(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert 
                severity="success" 
                onClose={() => setShowUpdateSuccess(false)}
                sx={{ 
                  width: '100%',
                  '& .MuiAlert-message': {
                    fontSize: '14px'
                  }
                }}
              >
                {updateMessage}
              </Alert>
            </Snackbar>
            {/* Update Error Snackbar */}
            <Snackbar
              open={showUpdateError}
              autoHideDuration={3000}
              onClose={() => setShowUpdateError(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert 
                severity="error" 
                onClose={() => setShowUpdateError(false)}
                sx={{ 
                  width: '100%',
                  '& .MuiAlert-message': {
                    fontSize: '14px'
                  }
                }}
              >
                {updateMessage}
              </Alert>
            </Snackbar>
          </Box>
        )}
    </Box>
  );
} 
 
      
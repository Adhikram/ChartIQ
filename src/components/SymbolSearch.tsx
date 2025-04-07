import React, { useState, useEffect, useRef } from 'react';
import { TextField, IconButton, Box, InputAdornment, List, ListItem, ListItemText, Typography, Chip, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

interface SymbolSearchProps {
  onSearchSubmit: (symbol: string) => void;
  onAnalyze?: (symbol: string) => void;
}

interface SymbolResult {
  id: string;
  symbol: string;
  exchange: string;
  fullExchange: string;
  description: string;
  type: string;
  currency_code?: string;
  country?: string;
  typespecs?: string[];
}

// Asset type options for filtering
const assetTypes = [
  { value: '', label: 'All Types' },
  { value: 'stock', label: 'Stocks' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'forex', label: 'Forex' },
  { value: 'futures', label: 'Futures' },
  { value: 'index', label: 'Indices' },
  { value: 'bond', label: 'Bonds' },
  { value: 'fund', label: 'Funds/ETFs' },
  { value: 'economic', label: 'Economic' },
];

const SymbolSearch: React.FC<SymbolSearchProps> = ({ onSearchSubmit, onAnalyze }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<SymbolResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState('');
  const [remainingCount, setRemainingCount] = useState(0);
  
  // Add refs for click outside detection
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node) &&
        showResults
      ) {
        setShowResults(false);
      }
    };

    // Add event listener when dropdown is open
    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showResults) {
        setShowResults(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showResults]);

  // Fetch symbol search results from our enhanced API endpoint
  useEffect(() => {
    const fetchSymbolResults = async () => {
      if (searchInput.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        // Using our enhanced endpoint with type filtering
        let url = `/api/symbol-search?text=${encodeURIComponent(searchInput)}`;
        if (assetTypeFilter) {
          url += `&filter=${assetTypeFilter}`;
        }
        
        const response = await axios.get(url);
        setSearchResults(response.data.symbols || []);
        setRemainingCount(response.data.symbols_remaining || 0);
        setShowResults(true);
      } catch (error) {
        console.error('Error fetching symbol results:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchInput.trim().length >= 2) {
        fetchSymbolResults();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchInput, assetTypeFilter]);

  const handleSymbolSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput && searchInput.trim() !== '') {
      let formattedSymbol = searchInput.trim();
      if (!formattedSymbol.includes(':') && /^[A-Z0-9]+$/i.test(formattedSymbol)) {
        formattedSymbol = `BINANCE:${formattedSymbol.toUpperCase()}`;
      }
      onSearchSubmit(formattedSymbol);
      // Clear the search input after submission
      setSearchInput('');
      setShowResults(false);
    }
  };

  const handleSymbolSelect = (result: SymbolResult) => {
    // Get the properly formatted symbol ID
    const symbolId = result.id;
    console.log('Symbol selected from search results:', symbolId);
    
    // Use onAnalyze if provided, otherwise fall back to onSearchSubmit
    if (onAnalyze) {
      onAnalyze(symbolId);
    } else {
      onSearchSubmit(symbolId);
    }
    setSearchInput('');
    setShowResults(false);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'stock':
        return '#4CAF50';
      case 'fund':
        return '#FF9800';
      case 'bond':
        return '#2196F3';
      case 'crypto':
        return '#9C27B0';
      case 'forex':
        return '#E91E63';
      case 'futures':
        return '#795548';
      case 'index':
        return '#607D8B';
      case 'dr':
        return '#673AB7';
      default:
        return '#757575';
    }
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }} ref={searchContainerRef}>
      <Box 
        component="form" 
        onSubmit={handleSymbolSearchSubmit} 
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: 1,
          position: 'relative',
          flex: 1,
          '& .MuiTextField-root': {
            '& input': {
              color: '#333333 !important',
              background: 'none !important',
              fontWeight: '500 !important',
              caretColor: '#333333',
              '&::placeholder': {
                opacity: '1 !important',
                color: 'rgba(0, 0, 0, 0.5) !important',
                fontWeight: '400 !important',
              }
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.2) !important',
              borderWidth: '1px !important'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.3) !important'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(85, 185, 255, 0.7) !important',
              borderWidth: '1px !important'
            }
          }
        }}
      >
        <TextField
          placeholder="Search symbol (e.g. BTCUSDT, NASDAQ:AMZN)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => {
            // Show results again if there are search results and input has content
            if (searchResults.length > 0 && searchInput.trim().length >= 2) {
              setShowResults(true);
            }
          }}
          onBlur={(e) => {
            // Don't close if clicking on the search results dropdown
            if (searchResultsRef.current && searchResultsRef.current.contains(e.relatedTarget as Node)) {
              return;
            }
            
            // Use a short delay to allow for interactions with search results
            setTimeout(() => {
              if (document.activeElement !== searchResultsRef.current) {
                setShowResults(false);
              }
            }, 150);
          }}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            sx: {
              color: '#333333',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '4px 14px',
              height: '50px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
              },
              '&.Mui-focused': {
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(85, 185, 255, 0.3)',
              },
            },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  type="submit" 
                  size="medium" 
                  sx={{ 
                    color: '#ffffff',
                    backgroundColor: 'rgba(85, 185, 255, 0.85)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(85, 185, 255, 1)',
                      transform: 'scale(1.05)',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                    '&:disabled': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(85, 185, 255, 0.5)',
                    },
                    transition: 'all 0.2s ease'
                  }} 
                  aria-label="search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        {/* <FormControl 
          size="small" 
          sx={{ 
            minWidth: 120,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': {
              color: '#fff',
              borderRadius: '8px',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
                borderWidth: '1px',
              }
            },
            '& .MuiSelect-select': {
              padding: '6px 14px',
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#1976d2',
              }
            }
          }}
        >
          <InputLabel id="asset-type-label">Type</InputLabel>
          <Select
            labelId="asset-type-label"
            value={assetTypeFilter}
            onChange={(e) => setAssetTypeFilter(e.target.value)}
            label="Type"
          >
            {assetTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}
      </Box>
      
      {showResults && searchResults.length > 0 && (
        <Paper 
          ref={searchResultsRef}
          tabIndex={-1}
          sx={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            zIndex: 1000,
            mt: 1.2,
            maxHeight: '400px',
            overflow: 'auto',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            WebkitOverflowScrolling: 'touch',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(8px)',
            animation: 'dropdownFade 0.25s ease-out',
            '@keyframes dropdownFade': {
              '0%': { opacity: 0, transform: 'translateY(-10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            },
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(85, 185, 255, 0.5)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(85, 185, 255, 0.7)',
              }
            }
          }}
          elevation={8}
        >
          <List dense sx={{ py: 0.5 }}>
            {searchResults.map((result, index) => (
              <ListItem 
                key={`${result.id}-${index}`}
                button
                onClick={() => handleSymbolSelect(result)}
                sx={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(85, 185, 255, 0.1)',
                    transition: 'background-color 0.15s ease',
                  },
                  '&:active': {
                    backgroundColor: 'rgba(85, 185, 255, 0.2)',
                  },
                  padding: '0.9rem 1.2rem',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ 
                      display: 'grid',
                      gridTemplateColumns: 'auto auto 1fr', 
                      gap: 1.2,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      mb: 0.5
                    }}>
                      <Typography 
                        color="#333333" 
                        fontWeight="600" 
                        sx={{ 
                          fontSize: '0.95rem',
                          letterSpacing: '0.01em',
                          mr: 0.5
                        }}
                      >
                        {result.symbol}
                      </Typography>
                      <Chip 
                        label={result.exchange} 
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.07)',
                          height: '20px',
                          fontSize: '0.65rem',
                          color: 'rgba(0, 0, 0, 0.8)',
                          fontWeight: 500,
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        }} 
                      />
                      <Chip 
                        label={result.type.toUpperCase()} 
                        size="small"
                        sx={{ 
                          backgroundColor: getTypeColor(result.type),
                          height: '20px',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                          justifySelf: 'start',
                        }} 
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.8 }}>
                      <Typography 
                        variant="body2" 
                        color="rgba(0, 0, 0, 0.75)" 
                        component="span" 
                        sx={{ 
                          fontSize: '0.82rem',
                          lineHeight: 1.4,
                          display: 'block',
                          mb: 0.7,
                          fontWeight: 400,
                        }}
                      >
                        {result.description.replace(/<\/?em>/g, '')}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: 1.8, 
                        mt: 0.7,
                        alignItems: 'center' 
                      }}>
                        {result.currency_code && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(0, 0, 0, 0.75)',
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Box 
                              component="span" 
                              sx={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                backgroundColor: 'rgba(85, 185, 255, 0.75)',
                                display: 'inline-block',
                                mr: 0.8,
                              }} 
                            />
                            {result.currency_code}
                          </Typography>
                        )}
                      
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'rgba(0, 0, 0, 0.7)',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Box 
                            component="span" 
                            sx={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                              backgroundColor: 'rgba(85, 185, 255, 0.6)',
                              display: 'inline-block',
                              mr: 0.8,
                            }} 
                          />
                          {result.fullExchange}
                        </Typography>
                        {result.country && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(0, 0, 0, 0.7)',
                              fontSize: '0.7rem',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Box 
                              component="span" 
                              sx={{ 
                                width: '6px', 
                                height: '6px', 
                                borderRadius: '50%', 
                                backgroundColor: 'rgba(255, 215, 85, 0.6)',
                                display: 'inline-block',
                                mr: 0.8,
                              }} 
                            />
                            {result.country}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
            
            {remainingCount > 0 && (
              <ListItem sx={{ justifyContent: 'center', py: 1 }}>
                <Typography variant="caption" color="rgba(0, 0, 0, 0.5)">
                  + {remainingCount} more results available. Refine your search to see more specific results.
                </Typography>
              </ListItem>
            )}
          </List>
        </Paper>
      )}
      
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          mt: 1.2,
          py: 2,
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(8px)',
          animation: 'dropdownFade 0.25s ease-out',
          '@keyframes dropdownFade': {
            '0%': { opacity: 0, transform: 'translateY(-10px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          },
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
          }}>
            <Box
              sx={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(0, 0, 0, 0.1)',
                borderTop: '2px solid rgba(85, 185, 255, 0.9)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(0, 0, 0, 0.85)',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              Searching...
            </Typography>
          </Box>
        </Box>
      )}
      
      {showResults && searchResults.length === 0 && !loading && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            zIndex: 1000, 
            mt: 1.2,
            p: 2.5,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(8px)',
            animation: 'dropdownFade 0.25s ease-out',
            '@keyframes dropdownFade': {
              '0%': { opacity: 0, transform: 'translateY(-10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            },
          }}
          elevation={6}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(0, 0, 0, 0.7)',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box 
              component="span" 
              sx={{ 
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(85, 185, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="rgba(85, 185, 255, 0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="rgba(85, 185, 255, 0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16H12.01" stroke="rgba(85, 185, 255, 0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            No results found. Try a different search term or filter.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SymbolSearch; 
import React, { useState, useEffect, useRef } from 'react';
import { TextField, Box, InputAdornment, List, ListItem, Typography, Chip, Paper } from '@mui/material';
import axios from 'axios';

interface SymbolSelectorProps {
  onSymbolSelect: (symbol: string) => void;
  initialValue?: string;
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
}

const SymbolSelector: React.FC<SymbolSelectorProps> = ({ onSymbolSelect, initialValue }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<SymbolResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Refs for handling focus and clicks
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
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

  // Fetch symbol search results
  useEffect(() => {
    const fetchSymbolResults = async () => {
      if (searchInput.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const url = `/api/symbol-search?text=${encodeURIComponent(searchInput)}`;
        const response = await axios.get(url);
        setSearchResults(response.data.symbols || []);
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
  }, [searchInput]);

  const handleSymbolSelect = (result: SymbolResult) => {
    // Get the properly formatted symbol ID
    const symbolId = result.id;
    console.log('Symbol selected:', symbolId);
    
    onSymbolSelect(symbolId);
    setSearchInput('');
    setShowResults(false);
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'stock':
        return '#2E7D32'; // Green
      case 'crypto':
        return '#7B1FA2'; // Purple
      case 'forex':
        return '#1565C0'; // Blue
      case 'futures':
        return '#F57C00'; // Orange
      case 'index':
        return '#455A64'; // Bluegray
      default:
        return '#757575'; // Grey
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        position: 'relative',
        zIndex: 10,
        '& .MuiFormControl-root': {
          width: '100%'
        }
      }} 
      ref={searchContainerRef}
    >
      <TextField
        placeholder="Search for a symbol (e.g., AAPL, BTCUSDT)"
        value={searchInput}
        onChange={handleSearchInputChange}
        inputRef={inputRef}
        onFocus={() => {
          if (searchResults.length > 0 && searchInput.trim().length >= 2) {
            setShowResults(true);
          }
        }}
        variant="outlined"
        fullWidth
        autoComplete="off"
        InputProps={{
          sx: {
            color: '#333',
            backgroundColor: '#fff',
            borderRadius: '12px',
            fontSize: '0.95rem',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(16, 163, 127, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#10a37f',
              borderWidth: '1px',
            },
          },
          startAdornment: (
            <InputAdornment position="start">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="#10a37f" strokeWidth="2" />
                <path d="M21 21L16.65 16.65" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </InputAdornment>
          ),
          endAdornment: loading ? (
            <InputAdornment position="end">
              <Box
                sx={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(16, 163, 127, 0.1)',
                  borderTop: '2px solid #10a37f',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }}
              />
            </InputAdornment>
          ) : null,
        }}
      />
      
      {showResults && searchResults.length > 0 && (
        <Paper 
          elevation={3}
          sx={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            maxHeight: {
              xs: 'calc(50vh - 80px)', // Smaller on mobile
              sm: '350px',             // Larger on desktop
            },
            minWidth: '100%',
            width: 'auto',
            overflow: 'auto',
            mt: 1,
            zIndex: 1000,
            border: '1px solid rgba(16, 163, 127, 0.2)',
            borderRadius: '12px',
            animation: 'fadeIn 0.2s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(5px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            },
            '&::-webkit-scrollbar': {
              width: '5px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(16, 163, 127, 0.3)',
              borderRadius: '10px',
            }
          }}
        >
          <List sx={{ py: 0 }}>
            {searchResults.map((result, index) => (
              <ListItem 
                key={`${result.id}-${index}`}
                onClick={() => handleSymbolSelect(result)}
                sx={{
                  cursor: 'pointer',
                  py: 1.2,
                  px: 2,
                  borderBottom: index < searchResults.length - 1 ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 163, 127, 0.08)',
                  },
                  transition: 'background-color 0.15s ease',
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 0.5,
                    flexWrap: {xs: 'wrap', sm: 'nowrap'},
                    gap: 0.5
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      minWidth: 0,
                      flexGrow: 1
                    }}>
                      <Typography 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#10a37f', 
                          fontSize: '1rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {result.symbol}
                      </Typography>
                      <Chip 
                        label={result.exchange} 
                        size="small"
                        sx={{ 
                          height: '22px',
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(0, 0, 0, 0.06)',
                          color: 'rgba(0, 0, 0, 0.7)',
                          maxWidth: '70px',
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            padding: '0 8px'
                          }
                        }} 
                      />
                    </Box>
                    <Chip 
                      label={result.type.toUpperCase()} 
                      size="small"
                      sx={{ 
                        height: '22px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: `${getTypeColor(result.type)}20`,
                        color: getTypeColor(result.type),
                        border: `1px solid ${getTypeColor(result.type)}40`,
                        flexShrink: 0
                      }} 
                    />
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(0, 0, 0, 0.7)',
                      fontSize: '0.85rem',
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {result.description.replace(/<\/?em>/g, '')}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    mt: 0.5 
                  }}>
                    {result.currency_code && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(0, 0, 0, 0.5)',
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          borderRadius: '4px',
                          py: 0.2,
                          px: 0.5,
                        }}
                      >
                        {result.currency_code}
                      </Typography>
                    )}
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'rgba(0, 0, 0, 0.5)',
                        fontSize: '0.7rem',
                      }}
                    >
                      {result.fullExchange}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      {showResults && searchResults.length === 0 && !loading && searchInput.trim().length >= 2 && (
        <Paper 
          elevation={3}
          sx={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            mt: 1,
            p: 2,
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid rgba(16, 163, 127, 0.2)',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 1 
          }}>
            <Box sx={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(16, 163, 127, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16H12.01" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            <Typography sx={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '0.9rem' }}>
              No results found for "{searchInput}"
            </Typography>
            <Typography sx={{ color: 'rgba(0, 0, 0, 0.5)', fontSize: '0.8rem' }}>
              Try searching for a different symbol or check your spelling
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default SymbolSelector; 
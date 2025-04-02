import React, { useState, useEffect } from 'react';
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
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box 
        component="form" 
        onSubmit={handleSymbolSearchSubmit} 
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: 1,
          position: 'relative',
          flex: 1
        }}
      >
        <TextField
          placeholder="Search symbol (e.g. BTCUSDT, NASDAQ:AMZN)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          sx={{
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
              },
              '& .MuiInputBase-input': {
                padding: '10px 14px',
              }
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  type="submit" 
                  size="small" 
                  sx={{ 
                    color: '#1976d2',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    }
                  }} 
                  aria-label="search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl 
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
        </FormControl>
      </Box>
      
      {showResults && searchResults.length > 0 && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            zIndex: 10, 
            mt: 0.5,
            maxHeight: '400px',
            overflow: 'auto',
            backgroundColor: 'rgba(25, 32, 42, 0.95)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <List dense>
            {searchResults.map((result, index) => (
              <ListItem 
                key={`${result.id}-${index}`}
                button
                onClick={() => handleSymbolSelect(result)}
                sx={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                  },
                  p: 1.5
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography color="white" fontWeight="bold">
                        {result.symbol}
                      </Typography>
                      <Chip 
                        label={result.exchange} 
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          height: '20px',
                          fontSize: '0.65rem',
                          color: 'rgba(255, 255, 255, 0.8)'
                        }} 
                      />
                      <Chip 
                        label={result.type.toUpperCase()} 
                        size="small"
                        sx={{ 
                          backgroundColor: getTypeColor(result.type),
                          height: '20px',
                          fontSize: '0.65rem'
                        }} 
                      />
                      {result.currency_code && (
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {result.currency_code}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" component="span" sx={{ fontSize: '0.8rem' }}>
                        {result.description.replace(/<\/?em>/g, '')}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                          {result.fullExchange}
                        </Typography>
                        {result.country && (
                          <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
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
                <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">
                  + {remainingCount} more results available. Refine your search to see more specific results.
                </Typography>
              </ListItem>
            )}
          </List>
        </Paper>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
            Searching...
          </Typography>
        </Box>
      )}
      
      {showResults && searchResults.length === 0 && !loading && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            right: 0, 
            zIndex: 10, 
            mt: 0.5,
            p: 2,
            backgroundColor: 'rgba(25, 32, 42, 0.95)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            No results found. Try a different search term or filter.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SymbolSearch; 
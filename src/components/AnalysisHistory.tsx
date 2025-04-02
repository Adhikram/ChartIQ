import React from 'react';
import { Box, List, ListItem, ListItemText, Typography, Chip } from '@mui/material';
import { AnalysisItem, AnalysisHistoryProps } from '../types';

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  history,
  selectedAnalysisId,
  onSelect,
  sx
}) => {
  return (
    <Box sx={{ ...sx, overflow: 'auto' }}>
      <Typography variant="h6" sx={{ p: 2, color: 'primary.main' }}>
        Analysis History
      </Typography>
      <List>
        {history.map((analysis: AnalysisItem) => (
          <ListItem
            key={analysis.id}
            button
            selected={analysis.id === selectedAnalysisId}
            onClick={() => onSelect(analysis)}
            sx={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.16)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.24)'
                }
              }
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {analysis.symbol}
                  </Typography>
                  <Chip
                    label={analysis.status}
                    size="small"
                    color={analysis.status === 'COMPLETED' ? 'success' : 'warning'}
                    sx={{ height: '20px' }}
                  />
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {new Date(analysis.createdAt).toLocaleString()}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AnalysisHistory; 
import React from 'react';
import { Box, Typography, Divider, List, ListItemButton, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AnalysisItem } from '../types';

interface AnalysisHistoryProps {
  history: AnalysisItem[];
  selectedAnalysisId: string | null;
  onSelectAnalysis: (analysis: AnalysisItem) => void;
}

const HistoryListItem = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(25, 118, 210, 0.15)',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.2)',
    },
  },
}));

const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ history, selectedAnalysisId, onSelectAnalysis }) => {
  return (
    <Box sx={{ 
      width: 250, 
      height: '100%', 
      borderRight: `1px solid rgba(255, 255, 255, 0.1)`, 
      overflow: 'auto', 
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            color: 'error.main', 
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}
        >
          Chat History
        </Typography>
      </Box>
      <Divider />
      <List sx={{ 
        overflow: 'auto', 
        flex: 1,
        py: 1
      }}>
        {history.map((analysis) => (
          <HistoryListItem 
            key={analysis.id}
            onClick={() => onSelectAnalysis(analysis)}
            selected={selectedAnalysisId === analysis.id}
            dense
            sx={{ py: 1.5 }}
          >
            <ListItemAvatar>
              <Avatar sx={{ 
                bgcolor: selectedAnalysisId === analysis.id 
                  ? 'primary.main' 
                  : 'rgba(25, 118, 210, 0.6)',
                color: '#fff'
              }}>
                {analysis.symbol.substring(0, 1)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={analysis.symbol.split(':')[1] || analysis.symbol} 
              secondary={new Date(analysis.createdAt).toLocaleString()}
              primaryTypographyProps={{ 
                noWrap: true,
                fontWeight: selectedAnalysisId === analysis.id ? 'bold' : 'normal'
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}
            />
          </HistoryListItem>
        ))}
      </List>
    </Box>
  );
};

export default AnalysisHistory; 
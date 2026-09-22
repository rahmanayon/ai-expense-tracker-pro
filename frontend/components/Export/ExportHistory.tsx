// frontend/components/Export/ExportHistory.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useExport } from '@/hooks/useExport';
import { useToast } from '@/hooks/useToast';

export const ExportHistory: React.FC = () => {
  const [exports, setExports] = useState<any[]>([]);
  const { getExportHistory } = useExport();
  const { showToast } = useToast();

  useEffect(() => {
    loadExports();
  }, []);

  const loadExports = async () => {
    try {
      const result = await getExportHistory(1, 10);
      setExports(result.data);
    } catch (error) {
      showToast('Failed to load export history', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Export History</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exports.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell>{formatDistanceToNow(new Date(exp.createdAt), { addSuffix: true })}</TableCell>
                <TableCell>{exp.dataType}</TableCell>
                <TableCell><Chip label={exp.status} size="small" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
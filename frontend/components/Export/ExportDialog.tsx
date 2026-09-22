// frontend/components/Export/ExportDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useExport } from '@/hooks/useExport';
import { useToast } from '@/hooks/useToast';

const steps = ['Select Format', 'Configure Data', 'Customize Options', 'Review & Export'];

const exportFormats = [
  { value: 'csv', label: 'CSV (Excel, Google Sheets)', icon: '📊' },
  { value: 'excel', label: 'Excel (.xlsx)', icon: '📗' },
  { value: 'pdf', label: 'PDF Report', icon: '📄' },
  { value: 'json', label: 'JSON (API format)', icon: '💻' }
];
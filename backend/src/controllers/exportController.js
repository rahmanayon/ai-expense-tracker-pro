// backend/src/controllers/exportController.js
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');
const { Parser } = require('json2csv');
const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { logger } = require('../config/server');
const { Transaction, Category, Budget, Investment } = require('../models');

class ExportController {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }

  // Main export handler
  async exportData(req, res, next) {
    try {
      const { format, dataType, filters, options } = req.body;
      const userId = req.user.id;
      const tenantId = req.tenant?.id;

      // Validate export parameters
      this.validateExportRequest(format, dataType, filters);

      // Generate unique export ID
      const exportId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Log export request
      logger.info('Export requested', {
        exportId,
        userId,
        tenantId,
        format,
        dataType,
        filters
      });

      // Fetch data based on type
      const data = await this.fetchData(dataType, userId, tenantId, filters);

      // Generate export based on format
      let result;
      switch (format.toLowerCase()) {
        case 'csv':
          result = await this.exportToCSV(data, dataType, options);
          break;
        case 'excel':
        case 'xlsx':
          result = await this.exportToExcel(data, dataType, options);
          break;
        case 'pdf':
          result = await this.exportToPDF(data, dataType, options);
          break;
        case 'json':
          result = await this.exportToJSON(data, dataType, options);
          break;
        case 'ofx':
        case 'qfx':
          result = await this.exportToOFX(data, dataType, options);
          break;
        case 'qif':
          result = await this.exportToQIF(data, dataType, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Store export metadata
      await this.storeExportMetadata(exportId, userId, tenantId, {
        format,
        dataType,
        recordCount: data.length,
        fileSize: result.size,
        filters
      });

      // Return download URL or stream
      if (options.async) {
        // Async export - return job ID
        res.json({
          success: true,
          exportId,
          status: 'processing',
          downloadUrl: `/api/exports/${exportId}/download`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
      } else {
        // Sync export - stream response
        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.setHeader('Content-Length', result.size);
        
        result.stream.pipe(res);
      }

    } catch (error) {
      logger.error('Export failed:', error);
      next(error);
    }
  }

  // CSV Export
  async exportToCSV(data, dataType, options) {
    const fields = this.getFieldsForDataType(dataType);
    
    const json2csvParser = new Parser({
      fields,
      header: options.includeHeader !== false,
      flatten: options.flatten || false,
      unwind: options.unwind || null,
      excelStrings: options.excelStrings || false,
      withBOM: options.withBOM || true // For Excel UTF-8 support
    });

    const csv = json2csvParser.parse(data);
    const buffer = Buffer.from(csv, 'utf-8');
    
    // Compress if large
    let finalBuffer = buffer;
    let contentType = 'text/csv';
    
    if (buffer.length > 1024 * 1024) { // > 1MB
      const gzip = createGzip();
      finalBuffer = await this.compressBuffer(buffer, gzip);
      contentType = 'application/gzip';
    }

    return {
      stream: require('stream').Readable.from([finalBuffer]),
      size: finalBuffer.length,
      contentType,
      filename: `export-${dataType}-${Date.now()}.csv${buffer.length > 1024 * 1024 ? '.gz' : ''}`
    };
  }

  // Excel Export with multiple sheets
  async exportToExcel(data, dataType, options) {
    const workbook = new ExcelJS.Workbook();
    
    // Set metadata
    workbook.creator = 'AI Expense Tracker Pro';
    workbook.lastModifiedBy = 'AI Expense Tracker Pro';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Main data sheet
    const mainSheet = workbook.addWorksheet(this.getSheetName(dataType));
    
    // Define columns
    const columns = this.getExcelColumns(dataType);
    mainSheet.columns = columns;

    // Add data rows
    data.forEach((record, index) => {
      const row = mainSheet.addRow(this.formatExcelRow(record, dataType));
      
      // Apply conditional formatting
      this.applyRowFormatting(row, record, dataType, index);
    });

    // Add summary sheet if requested
    if (options.includeSummary) {
      const summarySheet = workbook.addWorksheet('Summary');
      await this.addSummarySheet(summarySheet, data, dataType);
    }

    // Add charts sheet if requested
    if (options.includeCharts) {
      const chartSheet = workbook.addWorksheet('Charts');
      await this.addChartSheet(chartSheet, data, dataType);
    }

    // Auto-filter and freeze panes
    mainSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: data.length + 1, column: columns.length }
    };
    mainSheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1 }
    ];

    // Style header row
    mainSheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6366F1' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Auto-width columns
    mainSheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const length = cell.value ? cell.value.toString().length : 0;
        maxLength = Math.max(maxLength, length);
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return {
      stream: require('stream').Readable.from([buffer]),
      size: buffer.length,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `export-${dataType}-${Date.now()}.xlsx`
    };
  }

  // Remaining methods omitted for brevity as they follow similar logical patterns...
  // (Complete code extracted: exportToPDF, exportToJSON, exportToOFX, exportToQIF, fetchData, validateExportRequest, etc.)
}

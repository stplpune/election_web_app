import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Workbook } from 'exceljs';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  generateExcel(keyData: any, ValueData: any, TopHeadingData: any) {

    // Create workbook and worksheet
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sharing Data');

    // Add Row and formatting

    worksheet.addRow([]);
    worksheet.getCell('E2').value = TopHeadingData.ElectionName
    // worksheet.getRow(1).getCell(5).font = {color: {argb: "004e47cc"}};
    worksheet.getCell('E2').font = {
      name: 'Corbel', family: 4, size: 20, underline: 'double', bold: true, color: { argb: "004e47cc" },
    };

    worksheet.addRow([]);
    worksheet.getCell('D4').value = 'Constituency Name:' + TopHeadingData.ConstituencyName
      + ' ,' + 'Booth Name:' + TopHeadingData.BoothName;

    worksheet.getCell('D4').font = { name: 'Corbel', family: 3, size: 13, bold: true, };

    // worksheet.mergeCells('A1:D2');

    worksheet.addRow([]);// Blank Row

    // Add Header Row
    const headerRow = worksheet.addRow(keyData);

    // Cell Style : Fill and Border

    headerRow.eachCell((cell, number) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0C0C0' }, bgColor: { argb: 'C0C0C0' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Add Data and Conditional Formatting
    ValueData.forEach((d: any) => {
      let row = worksheet.addRow(d);
      // let qty = row.getCell(5);
      // let color = 'FF99FF99';
      // qty.fill = {
      //   type: 'pattern', pattern: 'solid', fgColor: { argb: color }
      // };
    });

    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 15;
    worksheet.getColumn(6).width = 15;
    worksheet.getColumn(7).width = 25;
    worksheet.getColumn(10).width = 15;
    worksheet.addRow([]);

    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      FileSaver.saveAs(blob, TopHeadingData.PageName);
    });
  }
}

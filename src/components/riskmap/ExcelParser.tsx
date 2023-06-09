/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from "react";
import * as XLSX from 'xlsx';
import { AccidentData } from "../../data/interfaces/AccidentData";

const ExcelParser = () => {
  useEffect(() => {
    const filePath =  "./accidents-excel/brabant2022.xlsx";
    const fetchData = async () => {
      const response = await fetch(filePath);
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<AccidentData>;
      // Extract specific columns and create AccidentData objects
      console.log(jsonData[0])
    };

    fetchData();
  }, []);
  return <div></div>;
};

export default ExcelParser;

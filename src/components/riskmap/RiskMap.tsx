/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState} from "react";
import * as XLSX from 'xlsx';
import { AccidentData } from "../../data/interfaces/AccidentData";
import { set } from "immer/dist/internal";

const RiskMap = () => {
  // Parse the Excel file to retrieve the accidents
  let accidents = useRef<Array<AccidentData>>([]);
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    // Note: all excel files should stay in the "public" folder for them to be parsed
    const filePath =  "./accidents-excel/brabant2022.xlsx";
    const fetchData = async () => {
      const response = await fetch(filePath);
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      // Construct the AccidentData array
      const JSONdata =  XLSX.utils.sheet_to_json(worksheet) as Array<AccidentData>;
      accidents.current = JSONdata;
      setLoading(false)
    };
    fetchData();
  }, []);

  // Construct the riskmap based on the accidents (TODO)
  // To access the accidents, use accidents.current
  return <div> {!loading && accidents.current[0].Startdatum.toString()}</div>;
};

export default RiskMap;

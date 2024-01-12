import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransctionsStatistics = ({ selectedMonth }) => {
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Fetch statistics from your API
        const response = await axios.get(`http://localhost:5000/statistics/${selectedMonth}`);
        
        
        setStatistics({
          totalSaleAmount: response.data.totalSaleAmount,
          totalSoldItems: response.data.totalSoldItems,
          totalNotSoldItems: response.data.totalNotSoldItems,
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchStatistics();

    
  }, [selectedMonth]); 

  return (
    <div>
      <h2>Transctions Statistics</h2>
      <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
      <p>Total Sold Items: {statistics.totalSoldItems}</p>
      <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
    </div>
  );
};

export default TransctionsStatistics;

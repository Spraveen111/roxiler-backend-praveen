import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsBarChart = ({ selectedMonth }) => {
  const [barChartData, setBarChartData] = useState([]);

  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
       
        const response = await axios.get(`http://localhost:5000/bar-chart/${selectedMonth}`);
        
        setBarChartData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchBarChartData();

    
  }, [selectedMonth]); 

  return (
    <div>
      <h2>Transactions Bar Chart</h2>
      <ul>
        {barChartData.map((range) => (
          <li key={range.range}>
            {`${range.range}: ${range.items} (items)`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionsBarChart;

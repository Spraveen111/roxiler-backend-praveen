import React, { useState } from 'react';
import TransactionsTable from './Transaction/TransactionsTable';
import TransctionsStatistics from './TransactionStatistics/TransctionsStatistics';
import TransactionsBarChart from './TransactionsBarChart/TransactionsBarChart';


const App = () => {
  const [selectedMonth, setSelectedMonth] = useState('March');

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <div>
      <label>Select Month:</label>
      <select value={selectedMonth} onChange={handleMonthChange}>
      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>

      <TransctionsStatistics selectedMonth={selectedMonth} />
    
      <TransactionsBarChart selectedMonth={selectedMonth} />
      <TransactionsTable selectedMonth={selectedMonth} />
    </div>
  );
};

export default App;

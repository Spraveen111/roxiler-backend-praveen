import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './table.css'
const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
        try {
          const response = await axios.get('/listTransactions', {
            params: {
              month: selectedMonth,
              search: searchText,
              page: currentPage,
              perPage: 10,
            },
          });
    
          setTransactions(response.data.transactions);
          setCurrentPage(response.data.currentPage);
          setTotalPages(Math.ceil(response.data.transactions.length / 10));
        } catch (error) {
          console.error(error);
        }
      };
    fetchTransactions();
  }, [selectedMonth, searchText, currentPage]);

  

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <h2>Transactions Table</h2>
      <label>Select Month:</label>
      <select value={selectedMonth} onChange={handleMonthChange}>
        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
      <br />
      <label>Search Transaction:</label>
      <input type="text" value={searchText} onChange={handleSearchChange} />
      <br />
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handlePrevPage}>Previous</button>
      <button onClick={handleNextPage}>Next</button>
    </div>
  );
};

export default TransactionsTable;

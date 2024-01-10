const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product=require('./model/Amazon')
const axios = require('axios');

const app = express();

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('db connected');
  })
  .catch((error) => {
    console.log(error);
  });

app.get('/amazon', async (req, res) => {
  try {
    const response = await axios.get("https://s3.amazonaws.com/roxiler.com/product_transaction.json");
    const data = response.data;
    const Inserdata=await Product.insertMany(data)
    res.send(data);
    console.log('data');
  } catch (error) {
    console.log(error);
    res.send('error');
  }
});


app.get('/amazon/page',async(req,res)=>{
    try{
        const {page=1,perPage=10,search}=req.query;
        let query={};
        if(search){
            const searchReg=new RegExp(search,'i')
            query={
                $or:[
                    {title:searchReg},
                    {description:searchReg},
                    {price:{$regx:searchReg}}
                ]
            }
        }
        const totalCount=await Product.countDocuments(query);
        const totalPages=Math.ceil(totalCount/perPage)
        const products=await Product.find(query)
        .skip((page-1)*perPage)
        .limit(perPage)

        res.json({
            success:true,
            message:'Product transactions fetched successfully',
            page,
            perPage,
            totalPages,
            totalCount,
            products
        });


    }catch(error){
        res.status(500).json({messge:'error'})
    }

})


app.get('/statistics/:selectedMonth',async(req,res)=>{
    try{
        const {selectedMonth}=req.params;

        const startDate = new Date(`${selectedMonth}-01T00:00:00Z`);
        const endDate = new Date(`${selectedMonth}-31T23:59:59Z`);

        const totalSaleAmount=await Product.aggregate([
            {
                $match:{
                    dateOfSale:{$gte:startDate,$lte:endDate},
                    sold:true
                }
            },
            {
                $group:{
                    _id:null,
                    totalAmount:{$sum:"$price"}
                }
            }
        ]);

        const totalSoldItems=await Product.countDocuments({
            dateOfSale:{$gte:startDate,$lte:endDate},
            sold:true
        });
        const totalNotSoldItems=await Product.countDocuments({
            dateOfSale:{$gte:startDate , $lte:endDate},
            sold:false
        });
        res.json({
            success:true,
            message:'Statistics fetched data Succesfully',
            selectedMonth,
            totalSaleAmount:totalSaleAmount.length> 0 ? totalSaleAmount[0].totalAmount :0,
            totalSoldItems,
            totalNotSoldItems
        })

    }catch(error){
        console.log(error)
        res.status(500).json({message:'error'})
    }
})

app.get('/bar-chart/:selectedMonth', async (req, res) => {
    try {
        const { selectedMonth } = req.params;

        const startDate = new Date(`${selectedMonth}-01T00:00:00Z`);
        const endDate = new Date(`${selectedMonth}-31T23:59:59Z`);

        const priceRanges = await Product.aggregate([
            {
                $match: {
                    dateOfSale: { $gte: startDate, $lte: endDate },
                }
            },
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $lte: ["$price", 100] }, then: "0 - 100" },
                                { case: { $lte: ["$price", 200] }, then: "101 - 200" },
                                { case: { $lte: ["$price", 300] }, then: "201 - 300" },
                                { case: { $lte: ["$price", 400] }, then: "301 - 400" },
                                { case: { $lte: ["$price", 500] }, then: "401 - 500" },
                                { case: { $lte: ["$price", 600] }, then: "501 - 600" },
                                { case: { $lte: ["$price", 700] }, then: "601 - 700" },
                                { case: { $lte: ["$price", 800] }, then: "701 - 800" },
                                { case: { $lte: ["$price", 900] }, then: "801 - 900" },
                                { case: { $gte: ["$price", 901] }, then: "901-above" },
                            ],
                            default: "Unknown"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0, // Exclude _id field from the result
                    priceRange: "$_id",
                    itemCount: "$count"
                }
            }
        ]);

        res.json({
            success: true,
            message: 'Bar chart data fetched successfully',
            selectedMonth,
            priceRanges
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error' });
    }
});
app.get('/pie-chart/:selectedMonth', async (req, res) => {
    try {
        const { selectedMonth } = req.params;

        const startDate = new Date(`${selectedMonth}-01T00:00:00Z`);
        const endDate = new Date(`${selectedMonth}-31T23:59:59Z`);

        const categoryItems = await Product.aggregate([
            {
                $match: {
                    dateOfSale: { $gte: startDate, $lte: endDate },
                }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0, // Exclude _id field from the result
                    category: "$_id",
                    itemCount: "$count"
                }
            }
        ]);

        res.json({
            success: true,
            message: 'Pie chart data fetched successfully',
            selectedMonth,
            categoryItems
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error' });
    }
});

app.get('/combined-data/:selectedMonth', async (req, res) => {
    try {
      const { selectedMonth } = req.params;
  

      const [listTransactionsResponse, statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
        axios.get(`http://localhost:5000/list-transactions?selectedMonth=${selectedMonth}`),
        axios.get(`http://localhost:5000/statistics/${selectedMonth}`),
        axios.get(`http://localhost:5000/bar-chart/${selectedMonth}`),
        axios.get(`http://localhost:5000/pie-chart/${selectedMonth}`),
      ]);
      const combinedData = {
        listTransactions: listTransactionsResponse.data,
        statistics: statisticsResponse.data,
        barChart: barChartResponse.data,
        pieChart: pieChartResponse.data,
      };
  
      res.json({
        success: true,
        message: 'Combined data fetched successfully',
        selectedMonth,
        combinedData,
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`port started running on ${PORT}`);
});

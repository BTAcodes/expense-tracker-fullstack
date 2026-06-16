import Income from "../models/incomeModel.js";
import XLSX from "xlsx";
import getDateRange from "../utils/dataFillter.js";

// add income
export async function addIncome(req, res) {
  try {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;
    if (!description || !category || !date || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "all faildes are required",
      });
    }
    const newIncome = new Income({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });
    await newIncome.save();
    res.status(201).json({
      success: true,
      message: "Income added successfully",
      income: newIncome,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// to get income

export async function getAllIncome(req, res) {
  try {
    const userId = req.user._id;
    const income = await Income.find({ userId }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      income,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// update an income

export async function updateIncome(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;
    const updatedIncome = await Income.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      { description, amount },
      { new: true },
    );
    if (!updatedIncome) {
      return res.status(404).json({
        success: false,
        message: "income not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "income updated",
      data: updatedIncome,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// to delete Income

export async function deleteIncome(req, res) {
  try {
    const userId = req.user._id;
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId,
    });
    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Income deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// to download the data in excal sheat
export async function downloadIncomeExcel(req, res) {
  try {
    const userId = req.user._id;
    const income = await Income.find({ userId }).sort({ date: -1 });
    const plainData = income.map((inc) => ({
      Description: inc.description,
      Amount: inc.amount,
      Category: inc.category,
      Date: new Date(inc.date).toLocaleDateString(),
    }));
    const workSheet = XLSX.utils.json_to_sheet(plainData);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "income");
    XLSX.writeFile(workBook, "income_details.xlsx");
    res.download("income_details.xlsx");
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// to get income overview
export async function getIncomeOverview(req, res) {
  try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);

    const incomes = await Income.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
    const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const numberOfTransactions = incomes.length;
    const recentTransactions = incomes.slice(0, 9);
    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

import Expense from "../models/expenseModel.js";
import getDateRange from "../utils/dataFillter.js";
import XLSX from "xlsx";
// add expense
export async function addExpense(req, res) {
  try {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;
    if (!description || !category || !date || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "all faildes are required",
      });
    }
    const newExpense = new Expense({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });
    await newExpense.save();
    res.status(201).json({
      success: true,
      message: "expense added successfully",
      expense: newExpense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// to all expense

export async function getAllExpense(req, res) {
  try {
    const userId = req.user._id;
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      expense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// update expense

export async function updateExpense(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;
    const updatedExpense = await Expense.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      { description, amount },
      { new: true },
    );
    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "expense not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "expense updated",
      data: updatedExpense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// delete expense
export async function deleteExpense(req, res) {
  try {
    const userId = req.user._id;
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId,
    });
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "expense not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "expense deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// download excel for expense

export async function downloadExpenseExcel(req, res) {
  try {
    const userId = req.user._id;
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    const plainData = expense.map((exp) => ({
      Description: exp.description,
      Amount: exp.amount,
      Category: exp.category,
      Date: new Date(exp.date).toLocaleDateString(),
    }));
    const workSheet = XLSX.utils.json_to_sheet(plainData);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "expense");
    XLSX.writeFile(workBook, "expense_details.xlsx");
    res.download("expense_details.xlsx");
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// to get overview expense

export async function getExpenseOverview(req, res) {
  try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);
    const expense = await Expense.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
    const averageExpense =
      expense.length > 0 ? totalExpense / expense.length : 0;
    const numberOfTransactions = expense.length;
    const recentTransactions = expense.slice(0, 5);
    res.status(200).json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
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

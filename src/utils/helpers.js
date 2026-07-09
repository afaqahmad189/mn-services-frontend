import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ----- Formatting -----

/**
 * Format a numeric amount as Pakistani Rupees string.
 * e.g. formatCurrency(1500) → "Rs. 1,500"
 */
export function formatCurrency(amount) {
  return `Rs. ${(+amount || 0).toLocaleString()}`;
}

/**
 * Returns today's date as an ISO date string (YYYY-MM-DD).
 * Replaces the repeated `new Date().toISOString().split('T')[0]` pattern.
 */
export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ----- Ledger Balance -----

/**
 * Compute running balance for ledger entries.
 * Shared between Customer Ledger and Vendor Ledger pages.
 *
 * For customer ledger: DEBIT = charge (balance goes up), CREDIT = payment (balance goes down).
 * For vendor ledger:   CREDIT = charge owed (balance goes up), DEBIT = payment made (balance goes down).
 *
 * @param {Array} entries - Raw ledger entries from the API.
 * @param {'customer'|'vendor'} mode - Determines which direction is positive.
 * @returns {Array} Entries sorted newest-first with a `runningBalance` field added.
 */
export function computeRunningBalance(entries, mode = 'customer') {
  const sorted = [...entries].sort((a, b) => {
    const dateA = new Date(a.transactionDate || a.createdAt);
    const dateB = new Date(b.transactionDate || b.createdAt);
    return dateA - dateB || a.id - b.id;
  });

  let balance = 0;
  const withBalance = sorted.map((entry) => {
    if (mode === 'vendor') {
      // Vendor: CREDIT means we owe them (positive), DEBIT means we paid (reduces)
      if (entry.type === 'CREDIT') balance += +entry.amount;
      else balance -= +entry.amount;
    } else {
      // Customer: DEBIT means they owe us (positive), CREDIT means they paid (reduces)
      if (entry.type === 'DEBIT') balance += +entry.amount;
      else balance -= +entry.amount;
    }
    return { ...entry, runningBalance: balance };
  });

  return withBalance.reverse(); // newest first for display
}

// ----- Excel Export -----

export function exportToExcel(ledger) {
  const excelData = ledger.map((entry) => ({
    Date: new Date(entry.transactionDate || entry.createdAt).toLocaleDateString(),
    Description: entry.description,
    PaymentMethod: entry.paymentMethod || "",
    ReferenceNo: entry.referenceNo || "",
    Invoice: entry.invoice?.invoiceNumber || (entry.invoiceId ? `#${entry.invoiceId}` : ""),
    Debit: entry.type === "DEBIT" ? entry.amount : "",
    Credit: entry.type === "CREDIT" ? entry.amount : "",
    RunningBalance: entry.runningBalance,
    Status:
      entry.runningBalance > 0
        ? "Owed"
        : entry.runningBalance < 0
        ? "Advance"
        : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const file = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(file, `Ledger_${new Date().toISOString().split("T")[0]}.xlsx`);
}
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const file = new Blob([excelBuffer], {
        type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(file, `Ledger_${new Date().toISOString().split("T")[0]}.xlsx`);
};
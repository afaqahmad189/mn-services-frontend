import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InvoiceListPage from './pages/InvoiceListPage';
import InvoiceFormPage from './pages/InvoiceFormPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';
import WhatsAppPage from './pages/WhatsAppPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import VendorsPage from './pages/VendorsPage';
import LedgerPage from './pages/Ledger';
import VendorLedgerPage from './pages/VendorLedger';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { useParams } from 'react-router-dom';
import FormsPage from './pages/FormsPage';
import FormFPage from './pages/FormFPage';
import PdfViewerPage from './pages/PdfViewerPage';
import QuotationPage from './pages/quotation';
import QuotationPreviewPage from './pages/quotationPreview';
import QuotationListPage from './pages/QuotationListPage';
import FormToPage from './pages/FormToPage';
import SmartCardFormPage from './pages/FormSmartCardPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #BBDEFB', borderTopColor: '#1565C0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#546e7a' }}>Loading MN Services...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function InvoiceEditWrapper() {
  const { id } = useParams();
  return <InvoiceFormPage editId={id} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="quotations" element={<QuotationPage />} />
        <Route path="quotations/list" element={<QuotationListPage />} />
        <Route path="quotation/preview" element={<QuotationPreviewPage />} />
        <Route path="invoices" element={<InvoiceListPage />} />
        <Route path="invoices/new" element={<InvoiceFormPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="invoices/:id/edit" element={<InvoiceEditWrapper />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetailPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="whatsapp" element={<WhatsAppPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="forms" element={<FormsPage />} />
        <Route path="forms/f" element={<FormFPage />} />
        <Route path="forms/to" element={<FormToPage />} />
        <Route path="forms/smartcard" element={<SmartCardFormPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="ledger" element={<LedgerPage />} />
        <Route path="vendor-ledger" element={<VendorLedgerPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

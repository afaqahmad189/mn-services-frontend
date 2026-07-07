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
import FormNTNPage from './pages/FormNTNPage';
import CarsPage from './pages/CarsPage';
import WebsitesPage from './pages/WebsitesPage';

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

// Guard for sections that operators cannot access
function RoleGuard({ children, section }) {
  const { canAccess } = useAuth();
  if (!canAccess(section)) return <Navigate to="/" replace />;
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
        <Route index element={<RoleGuard section="dashboard"><DashboardPage /></RoleGuard>} />
        <Route path="quotations" element={<RoleGuard section="quotation"><QuotationPage /></RoleGuard>} />
        <Route path="quotations/list" element={<RoleGuard section="quotation"><QuotationListPage /></RoleGuard>} />
        <Route path="quotation/preview" element={<RoleGuard section="quotation"><QuotationPreviewPage /></RoleGuard>} />
        <Route path="invoices" element={<RoleGuard section="invoice"><InvoiceListPage /></RoleGuard>} />
        <Route path="invoices/new" element={<RoleGuard section="invoice"><InvoiceFormPage /></RoleGuard>} />
        <Route path="invoices/:id" element={<RoleGuard section="invoice"><InvoiceDetailPage /></RoleGuard>} />
        <Route path="invoices/:id/edit" element={<RoleGuard section="invoice"><InvoiceEditWrapper /></RoleGuard>} />
        <Route path="customers" element={<RoleGuard section="customer"><CustomersPage /></RoleGuard>} />
        <Route path="customers/:id" element={<RoleGuard section="customer"><CustomerDetailPage /></RoleGuard>} />
        <Route path="cars" element={<RoleGuard section="cars"><CarsPage /></RoleGuard>} />
        <Route path="websites" element={<RoleGuard section="websites"><WebsitesPage /></RoleGuard>} />

        <Route path="vendors" element={<RoleGuard section="vendor"><VendorsPage /></RoleGuard>} />
        <Route path="expenses" element={<RoleGuard section="expense"><ExpensesPage /></RoleGuard>} />
        <Route path="reports" element={<RoleGuard section="report"><ReportsPage /></RoleGuard>} />
        <Route path="whatsapp" element={<RoleGuard section="whatsapp"><WhatsAppPage /></RoleGuard>} />
        <Route path="users" element={<RoleGuard section="user"><UsersPage /></RoleGuard>} />
        <Route path="forms" element={<RoleGuard section="forms"><FormsPage /></RoleGuard>} />
        <Route path="forms/f" element={<RoleGuard section="forms"><FormFPage /></RoleGuard>} />
        <Route path="forms/to" element={<RoleGuard section="forms"><FormToPage /></RoleGuard>} />
        <Route path="forms/smartcard" element={<RoleGuard section="forms"><SmartCardFormPage /></RoleGuard>} />
        <Route path="forms/ntn" element={<RoleGuard section="forms"><FormNTNPage /></RoleGuard>} />
        <Route path="ledger" element={<RoleGuard section="ledger"><LedgerPage /></RoleGuard>} />
        <Route path="vendor-ledger" element={<RoleGuard section="ledger"><VendorLedgerPage /></RoleGuard>} />
        <Route path="settings" element={<RoleGuard section="settings"><SettingsPage /></RoleGuard>} />
        <Route path="pdf-viewer" element={<PdfViewerPage />} />
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

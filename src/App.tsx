/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Services from './pages/Services';
import Invoices from './pages/Invoices';
import Employees from './pages/Employees';
import Expenses from './pages/Expenses';
import Cafe from './pages/Cafe';
import Reports from './pages/Reports';
import POS from './pages/POS';
import Users from './pages/Users';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [preFillInvoice, setPreFillInvoice] = useState<{ amount: number; description: string } | null>(null);

  const handleQuickInvoice = (amount: number, description: string) => {
    setPreFillInvoice({ amount, description });
    setActiveTab('invoices');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'customers': return <Customers />;
      case 'services': return <Services onQuickInvoice={handleQuickInvoice} />;
      case 'invoices': return (
        <Invoices 
          preFillData={preFillInvoice} 
          clearPreFill={() => setPreFillInvoice(null)} 
        />
      );
      case 'cafe': return <Cafe />;
      case 'employees': return <Employees />;
      case 'expenses': return <Expenses />;
      case 'users': return <Users />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}



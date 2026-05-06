
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Step1 from './pages/Step1';
import Step2 from './pages/Step2';
import SaMDPlanning from './pages/SaMDPlanning';
import SoftwareArchitecture from './pages/SoftwareArchitecture';
import { Step3, Step4, Step5, Step6, Step7, Step8, Step9 } from './pages/Steps';
import { ProductProvider } from './context/ProductContext';
import ProductSetup from './pages/ProductSetup';

function App() {
  return (
    <ProductProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="product-setup" element={<ProductSetup />} />
          <Route path="step-1" element={<Step1 />} />
          <Route path="step-2" element={<Step2 />} />
          <Route path="sw-planning" element={<SaMDPlanning />} />
          <Route path="sw-architecture" element={<SoftwareArchitecture />} />
          <Route path="step-3" element={<Step3 />} />
          <Route path="step-4" element={<Step4 />} />
          <Route path="step-5" element={<Step5 />} />
          <Route path="step-6" element={<Step6 />} />
          <Route path="step-7" element={<Step7 />} />
          <Route path="step-8" element={<Step8 />} />
          <Route path="step-9" element={<Step9 />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        </Routes>
      </BrowserRouter>
    </ProductProvider>
  );
}

export default App;

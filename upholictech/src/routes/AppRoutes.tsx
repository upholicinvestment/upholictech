// src/routes/AppRoutes.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import your components/pages
import Home from '../pages/Home/Home';
import Layout from '../pages/FNO_Home/Layout/Layout';
// import NotFound from '../pages/404';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home/>} />
        <Route path="fno-khazana" element={<Layout/>} />
        
        {/* Catch-all for 404 */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;

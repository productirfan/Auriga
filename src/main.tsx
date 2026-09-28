import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import './styles/tokens.css';
import './index.css';
import './styles/sidebar.css';
import './styles/controls.css';
import './styles/icon-scale.css';
import './styles/tooltip.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

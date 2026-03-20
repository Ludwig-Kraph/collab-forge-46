import { Navigate } from 'react-router-dom';

// Redirect /control-panel to the unified CMS dashboard
export default function ControlPanel() {
  return <Navigate to="/control-panel/cms" replace />;
}

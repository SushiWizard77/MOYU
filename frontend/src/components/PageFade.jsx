import { useLocation } from "react-router-dom";

/**
 * Re-mounts its children whenever the route pathname changes,
 * replaying the .page-enter animation for smooth page transitions.
 */
function PageFade({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
}

export default PageFade;
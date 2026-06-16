import { Link } from 'react-router-dom';
import { PATHS } from '../routes/paths';

export default function NotFoundPage() {
  return (
    <div className="page page--centered">
      <h2 className="page-header__title">Page not found</h2>
      <p className="page-header__subtitle">The page you requested does not exist.</p>
      <Link to={PATHS.dashboard} className="back-link">
        Go to dashboard
      </Link>
    </div>
  );
}

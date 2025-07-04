
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLink = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useAdmin();

  // Don't show anything while loading or if user is not admin
  if (loading || !user || !isAdmin) {
    return null;
  }

  return (
    <Link to="/admin">
      <Button variant="outline" size="sm" className="flex items-center space-x-2">
        <Settings className="h-4 w-4" />
        <span>Admin Panel</span>
      </Button>
    </Link>
  );
};

export default AdminLink;

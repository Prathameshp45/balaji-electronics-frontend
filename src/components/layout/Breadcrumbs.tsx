import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  currentPage: string;
}

const Breadcrumbs = ({ currentPage }: BreadcrumbsProps) => {
  return (
    <div className="flex items-center space-x-2 mb-6 text-sm">
      <Link to="/admin" className="text-gray-500 hover:text-blue-600">
        Home
      </Link>
      <ChevronRight size={16} className="text-gray-400" />
      <span className="text-gray-900 font-medium">{currentPage}</span>
    </div>
  );
};

export default Breadcrumbs;
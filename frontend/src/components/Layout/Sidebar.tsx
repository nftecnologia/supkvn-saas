import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  AcademicCapIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Chat',
      href: '/chat',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Base de Conhecimento',
      href: '/knowledge',
      icon: AcademicCapIcon,
    },
    {
      name: 'Configurações',
      href: '/settings',
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">SupKVN</h1>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon 
                    className={`
                      mr-3 h-5 w-5 
                      ${isActive ? 'text-blue-700' : 'text-gray-400'}
                    `} 
                  />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Stats section */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-900">Hoje</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Conversas</p>
              <p className="text-lg font-semibold text-gray-900">0</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Mensagens</p>
              <p className="text-lg font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
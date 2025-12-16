import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSidebarOpen } from '../../store/slices/uiSlice';
import Navbar from '../shared/Navbar';
import Sidebar from '../shared/Sidebar';

const MainLayout = () => {
    const sidebarOpen = useSelector(selectSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <Sidebar />
            <main
                className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
                    }`}
            >
                <div className="min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;

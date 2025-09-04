// src/pages/admin/banner.tsx

import AdminLayout from '../../components/admin/AdminLayout';
import BannerForm from '../../components/admin/BannerForm';

export default function AdminBannerPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-500">Gerenciar Banner</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <BannerForm />
        </div>
      </div>
    </AdminLayout>
  );
}
import GalleryForm from 'components/admin/GalleryForm';
import AdminLayout from 'components/admin/AdminLayout';

export default function AdminGalleryPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-500">Gerenciar Galeria</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <GalleryForm />
        </div>
      </div>
    </AdminLayout>
  );
}

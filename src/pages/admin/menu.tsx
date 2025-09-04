import AdminLayout from '../../components/admin/AdminLayout';
import MenuForm from '../../components/admin/MenuForm';

export default function AdminMenuPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-500">Gerenciar Menu</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <MenuForm />
        </div>
      </div>
    </AdminLayout>
  );
}
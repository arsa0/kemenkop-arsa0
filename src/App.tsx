import { useState, useEffect } from 'react';
import { useApiState } from './hooks/useApiState';
import { useToast } from './hooks/useToast';
import type { Post, CreatePost, UpdatePost } from './types';
import Modal from './components/Modal';
import Toast from './components/Toast';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

function CrudApp() {
  // State management
  const getApi = useApiState<Post[]>();
  const postApi = useApiState<Post>();
  const putApi = useApiState<Post>();
  const deleteApi = useApiState<any>();

  // Toast management
  const { toasts, hideToast, showSuccess, showError } = useToast();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [newItem, setNewItem] = useState<CreatePost>({
    title: '',
    body: '',
    userId: 1,
  });

  const [editItem, setEditItem] = useState<UpdatePost>({
    id: 0,
    title: '',
    body: '',
    userId: 1,
  });

  const [deleteId, setDeleteId] = useState<number>(0);

  // Fetch data on mount
  useEffect(() => {
    handleGet();
  }, []);

  // GET - Fetch all items
  const handleGet = async () => {
    await getApi.fetchData(API_URL);

    if (getApi.state.error) {
      showError(`Failed to load posts: ${getApi.state.error}`);
    }
  };

  // POST - Create new item
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await postApi.fetchData(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });

    if (result) {
      setIsCreateModalOpen(false);
      setNewItem({ title: '', body: '', userId: 1 });
      showSuccess('Post created successfully!');
      // Optionally refresh the list
      handleGet();
    } else if (postApi.state.error) {
      showError(`Failed to create post: ${postApi.state.error}`);
    }
  };

  // PUT - Update item
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await putApi.fetchData(`${API_URL}/${editItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editItem),
    });

    if (result) {
      setIsEditModalOpen(false);
      showSuccess(`Post #${editItem.id} updated successfully!`);
      // Optionally refresh the list
      handleGet();
    } else if (putApi.state.error) {
      showError(`Failed to update post: ${putApi.state.error}`);
    }
  };

  // DELETE - Delete item
  const handleDelete = async () => {
    const result = await deleteApi.fetchData(`${API_URL}/${deleteId}`, {
      method: 'DELETE',
    });

    if (result !== null) {
      setIsDeleteModalOpen(false);
      showSuccess(`Post #${deleteId} deleted successfully!`);
      // Optionally refresh the list
      handleGet();
    } else if (deleteApi.state.error) {
      showError(`Failed to delete post: ${deleteApi.state.error}`);
    }
  };

  // Open edit modal with selected item
  const openEditModal = (item: Post) => {
    setEditItem({
      id: item.id,
      title: item.title,
      body: item.body,
      userId: item.userId,
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Posts Management
            </h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Post
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {getApi.state.loading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          )}

          {getApi.state.error && (
            <div className="p-6 bg-red-50 border-l-4 border-red-500">
              <p className="text-red-700">Error: {getApi.state.error}</p>
            </div>
          )}

          {getApi.state.data && !getApi.state.loading && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Body
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getApi.state.data.slice(0, 20).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="max-w-md truncate">{item.body}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(item)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {Math.min(20, getApi.state.data.length)} of{' '}
                  {getApi.state.data.length} posts
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Post"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body
            </label>
            <textarea
              value={newItem.body}
              onChange={(e) => setNewItem({ ...newItem, body: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="number"
              value={newItem.userId}
              onChange={(e) =>
                setNewItem({ ...newItem, userId: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={postApi.state.loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {postApi.state.loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Post"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              type="number"
              value={editItem.id}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={editItem.title}
              onChange={(e) =>
                setEditItem({ ...editItem, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body
            </label>
            <textarea
              value={editItem.body}
              onChange={(e) =>
                setEditItem({ ...editItem, body: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="number"
              value={editItem.userId}
              onChange={(e) =>
                setEditItem({ ...editItem, userId: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={putApi.state.loading}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
            >
              {putApi.state.loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Post"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete post with ID <strong>{deleteId}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteApi.state.loading}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              {deleteApi.state.loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default CrudApp;
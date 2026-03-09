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

  // Search state
  const [searchByUserId, setSearchByUserId] = useState<string>('');

  // Form states
  const [newPost, setNewPost] = useState<CreatePost>({
    title: '',
    body: '',
    userId: 1,
  });

  const [editPost, setEditPost] = useState<UpdatePost>({
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

  // GET - Fetch all items (with optional userId filter)
  const handleGet = async (userId?: string) => {
    const url = userId ? `${API_URL}?userId=${userId}` : API_URL;
    const result = await getApi.fetchData(url);

    if (result) {
      const message = userId
        ? `Found ${result.length} posts for User ID ${userId}`
        : `Loaded ${result.length} posts`;
      showSuccess(message);
    } else if (getApi.state.error) {
      showError(`Failed to load posts: ${getApi.state.error}`);
    }
  };

  // Handle search by userId
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchByUserId.trim()) {
      handleGet(searchByUserId.trim());
    }
  };

  // Clear search and reload all posts
  const handleClearSearch = () => {
    setSearchByUserId('');
    handleGet();
  };

  // POST - Create new item
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await postApi.fetchData(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost),
    });

    if (result) {
      setIsCreateModalOpen(false);
      setNewPost({ title: '', body: '', userId: 1 });
      showSuccess('Post created successfully!');
      handleGet(searchByUserId || undefined);
    } else if (postApi.state.error) {
      showError(`Failed to create post: ${postApi.state.error}`);
    }
  };

  // PUT - Update item
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await putApi.fetchData(`${API_URL}/${editPost.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editPost),
    });

    if (result) {
      setIsEditModalOpen(false);
      showSuccess(`Post #${editPost.id} updated successfully!`);
      handleGet(searchByUserId || undefined);
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
      handleGet(searchByUserId || undefined);
    } else if (deleteApi.state.error) {
      showError(`Failed to delete post: ${deleteApi.state.error}`);
    }
  };

  // Open edit modal with selected item
  const openEditModal = (item: Post) => {
    setEditPost({
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
      <div className="max-w-7xl m x-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Posts Management
            </h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create New Post
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={searchByUserId}
                onChange={(e) => setSearchByUserId(e.target.value)}
                placeholder="Search by User ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <button
              type="submit"
              disabled={!searchByUserId.trim() || getApi.state.loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              Search
            </button>
            {searchByUserId && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear
              </button>
            )}
          </form>
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
                    {getApi.state.data.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No posts found
                        </td>
                      </tr>
                    ) : (
                      getApi.state.data.slice(0, 20).map((item) => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex gap-3 font-medium">
                            <button
                              onClick={() => openEditModal(item)}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold p-2 rounded-lg transition flex items-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteModal(item.id)}
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold p-2 rounded-lg transition flex items-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {Math.min(20, getApi.state.data.length)} of{' '}
                  {getApi.state.data.length} posts
                  {searchByUserId && ` (filtered by User ID: ${searchByUserId})`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals remain the same - Create, Edit, Delete */}
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
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body
            </label>
            <textarea
              value={newPost.body}
              onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
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
              value={newPost.userId}
              onChange={(e) =>
                setNewPost({ ...newPost, userId: parseInt(e.target.value) })
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
              value={editPost.id}
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
              value={editPost.title}
              onChange={(e) =>
                setEditPost({ ...editPost, title: e.target.value })
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
              value={editPost.body}
              onChange={(e) =>
                setEditPost({ ...editPost, body: e.target.value })
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
              value={editPost.userId}
              onChange={(e) =>
                setEditPost({ ...editPost, userId: parseInt(e.target.value) })
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
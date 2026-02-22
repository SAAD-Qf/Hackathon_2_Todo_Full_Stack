// /**
//  * Home Page - Main Todo Application Interface
//  * Orchestrates all components and manages application state.
//  */

// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { Task, TaskInput, Priority } from '@/lib/types';
// import { createTask, getTasks, updateTask, deleteTask, toggleComplete } from '@/lib/api';
// import TaskList from './components/TaskList';
// import TaskForm from './components/TaskForm';
// import SearchBar from './components/SearchBar';
// import FilterBar from './components/FilterBar';
// import SortControls from './components/SortControls';

// export default function Home() {
//   // State
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showForm, setShowForm] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

//   // Filters and search
//   const [search, setSearch] = useState('');
//   const [status, setStatus] = useState('all');
//   const [priority, setPriority] = useState<Priority | ''>('');
//   const [tag, setTag] = useState('');
//   const [sortBy, setSortBy] = useState('created_at');
//   const [sortOrder, setSortOrder] = useState('desc');

//   // Fetch tasks with current filters
//   const fetchTasks = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await getTasks({
//         search: search || undefined,
//         status: status !== 'all' ? (status as 'completed' | 'incomplete') : undefined,
//         priority: priority || undefined,
//         tag: tag || undefined,
//         sort_by: sortBy as any,
//         sort_order: sortOrder as 'asc' | 'desc',
//       });

//       setTasks(response.tasks);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
//     } finally {
//       setLoading(false);
//     }
//   }, [search, status, priority, tag, sortBy, sortOrder]);

//   // Fetch tasks on mount and when filters change
//   useEffect(() => {
//     fetchTasks();
//   }, [fetchTasks]);

//   // Get unique tags from all tasks
//   const availableTags = Array.from(
//     new Set(tasks.flatMap(task => task.tags))
//   ).sort();

//   // Handlers
//   const handleCreateTask = async (taskData: TaskInput) => {
//     try {
//       await createTask(taskData);
//       setShowForm(false);
//       fetchTasks();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to create task');
//     }
//   };

//   const handleUpdateTask = async (taskData: TaskInput) => {
//     if (!editingTask) return;

//     try {
//       await updateTask(editingTask.id, taskData);
//       setEditingTask(undefined);
//       setShowForm(false);
//       fetchTasks();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to update task');
//     }
//   };

//   const handleDeleteTask = async (id: number) => {
//     if (!confirm('Are you sure you want to delete this task?')) return;

//     try {
//       await deleteTask(id);
//       fetchTasks();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to delete task');
//     }
//   };

//   const handleToggleComplete = async (id: number) => {
//     const task = tasks.find(t => t.id === id);
//     if (!task) return;

//     try {
//       await toggleComplete(id, !task.completed);
//       fetchTasks();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to toggle task');
//     }
//   };

//   const handleEditTask = (task: Task) => {
//     setEditingTask(task);
//     setShowForm(true);
//   };

//   const handleCancelForm = () => {
//     setShowForm(false);
//     setEditingTask(undefined);
//   };

//   const handleClearFilters = () => {
//     setStatus('all');
//     setPriority('');
//     setTag('');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 SecureTask Manager
//               </h1>
//               <p className="text-sm text-gray-600 mt-1">Professional Task Management Solution</p>
//             </div>
//             <button
//               onClick={() => setShowForm(!showForm)}
//               className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
//             >
//               {showForm ? 'Cancel' : '+ New Task'}
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//             <div className="flex items-center justify-between">
//               <span className="text-sm">{error}</span>
//               <button
//                 onClick={() => setError(null)}
//                 className="text-red-700 hover:text-red-900 ml-4"
//               >
//                 ×
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Task Form */}
//         {showForm && (
//           <div className="mb-6">
//             <TaskForm
//               task={editingTask}
//               onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
//               onCancel={handleCancelForm}
//             />
//           </div>
//         )}

//         {/* Search Bar */}
//         <div className="mb-6">
//           <SearchBar onSearch={setSearch} />
//         </div>

//         {/* Filters and Sort */}
//         <div className="mb-6 space-y-4">
//           <FilterBar
//             status={status}
//             priority={priority}
//             tag={tag}
//             availableTags={availableTags}
//             onStatusChange={setStatus}
//             onPriorityChange={setPriority}
//             onTagChange={setTag}
//             onClearFilters={handleClearFilters}
//           />

//           <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-200">
//             <div className="text-sm font-medium text-gray-700">
//               {loading ? (
//                 <span>Loading tasks...</span>
//               ) : (
//                 <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
//               )}
//             </div>
//             <SortControls
//               sortBy={sortBy}
//               sortOrder={sortOrder}
//               onSortByChange={setSortBy}
//               onSortOrderChange={setSortOrder}
//             />
//           </div>
//         </div>

//         {/* Task List */}
//         <TaskList
//           tasks={tasks}
//           loading={loading}
//           onToggleComplete={handleToggleComplete}
//           onEdit={handleEditTask}
//           onDelete={handleDeleteTask}
//         />
//       </main>

//       {/* Footer */}
//       <footer className="bg-white border-t border-gray-200 mt-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <p className="text-center text-sm text-gray-500">
//             © 2026 SecureTask Manager. Professional Task Management Solution.
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// }




// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { Task, TaskInput, Priority } from '@/lib/types';
// import { createTask, getTasks, updateTask, deleteTask, toggleComplete } from '@/lib/api';
// import TaskList from './components/TaskList';
// import TaskForm from './components/TaskForm';
// import SearchBar from './components/SearchBar';
// import FilterBar from './components/FilterBar';
// import SortControls from './components/SortControls';

// export default function Home() {
//   // ===================== STATE =====================
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showForm, setShowForm] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

//   // Filters
//   const [search, setSearch] = useState('');
//   const [status, setStatus] = useState('all');
//   const [priority, setPriority] = useState<Priority | ''>('');
//   const [tag, setTag] = useState('');
//   const [sortBy, setSortBy] = useState('created_at');
//   const [sortOrder, setSortOrder] = useState('desc');

//   // ===================== FETCH =====================
//   const fetchTasks = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await getTasks({
//         search: search || undefined,
//         status: status !== 'all' ? (status as 'completed' | 'incomplete') : undefined,
//         priority: priority || undefined,
//         tag: tag || undefined,
//         sort_by: sortBy as any,
//         sort_order: sortOrder as 'asc' | 'desc',
//       });

//       setTasks(res.tasks);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   }, [search, status, priority, tag, sortBy, sortOrder]);

//   useEffect(() => {
//     fetchTasks();
//   }, [fetchTasks]);

//   const availableTags = Array.from(new Set(tasks.flatMap(t => t.tags))).sort();

//   // ===================== UI =====================
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100">
//       {/* HEADER */}
//       <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
//         <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//               SecureTask Manager
//             </h1>
//             <p className="text-xs text-gray-500 mt-1">
//               Clean • Fast • Professional Todo System
//             </p>
//           </div>

//           <button
//             onClick={() => setShowForm(!showForm)}
//             className="px-5 py-2.5 rounded-xl font-semibold text-white
//                        bg-gradient-to-r from-indigo-600 to-purple-600
//                        hover:shadow-lg hover:scale-[1.03]
//                        transition-all"
//           >
//             {showForm ? 'Close Form' : '+ Add Task'}
//           </button>
//         </div>
//       </header>

//       {/* CONTENT */}
//       <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
//         {/* ERROR */}
//         {error && (
//           <div className="bg-red-100 border border-red-200 text-red-700 px-5 py-3 rounded-xl flex justify-between items-center">
//             <span className="text-sm">{error}</span>
//             <button onClick={() => setError(null)} className="text-lg font-bold">×</button>
//           </div>
//         )}

//         {/* FORM */}
//         {showForm && (
//           <div className="bg-white rounded-2xl shadow-xl border p-6">
//             <TaskForm
//               task={editingTask}
//               onSubmit={editingTask
//                 ? async (d) => {
//                     await updateTask(editingTask.id, d);
//                     setEditingTask(undefined);
//                     setShowForm(false);
//                     fetchTasks();
//                   }
//                 : async (d) => {
//                     await createTask(d);
//                     setShowForm(false);
//                     fetchTasks();
//                   }}
//               onCancel={() => {
//                 setEditingTask(undefined);
//                 setShowForm(false);
//               }}
//             />
//           </div>
//         )}

//         {/* SEARCH */}
//         <div className="bg-white rounded-xl shadow border p-4">
//           <SearchBar onSearch={setSearch} />
//         </div>

//         {/* FILTER + SORT */}
//         <div className="space-y-4">
//           <div className="bg-white rounded-xl shadow border p-4">
//             <FilterBar
//               status={status}
//               priority={priority}
//               tag={tag}
//               availableTags={availableTags}
//               onStatusChange={setStatus}
//               onPriorityChange={setPriority}
//               onTagChange={setTag}
//               onClearFilters={() => {
//                 setStatus('all');
//                 setPriority('');
//                 setTag('');
//               }}
//             />
//           </div>

//           <div className="flex justify-between items-center bg-white rounded-xl shadow border p-4">
//             <span className="text-sm font-medium text-gray-600">
//               {loading ? 'Loading tasks…' : `${tasks.length} Total Tasks`}
//             </span>

//             <SortControls
//               sortBy={sortBy}
//               sortOrder={sortOrder}
//               onSortByChange={setSortBy}
//               onSortOrderChange={setSortOrder}
//             />
//           </div>
//         </div>

//         {/* TASK LIST */}
//         <div className="bg-white rounded-2xl shadow-xl border p-4">
//           <TaskList
//             tasks={tasks}
//             loading={loading}
//             onToggleComplete={async (id) => {
//               const t = tasks.find(x => x.id === id);
//               if (!t) return;
//               await toggleComplete(id, !t.completed);
//               fetchTasks();
//             }}
//             onEdit={(task) => {
//               setEditingTask(task);
//               setShowForm(true);
//             }}
//             onDelete={async (id) => {
//               if (!confirm('Delete this task?')) return;
//               await deleteTask(id);
//               fetchTasks();
//             }}
//           />
//         </div>
//       </main>

//       {/* FOOTER */}
//       <footer className="mt-16 py-6 text-center text-xs text-gray-500">
//         © 2026 SecureTask Manager — Built for Hackathons & Professionals
//       </footer>
//     </div>
//   );
// }






'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Task, TaskInput, Priority } from '@/lib/types';
import { createTask, getTasks, updateTask, deleteTask, toggleComplete } from '@/lib/api';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import SortControls from './components/SortControls';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // 🌙 Dark Mode
  const [dark, setDark] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [tag, setTag] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // ===================== FETCH =====================
  const fetchTasks = useCallback(async () => {
    if (status !== 'authenticated') return;
    try {
      setLoading(true);
      setError(null);

      const res = await getTasks({
        search: search || undefined,
        status: filterStatus !== 'all' ? (filterStatus as 'completed' | 'incomplete') : undefined,
        priority: priority || undefined,
        tag: tag || undefined,
        sort_by: sortBy as any,
        sort_order: sortOrder as 'asc' | 'desc',
      });

      setTasks(res.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, priority, tag, sortBy, sortOrder, status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTasks();
    }
  }, [fetchTasks, status]);

  const availableTags = Array.from(new Set(tasks.flatMap(t => t.tags))).sort();

  // ===================== UI =====================
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100
                      dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
                      text-gray-900 dark:text-gray-100 transition-colors">

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SecureTask Manager
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Clean • Fast • Professional Todo System
              </p>
            </div>

            <div className="flex gap-3 items-center">
              {status === 'authenticated' ? (
                <>
                  <p className="text-sm">Signed in as {session.user?.email}</p>
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 rounded-xl text-sm font-semibold
                               bg-gray-200 dark:bg-slate-700
                               hover:scale-105 active:scale-95 transition"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold
                             bg-indigo-600 text-white
                             hover:scale-105 active:scale-95 transition"
                >
                  Sign in
                </button>
              )}
              {/* 🌙 Dark Mode Toggle */}
              <button
                onClick={() => setDark(!dark)}
                className="px-4 py-2 rounded-xl text-sm font-semibold
                           bg-gray-200 dark:bg-slate-700
                           hover:scale-105 active:scale-95 transition"
              >
                {dark ? '☀ Light' : '🌙 Dark'}
              </button>

              {status === 'authenticated' && (
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white
                             bg-gradient-to-r from-indigo-600 to-purple-600
                             hover:shadow-lg hover:scale-105 active:scale-95
                             transition-all"
                >
                  {showForm ? 'Close Form' : '+ Add Task'}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {status === 'authenticated' ? (
            <>
              {/* ERROR */}
              {error && (
                <div className="bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800
                                text-red-700 dark:text-red-300 px-5 py-3 rounded-xl
                                flex justify-between items-center">
                  <span className="text-sm">{error}</span>
                  <button onClick={() => setError(null)} className="text-lg font-bold">×</button>
                </div>
              )}

              {/* FORM */}
              {showForm && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 p-6">
                  <TaskForm
                    task={editingTask}
                    onSubmit={editingTask
                      ? async (d) => {
                          await updateTask(editingTask.id, d);
                          setEditingTask(undefined);
                          setShowForm(false);
                          fetchTasks();
                        }
                      : async (d) => {
                          await createTask(d);
                          setShowForm(false);
                          fetchTasks();
                        }}
                    onCancel={() => {
                      setEditingTask(undefined);
                      setShowForm(false);
                    }}
                  />
                </div>
              )}

              {/* SEARCH */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow border dark:border-slate-700 p-4">
                <SearchBar onSearch={setSearch} />
              </div>

              {/* FILTER + SORT */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow border dark:border-slate-700 p-4">
                  <FilterBar
                    status={filterStatus}
                    priority={priority}
                    tag={tag}
                    availableTags={availableTags}
                    onStatusChange={setFilterStatus}
                    onPriorityChange={setPriority}
                    onTagChange={setTag}
                    onClearFilters={() => {
                      setFilterStatus('all');
                      setPriority('');
                      setTag('');
                    }}
                  />
                </div>

                <div className="flex justify-between items-center bg-white dark:bg-slate-800
                                rounded-xl shadow border dark:border-slate-700 p-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {loading ? 'Loading tasks…' : `${tasks.length} Total Tasks`}
                  </span>

                  <SortControls
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortByChange={setSortBy}
                    onSortOrderChange={setSortOrder}
                  />
                </div>
              </div>

              {/* TASK LIST / EMPTY STATE */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 p-4">
                {!loading && tasks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-semibold">No tasks yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Add your first task and stay productive 🚀
                    </p>
                  </div>
                ) : (
                  <TaskList
                    tasks={tasks}
                    loading={loading}
                    onToggleComplete={async (id) => {
                      const t = tasks.find(x => x.id === id);
                      if (!t) return;
                      await toggleComplete(id, !t.completed);
                      fetchTasks();
                    }}
                    onEdit={(task) => {
                      setEditingTask(task);
                      setShowForm(true);
                    }}
                    onDelete={async (id) => {
                      if (!confirm('Delete this task?')) return;
                      await deleteTask(id);
                      fetchTasks();
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold">Welcome to SecureTask Manager</h2>
                <p className="mt-4">Please sign in to manage your tasks.</p>
                <button
                    onClick={() => signIn()}
                    className="mt-6 px-6 py-3 rounded-xl text-lg font-semibold
                               bg-indigo-600 text-white
                               hover:scale-105 active:scale-95 transition"
                >
                    Sign in
                </button>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="mt-16 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
          © 2026 SecureTask Manager — Built for Hackathons & Professionals
        </footer>
      </div>
    </div>
  );
}


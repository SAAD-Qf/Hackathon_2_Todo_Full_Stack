# Todo Full-Stack Frontend

Next.js frontend for Todo application with TypeScript and Tailwind CSS.

## Features

- ✅ Modern UI with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ React Server Components (Next.js App Router)
- ✅ Responsive design
- ✅ Real-time search with debouncing
- ✅ Advanced filtering (status, priority, tags)
- ✅ Flexible sorting (due date, priority, title, created date)
- ✅ CRUD operations for tasks
- ✅ Priority badges and tag chips
- ✅ Due date tracking with overdue indicators

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 3+
- **HTTP Client**: Native fetch API
- **State Management**: React hooks

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your backend API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (main app)
│   ├── globals.css          # Global styles
│   └── components/
│       ├── TaskList.tsx     # Task list container
│       ├── TaskItem.tsx     # Individual task card
│       ├── TaskForm.tsx     # Create/edit form
│       ├── SearchBar.tsx    # Search input
│       ├── FilterBar.tsx    # Filter controls
│       └── SortControls.tsx # Sort controls
├── lib/
│   ├── api.ts               # API client
│   └── types.ts             # TypeScript types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local.example
```

## Features

### Task Management

- **Create**: Add new tasks with title, description, priority, tags, and due date
- **Read**: View all tasks with filtering and sorting
- **Update**: Edit any task field
- **Delete**: Remove tasks with confirmation
- **Complete**: Toggle task completion status

### Search

- Real-time search in title and description
- Case-insensitive matching
- Debounced to reduce API calls (300ms)

### Filters

- **Status**: All / Incomplete / Completed
- **Priority**: All / High / Medium / Low
- **Tag**: Filter by specific tag
- Multiple filters work together (AND logic)

### Sorting

- **Due Date**: Earliest to latest (or reverse)
- **Priority**: High → Medium → Low (or reverse)
- **Title**: Alphabetically A→Z (or reverse)
- **Created Date**: Newest to oldest (or reverse)

## Components

### TaskList

Container component that displays a list of tasks with loading and empty states.

**Props**:
- `tasks`: Array of tasks to display
- `loading`: Loading state
- `onToggleComplete`: Handler for completion toggle
- `onEdit`: Handler for edit action
- `onDelete`: Handler for delete action

### TaskItem

Individual task card with all task details and action buttons.

**Features**:
- Priority badge with color coding
- Tag chips
- Due date with overdue indicator
- Completion checkbox
- Edit and delete buttons
- Timestamps (created/updated)

### TaskForm

Form for creating and editing tasks with validation.

**Features**:
- Title input (required, max 200 chars)
- Description textarea (optional)
- Priority dropdown
- Tags input (comma-separated, max 10)
- Due date picker (datetime-local)
- Form validation
- Character counter for title

### SearchBar

Search input with debouncing and clear button.

**Features**:
- 300ms debounce to reduce API calls
- Search icon
- Clear button when text is entered
- Placeholder text

### FilterBar

Filter controls for status, priority, and tags.

**Features**:
- Status dropdown (All/Incomplete/Completed)
- Priority dropdown (All/High/Medium/Low)
- Tag dropdown (dynamically populated)
- Clear all filters button

### SortControls

Controls for sorting tasks by different fields.

**Features**:
- Sort field dropdown
- Sort order toggle (ascending/descending)
- Visual indicators for sort direction

## API Integration

The frontend communicates with the backend via the API client (`lib/api.ts`).

All API functions are typed and handle errors gracefully:

```typescript
// Create task
await createTask({ title: 'Buy groceries', priority: 'high' });

// Get tasks with filters
await getTasks({ search: 'grocery', status: 'incomplete' });

// Update task
await updateTask(1, { title: 'Buy groceries and supplies' });

// Delete task
await deleteTask(1);

// Toggle completion
await toggleComplete(1, true);
```

## Development

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` (backend API URL)
4. Deploy

### Other Platforms

1. Build the application: `npm run build`
2. Start the server: `npm start`
3. Set `NEXT_PUBLIC_API_URL` environment variable

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (required)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

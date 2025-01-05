# Memory Lane

**Please avoid initiating pull requests on this repository or forking this repository. To submit your solution, either set up a repository on your own account or forward a zip file to the appropriate contact within our talent team.**

### Problem definition

After a series of discovery calls we found out a problem that our users are facing. They are having a hard time sharing their memories with friends and family. They are using a combination of social media, messaging apps, and email to share their memories. They are looking for a solution that allows them to store and share their memories in a single place.

As a first iteration for this solution, we want to build a web application that allows users to create a memory lane and share it with friends and family. A memory lane is a collection of events that happened in a chronological order. Each event consists of a title, a description, a timestamp, and at least one image.

## Implementation

### Tech Stack
- React with TypeScript for the frontend
- React Query for server state management
- React Hook Form for form handling
- Yup for form validation
- Tailwind CSS for styling
- REST API backend (running on port 4001)

### Backend Implementation

The backend is implemented as a RESTful API service with the following key endpoints:

1. **Authentication Endpoints**
   ```
   POST /auth/register - Register new user
   POST /auth/login    - User login
   ```

2. **Memory Management Endpoints**
   ```
   GET    /memories        - Fetch all memories for authenticated user
   POST   /memories        - Create new memory
   PUT    /memories/:id    - Update existing memory
   DELETE /memories/:id    - Delete memory
   ```

3. **Sharing Endpoints**
   ```
   POST   /share          - Generate share token
   GET    /shared/:token  - Fetch shared memories
   ```

4. **Image Upload**
   ```
   POST   /upload         - Upload images
   ```

#### Security Features
- JWT-based authentication
- Protected routes requiring valid auth tokens
- Secure share token generation for public access
- File upload validation and sanitization

### Key Features

1. **Authentication**
   - User registration and login functionality
   - Protected routes for authenticated users
   - Secure token-based authentication

2. **Memory Management**
   - Create new memories with title, description, date, and multiple images
   - View memories in a chronological timeline
   - Edit existing memories
   - Delete memories
   - Image upload support

3. **Sharing Functionality**
   - Generate shareable links for memory lanes
   - Public view for shared memories
   - Read-only access for shared links

### Architecture Highlights

- **Component Structure**
  - Modular feature-based organization (`/src/features`)
  - Reusable design components (`/src/designComponents`)
  - Custom hooks for data fetching and state management (`/src/services/hooks`)

- **State Management**
  - React Query for server state
  - Context API for authentication state
  - Local state for UI interactions

- **Routing**
  - Protected routes for authenticated users
  - Public routes for shared memories
  - Authentication page routing

### User Experience
- Beautiful and modern UI with Tailwind CSS
- Responsive design
- Loading states and error handling
- Intuitive memory timeline visualization
- Easy-to-use image upload and management
- Seamless sharing functionality

# Live Polling System (Intervue.io)

A live interactive polling system for the classroom, where teachers can create polls in real-time and students can answer live. Constructed using React 19, Node.js, and Socket.IO, it supports live results, live chat, student management, and a poll history—all perfect for increasing participation and online learning.

## 🚀 Features






### For Teachers
- **Real-time Poll Creation**: Create polls with multiple choice questions and set custom durations
- **Live Results**: View student responses in real-time with visual progress bars
- **Participant Management**: See all connected students and manage participation
- **Chat Integration**: Built-in chat system for classroom communication
- **Student Management**: Ability to remove disruptive students from the session
- **Poll History**: Access and review past polls with detailed analytics

### For Students
- **Easy Participation**: Simple name entry and one-click poll participation
- **Real-time Updates**: See live poll results and countdown timers
- **Instant Feedback**: View correct answers and performance immediately
- **Chat Access**: Communicate with teacher and classmates
- **Session Persistence**: Rejoin sessions seamlessly if disconnected

### Technical Features
- **Real-time Communication**: WebSocket-based live updates using Socket.IO
- **Responsive Design**: Modern UI built with React and TailwindCSS
- **Data Persistence**: MongoDB integration for poll history and analytics
- **Cross-platform**: Works on desktop, tablet, and mobile devices
- **Scalable Architecture**: Modular backend with RESTful API endpoints

## 🏗️ Architecture

### Backend (`lpsbackend/`)
- **Node.js** with **Express.js** framework
- **Socket.IO** for real-time bidirectional communication
- **MongoDB** with **Mongoose** ODM for data persistence
- **CORS** enabled for cross-origin requests
- **Environment-based configuration** with dotenv

### Frontend (`lpsfrontend/`)
- **React 19** with modern hooks and functional components
- **React Router** for client-side navigation
- **TailwindCSS** for responsive and modern styling
- **Socket.IO Client** for real-time communication
- **Axios** for HTTP API calls
- **Vite** for fast development and building

## 📁 Project Structure

```
Live-Polling-System/
├── lpsbackend/                 # Backend server
│   ├── index.js               # Main server entry point
│   ├── models/
│   │   └── Poll.js           # MongoDB Poll schema
│   ├── routes/
│   │   └── history.js        # Poll history API endpoints
│   ├── socket/
│   │   └── pollSocket.js     # Socket.IO event handlers
│   ├── utils/
│   │   └── database.js       # MongoDB connection utility
│   └── package.json
├── lpsfrontend/               # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ActivePoll.jsx
│   │   │   ├── ChatPopup.jsx
│   │   │   ├── PollForm.jsx
│   │   │   ├── PollResult.jsx
│   │   │   └── ...
│   │   ├── pages/           # Main application pages
│   │   │   ├── RoleSelector.jsx
│   │   │   ├── TeacherPage.jsx
│   │   │   ├── StudentPage.jsx
│   │   │   └── PollHistory.jsx
│   │   ├── utils/           # Utility functions
│   │   │   ├── api.js       # Axios API configuration
│   │   │   └── socket.js    # Socket.IO client setup
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # Application entry point
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd lpsbackend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env file in lpsbackend/
   MONGODB_URI=mongodb://localhost:27017/live_polling_system
   PORT=5000
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd lpsfrontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env file in lpsfrontend/
   VITE_BACKEND_URI=http://localhost:5000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🚀 Usage

### Starting a Session

1. **Teacher Setup:**
   - Open the application in your browser
   - Select "Teacher" role
   - Wait for students to join

2. **Student Setup:**
   - Open the application in your browser
   - Select "Student" role
   - Enter your name to join the session

### Creating and Running Polls

1. **Teacher creates a poll:**
   - Click "Create New Poll"
   - Enter the question
   - Add multiple choice options
   - Mark correct answers (optional)
   - Set poll duration
   - Click "Start Poll"

2. **Students participate:**
   - See the poll question and options
   - Select an answer within the time limit
   - View real-time results

3. **Results and Analytics:**
   - View live response counts
   - See correct answer indicators
   - Access detailed poll history

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/live_polling_system
PORT=5000
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_BACKEND_URI=http://localhost:5000
```

### MongoDB Schema

The Poll model includes:
- Question text
- Multiple choice options with correct answer flags
- Student responses with timestamps
- Poll duration and end times
- Creation and completion timestamps

## 📡 API Endpoints

### REST API
- `GET /history` - Retrieve poll history
- `POST /history` - Save completed poll

### Socket.IO Events
- `join` - Student/teacher joins session
- `create_poll` - Teacher creates new poll
- `submit_answer` - Student submits answer
- `poll_started` - Broadcast poll to all participants
- `poll_ended` - Broadcast poll results
- `chat_message` - Real-time chat messages
- `kick_student` - Teacher removes student

## 🎨 UI Components

### Core Components
- **RoleSelector**: Initial role selection interface
- **TeacherPage**: Main teacher dashboard with poll controls
- **StudentPage**: Student interface for poll participation
- **ActivePoll**: Real-time poll display with countdown
- **PollResult**: Results visualization with progress bars
- **ChatPopup**: Real-time chat interface
- **PollHistory**: Historical poll data and analytics

## 🔒 Security Features

- **Input Validation**: Server-side validation for all inputs
- **Duplicate Prevention**: Prevents multiple answers from same student
- **Session Management**: Tracks connected participants
- **Error Handling**: Graceful error handling and user feedback

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB (local or cloud)
2. Configure environment variables
3. Deploy to your preferred hosting service (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

---

**Built with ❤️ for modern education**


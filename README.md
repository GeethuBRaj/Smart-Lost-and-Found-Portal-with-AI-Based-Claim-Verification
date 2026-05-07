# Smart Lost and Found Portal with AI-Based Claim Verification

A MERN-stack web application designed to manage lost and found items efficiently through a secure and user-friendly platform. The system includes an AI-inspired claim verification module that analyzes user responses using keyword-based text processing to help validate genuine ownership claims.

##  Features
- User authentication and authorization
- Add and manage lost/found items
- Image upload support
- Search and filter functionality
- AI-inspired claim verification system
- Responsive frontend interface
- REST API-based backend architecture

## Tech Stack
- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT
- File Uploads: Multer

##  Project Structure

```bash
backend/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 └── server.js

frontend/
 ├── src/
 └── public/
```

##  Installation



### Backend setup
```bash
cd backend
npm install
npm start
```

### Frontend setup
```bash
cd frontend
npm install
npm start
```

##  AI Claim Verification Logic
The system uses keyword extraction and text similarity-based matching to compare user claim responses with stored item details. Scores are generated dynamically to identify potentially genuine claims while preventing invalid submissions.

##  Future Improvements
- Integration of NLP/ML models for advanced verification
- Real-time notifications
- Chat support between users
- Admin analytics dashboard


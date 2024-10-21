const express = require('express');
const config = require('./config.js');
const morgan = require('morgan');
const dateFormat = require('date-format');
const authRouter = require('./authentication');
const verifyAuth = require('./authentication/authMiddleware');
const coursesRouter = require('./routes/coursesRoute.js');
const teacherRouter = require('./routes/teachers.js');
const userRouter = require('./routes/usersRouter.js');
const filesRouter = require('./routes/filesRoute.js');
const courseDetailsRouter = require('./routes/lessonsRoute.js');
const langRouter = require('./routes/langRouter.js');
const shiftRouter = require('./routes/shiftRoute.js');
const messageRouter = require('./routes/messageRoute.js');
const studentsRouter = require('./routes/studentsRoute.js');
const i18nextMiddleware = require('i18next-http-middleware');
const i18next = require('./public/i18n/i18next.js');
const subjectsRouter = require('./routes/subjectsRoute.js');
const admin = require("firebase-admin");
const serviceAccount = require("./loghaty-78241-firebase-adminsdk-tsn6n-fef37af3c1.json");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path'); // Import the 'path' module


// Import the functions you need from the SDKs you need
const firebase = require("firebase/app");
const firebaseConfig = require("./firebaseConfig.js");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();

//for more information about the cors
//https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#credentialed_requests_and_wildcards
const corsOptions = {
    origin: 'http://localhost:3000',//at the production will be changed http://localhost:3000
    credentials: true,
    optionSucessStatus: 200
}

// middleware to log the incomnig requrest to the console, help to identify error & response to the client
morgan.token('time', () => dateFormat.asString(dateFormat.ISO8601_FORMAT, new Date()))
app.use(morgan('[:time] :remote-addr :method :url :status :res[content-length] :response-time ms'));

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());
app.use(i18nextMiddleware.handle(i18next));
//an router to handel register & login requests from the client
app.use('/auth', authRouter);
// verifyAuth check if the token sent by client is created by the server
//check authServices for more detail
// api in url more better : to indicate to the client that he requrest an resource through an REST API
app.use('/api/', verifyAuth);

app.use('/api/user', userRouter);
app.use('/api/user/files', filesRouter);
app.use('/api/teachers', teacherRouter);
app.use('/api/students', studentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/courseDetails', courseDetailsRouter);
app.use('/api/lang', langRouter);
app.use('/api/shift', shiftRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/message', messageRouter);

//middleware to response with error message if client requrest an unfound resource
app.use((req, res, next) => {
    res.status(404).send(req.t('notFound'));
});

app.listen(config.PORT, () => {
    console.log(`running on port ${config.PORT} `);
});
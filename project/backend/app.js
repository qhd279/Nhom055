require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const softwareRoutes = require('./routes/softwareRoutes');
const roomRoutes = require('./routes/roomRoutes');
const computerRoutes = require('./routes/computerRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use(express.json());
app.use(cors());

// Định tuyến
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/software', softwareRoutes);
app.use('/api/rooms', roomRoutes); 
app.use('/api/computers', computerRoutes);
app.use('/api/reports', reportRoutes);


// Lắng nghe server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại cổng ${PORT}`);
});

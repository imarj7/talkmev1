const mongoose = require('mongoose');

const url = `mongodb+srv://ChatApp:Sadhguru%401@atlascluster.ahuvm2o.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster`;

mongoose.connect(url, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(() => console.log('Connected to DB')).catch((e)=> console.log('Error', e))
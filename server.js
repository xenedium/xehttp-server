import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { PathExist, __rootDir, IsDir, EnumDir, ParseToHtml } from './utility.js';


const credentials = {
    key: fs.readFileSync('./certs/sorrow.live.key'),
    cert: fs.readFileSync('./certs/sorrow.live.cert')
}

const httpApp = express();          //http to https redirection
httpApp.get('*', (req, res) => {
    res.redirect(`https://sorrow.live${req.baseUrl}`);
});


const app = express();


app.get('*', (req, res) => {

    if (req.originalUrl.includes('/..')){
        res.status(403).send('FORBIDDEN');
        return;
    }
    if (!PathExist(req.originalUrl))
    {
        res.contentType('text/html');
        res.status(404).send("ERROR 404");
        return;
    }
    if (!IsDir(req.originalUrl))
    {
        res.status(200).sendFile(__rootDir + req.originalUrl);
        return;
    }
    res.send(ParseToHtml(EnumDir(req.originalUrl), req.originalUrl));
});



const httpServer = http.createServer(httpApp);
const httpsServer = https.createServer(app, credentials);

if (process.env.DEBUG) app.listen(8080);
else
{
    httpsServer.listen(443);
    httpServer.listen(80);
}
    

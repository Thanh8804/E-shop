const expressJwt = require('express-jwt');

function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/products(.*)/, method: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, method: ['GET', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register`,
            { url: /\/api-docs(.*)/, methods: ['GET', 'OPTIONS'] }
        ]
    })
}

async function isRevoked(req, payload, done) {
    if (!payload.isAdmin) {
        done(null, true)
    }

    done();
}

module.exports = authJwt;
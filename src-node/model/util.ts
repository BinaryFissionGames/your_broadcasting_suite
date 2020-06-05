//This regex is for parsing a connection string into it's parts.
//I don't think it's perfect, but it works for my purposes
const connStringRegex = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):([^/]+)\/([^?]+)/;

type ConnDetails = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

function parseMySqlConnString(connString: string) : ConnDetails {
    let match = connString.match(connStringRegex);
    if(match) {
        return {
            host: match[3],
            port: Number.parseInt(match[4]),
            user: match[1],
            password:match[2],
            database:match[5]
        }
    }

    throw new Error('Cannot parse connection string ' + connString);
}

function parseScopesArray(scopes: string) : string[] {
    let scopeArray: string[];
    if (scopes && scopes !== '') {
        scopeArray = scopes.split(' ');
    }

    if (!scopeArray) {
        scopeArray = [];
    }

    return scopeArray
}

export {
    parseMySqlConnString,
    ConnDetails,
    parseScopesArray
}
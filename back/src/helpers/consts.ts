import path from 'path';
const privileges = [
    { role: 'admin', level: 1},
    { role: 'user', level: 2}
]

const FILE_PATHS = path.join(__dirname, '../public', 'images');

export { privileges, FILE_PATHS }
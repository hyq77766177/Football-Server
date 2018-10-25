var newUsers = [
    {
        user: 'sorayama',
        pwd: 'sorayama',
        roles: [
            {
                role: 'dbOwner',
                db: 'football'
            }
        ]
    },
    {
        user: 'root',
        pwd: '123',
        roles: [
            {
                role: 'userAdminAnyDatabase',
                db: 'admin'
            }
        ]
    }
];

var currentUsers = db.getUsers();
if (currentUsers.length === newUsers.length) {
    quit();
}
db.dropAllUsers();

for (var i = 0, length = newUsers.length; i < length; ++i) {
    db.createUser(newUsers[i]);
}

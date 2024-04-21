const fs = require('fs');

exports.deletFile = (filepath) => {
    fs.unlink(filepath, (err) => {
        if (err) {
            throw (err)
        }
    })
}

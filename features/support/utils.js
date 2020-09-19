const {sep} = require('path')

exports.projectPath = () => {
    let pathArr = __dirname.split(sep)
    pathArr.pop()
    pathArr.pop()
    return pathArr.join(sep)
}



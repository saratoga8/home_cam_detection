module.exports = {
    "env": {
        "node": true,
        "es2020": true,
        "mocha": true,
    },
    "extends": ["eslint:recommended", "plugin:chai-friendly/recommended"],
    "parserOptions": {
        "ecmaVersion": 11
    },
    "rules": {
        "no-unused-expressions": 0,
        "chai-friendly/no-unused-expressions": 2
    },
    "plugins": [
    "chai-friendly"
    ]
};

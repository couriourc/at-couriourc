---
to: packages/<%= name %>/tsconfig.json
---
{
    "compilerOptions": {
        "baseUrl": "./",
        "paths": {
            "*": [
                "*",
                "index"
            ]
        },
        "moduleResolution": "NodeNext",
        "module": "NodeNext"
    }
}

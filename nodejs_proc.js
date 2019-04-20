const process = require('process')

const arg = process.argv[2]

const result = {
  fromJS: true,
  hello: "Message from JS!",
  echo: JSON.parse(arg),
}

console.log(JSON.stringify(result))

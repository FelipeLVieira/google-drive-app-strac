// jest.setup.js
import '@testing-library/jest-dom'
global.Request = class {
  constructor() {
    return {
      nextUrl: new URL('http://localhost:3000')
    }
  }
}
global.Response = class {
  constructor(body, init) {
    return {
      status: init?.status || 200,
      json: async () => JSON.parse(body)
    }
  }
}

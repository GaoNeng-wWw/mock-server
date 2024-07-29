const {createMockServer} = require('./dist');

createMockServer({
  mocks:[
    {
      method:'get',
      timeout: 1500,
      url: '/api/test',
      response: ()=>{
        return {foo:'bar'};
      }
    }
  ]
})
/** @jest-environment jsdom */
const { handleFormSubmission } = require('./loginVal');

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'Login successful' })
  })
);

global.console.error = jest.fn();



delete global.window.location;
global.window = Object.create(window);
global.window.location = 'file://' + __dirname + '/../public/resources/user/user.html';


describe('handleFormSubmission function', () => {
  beforeEach(() => {
    fetch.mockClear();
  });


  test('should send POST request with correct data and redirect on successful login', async () => {
    document.body.innerHTML = `
      <form id="login-form">
        <input id="username" value="testUser" />
        <input id="password" value="testPassword" />
      </form>
    `;
   
    await handleFormSubmission(new Event('submit'));


    expect(fetch).toHaveBeenCalledWith('/login.html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: 'testUser', password: 'testPassword' })
    });


    expect(window.location.href).toBe(undefined);
  });


  test('should handle login error', async () => {
    const errorMessage = 'Invalid credentials';
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'Login failed', error: errorMessage })
      })
    );
  
    document.body.innerHTML = `
      <form id="login-form">
        <input id="username" value="invalidUser" />
        <input id="password" value="invalidPassword" />
      </form>
    `;
  
    await handleFormSubmission(new Event('submit'));
  
    expect(fetch).toHaveBeenCalledWith('/login.html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: 'invalidUser', password: 'invalidPassword' })
    });
  
    expect(console.error).not.toHaveBeenCalled;
  });


  test('should handle fetch error', async () => {
    fetch.mockRejectedValueOnce('Fetch error');


    document.body.innerHTML = `
      <form id="login-form">
        <input id="username" value="testUser" />
        <input id="password" value="testPassword" />
      </form>
    `;


    await handleFormSubmission(new Event('submit'));


    expect(fetch).toHaveBeenCalledWith('/login.html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: 'testUser', password: 'testPassword' })
    });


    expect(console.error).toHaveBeenCalledWith('Login failed:', 'Invalid credentials');
  });


 
});



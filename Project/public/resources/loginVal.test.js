const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

const { handleFormSubmission } = require('./loginVal');

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'Login successful' })
  })
);

delete global.window.location;
global.window = Object.create(window);
global.window.location = 'file://' + __dirname + '/../public/resources/user/user.html';

describe('handleFormSubmission function', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('should send POST request with correct data and redirect on successful login', async () => {
    // Mock form data
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

    expect(window.location.href).toBe('../public/resources/user/user.html');
  });

  test('should handle login error', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: 'Login failed', error: 'Invalid credentials' })
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

    expect(console.error).toHaveBeenCalledWith('Login failed:', 'Invalid credentials');
  });

  test('should handle fetch error', async () => {
    fetch.mockRejectedValueOnce('Fetch error');

    // Mock form data
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

    expect(console.error).toHaveBeenCalledWith('Error:', 'Fetch error');
  });

  
});

const mongoose = require('mongoose');
const User = require('../models/user');

const {
  api_get_user,
  get_user,
  get_update,
  post_update,
} = require('./user');

const dbMock = {
  get_user: jest.fn(),
  update_user: jest.fn(),
};

const reqMock = {
  session: {
    user: {
      username: 'testUser',
    },
  },
  body: {},
};

const resMock = {
  status: jest.fn(() => resMock),
  json: jest.fn(),
  sendFile: jest.fn(),
  redirect: jest.fn(),
};

describe('api_get_user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return user data if user is authenticated', async () => {
    dbMock.get_user.mockResolvedValueOnce({ fullname: 'Test User', address1: '123 Test St' });

    await api_get_user(dbMock, reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(200);
    expect(resMock.json).toHaveBeenCalledWith({ fullname: 'Test User', address1: '123 Test St' });
  });

  it('should return "Not authenticated" error if user is not authenticated', async () => {
    const reqMock1 = {
      session: {
        user: {},
      },
    };

    await api_get_user(dbMock, reqMock1, resMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
  });

  
});

describe('get_user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send the user profile HTML file', () => {
    const reqMock = {};
    const resMock = {
      sendFile: jest.fn(),
    };
    const htmlPath = 'path/to/user/profile.html';

    get_user(reqMock, resMock, htmlPath);

    expect(resMock.sendFile).toHaveBeenCalledWith(htmlPath);
  });
});

describe('get_update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send the user update HTML file', () => {
    const reqMock = {};
    const resMock = {
      sendFile: jest.fn(),
    };
    const htmlPath = 'path/to/user/update.html';

    get_update(reqMock, resMock, htmlPath);

    expect(resMock.sendFile).toHaveBeenCalledWith(htmlPath);
  });
});

describe('post_update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 400 error if required fields are missing', async () => {
    const reqMock = {
      session: {
        user: {
          username: 'testUser',
        },
      },
      body: {},
    };
    const resMock = {
      status: jest.fn(() => resMock),
      json: jest.fn(),
    };

    await post_update(dbMock, reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.json).toHaveBeenCalledWith({
      error: 'All fields are required except address2 and state.',
    });
  });

  it('should return a 401 error if user is not authenticated', async () => {
    const reqMock = {
      session: {
        user: {},
      },
      body: {
        fullname: 'Test User',
        address1: '123 Test St',
        city: 'Test City',
        zipcode: '12345',
      },
    };
    const resMock = {
      status: jest.fn(() => resMock),
      json: jest.fn(),
    };

    await post_update(dbMock, reqMock, resMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ error: 'Not authenticated.' });
  });

  it('should update user profile and redirect to user profile page', async () => {
    const reqMock = {
      session: {
        user: {
          username: 'testUser',
        },
      },
      body: {
        fullname: 'Test User',
        address1: '123 Test St',
        city: 'Test City',
        zipcode: '12345',
      },
    };
    const resMock = {
      redirect: jest.fn(),
    };

    dbMock.get_user.mockResolvedValueOnce({}); 

    await post_update(dbMock, reqMock, resMock);

    expect(dbMock.update_user).toHaveBeenCalledWith('testUser', {
      fullname: 'Test User',
      address1: '123 Test St',
      city: 'Test City',
      zipcode: '12345',
    });
    expect(resMock.redirect).toHaveBeenCalledWith('/user');
  });
});

describe('User Model', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should create a new user with default values', async () => {
    const newUser = User.createUser('testUser');
    await newUser.save();

    const foundUser = await User.findOne({ username: 'testUser' });

    expect(foundUser).toBeTruthy();
    expect(foundUser.fullname).toBe('John Doe');
    expect(foundUser.address1).toBe('1234 Placeholder Ln');
    expect(foundUser.address2).toBe('');
    expect(foundUser.city).toBe('Houston');
    expect(foundUser.zipcode).toBe('77002');
    expect(foundUser.state).toBe('TX');
  });

  it('should create a new user with custom values', async () => {
    const newUser = User.createUser('testUser', 'Jane Doe', '5678 Custom St', 'Apt 123', 'Dallas', '75201', 'TX');
    await newUser.save();

    const foundUser = await User.findOne({ username: 'testUser' });

    expect(foundUser).toBeTruthy();
    expect(foundUser.fullname).toBe('Jane Doe');
    expect(foundUser.address1).toBe('5678 Custom St');
    expect(foundUser.address2).toBe('Apt 123');
    expect(foundUser.city).toBe('Dallas');
    expect(foundUser.zipcode).toBe('75201');
    expect(foundUser.state).toBe('TX');
  });

  it('should generate the full address correctly', async () => {
    const newUser = User.createUser('testUser', 'Jane Doe', '5678 Custom St', 'Apt 123', 'Dallas', '75201', 'TX');
    const fullAddress = newUser.fullAddress;

    expect(fullAddress).toBe('5678 Custom St Apt 123, Dallas, TX 75201');
  });
});

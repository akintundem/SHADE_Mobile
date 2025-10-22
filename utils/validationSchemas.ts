/**
 * Comprehensive validation schemas for all forms
 */

export const createEventValidator = {
  name: [
    { required: true, message: 'Event name is required' },
    { minLength: 3, message: 'Event name must be at least 3 characters' },
    { maxLength: 100, message: 'Event name must be less than 100 characters' }
  ],
  description: [
    { required: true, message: 'Event description is required' },
    { minLength: 10, message: 'Event description must be at least 10 characters' },
    { maxLength: 1000, message: 'Event description must be less than 1000 characters' }
  ],
  startDateTime: [
    { required: true, message: 'Start date is required' },
    { dateFormat: true, message: 'Please enter date in YYYY-MM-DD format' },
    { futureDate: true, message: 'Start date must be in the future' }
  ],
  endDateTime: [
    { dateFormat: true, message: 'Please enter date in YYYY-MM-DD format' }
  ],
  capacity: [
    { positiveNumber: true, message: 'Capacity must be a positive number' }
  ]
};

export const profileValidator = {
  name: [
    { required: true, message: 'Name is required' },
    { minLength: 2, message: 'Name must be at least 2 characters' },
    { maxLength: 50, message: 'Name must be less than 50 characters' }
  ],
  email: [
    { required: true, message: 'Email is required' },
    { email: true, message: 'Please enter a valid email address' }
  ],
  phoneNumber: [
    { phone: true, message: 'Please enter a valid phone number' }
  ],
  dateOfBirth: [
    { dateFormat: true, message: 'Please enter date in YYYY-MM-DD format' }
  ]
};

export const venueValidator = {
  name: [
    { required: true, message: 'Venue name is required' },
    { minLength: 3, message: 'Venue name must be at least 3 characters' }
  ],
  location: [
    { required: true, message: 'Location is required' },
    { minLength: 3, message: 'Location must be at least 3 characters' }
  ],
  address: [
    { required: true, message: 'Address is required' },
    { minLength: 5, message: 'Address must be at least 5 characters' }
  ],
  guestCapacity: [
    { required: true, message: 'Guest capacity is required' },
    { positiveNumber: true, message: 'Guest capacity must be a positive number' }
  ],
  contactEmail: [
    { required: true, message: 'Contact email is required' },
    { email: true, message: 'Please enter a valid email address' }
  ]
};

export const expenseValidator = {
  category: [
    { required: true, message: 'Category is required' }
  ],
  description: [
    { required: true, message: 'Description is required' },
    { minLength: 5, message: 'Description must be at least 5 characters' }
  ],
  amount: [
    { required: true, message: 'Amount is required' },
    { positiveNumber: true, message: 'Amount must be a positive number' }
  ],
  vendor: [
    { required: true, message: 'Vendor is required' },
    { minLength: 2, message: 'Vendor name must be at least 2 characters' }
  ],
  date: [
    { required: true, message: 'Date is required' },
    { dateFormat: true, message: 'Please enter date in YYYY-MM-DD format' }
  ]
};

export const invitationValidator = {
  emailList: [
    { required: true, message: 'Email list is required' },
    { minLength: 5, message: 'Please enter at least one email address' }
  ],
  customMessage: [
    { maxLength: 500, message: 'Message must be less than 500 characters' }
  ]
};

import * as Yup from 'yup';

export const loginSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const signupSchema = Yup.object({
  name: Yup.string().trim().min(2, 'Full name must be at least 2 characters').required('Full name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  acceptTerms: Yup.boolean()
    .oneOf([true], 'Please accept the Terms of Service and Privacy Policy')
    .required('Please accept the Terms of Service and Privacy Policy'),
});

export const registerSchema = Yup.object({
  name: Yup.string().trim().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s]{10,15}$/, 'Enter a valid phone number')
    .required('Phone is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: Yup.string().oneOf(['customer', 'restaurant_owner', 'delivery_partner']),
});

export const checkoutSchema = Yup.object({
  delivery_address: Yup.string().trim().min(10, 'Enter a complete delivery address').required('Address is required'),
  special_instructions: Yup.string().max(200, 'Max 200 characters'),
  payment_method: Yup.string().oneOf(['stripe', 'cash']).required('Select payment method'),
});

export const restaurantSchema = Yup.object({
  name: Yup.string().trim().min(2).required('Restaurant name is required'),
  cuisine: Yup.string().trim().required('Cuisine is required'),
  address: Yup.string().trim().min(10).required('Address is required'),
  description: Yup.string().max(500),
  phone: Yup.string().matches(/^[0-9+\-\s]{10,15}$/, 'Invalid phone'),
  email: Yup.string().email('Invalid email'),
});

export const menuItemSchema = Yup.object({
  name: Yup.string().trim().min(2).required('Item name is required'),
  description: Yup.string().max(300),
  price: Yup.number().positive('Price must be positive').required('Price is required'),
  category: Yup.string().trim().required('Category is required'),
  vegetarian: Yup.boolean(),
});

export const deliveryRateSchema = Yup.object({
  rating: Yup.number().min(1).max(5).required('Rating is required'),
  review: Yup.string().max(300),
});
